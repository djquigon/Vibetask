const test = require('node:test');
const assert = require('node:assert/strict');
const load = require('./load-ts.cjs');
const logic = load('src/features/planning/logic.ts');
const taskValidation = load('src/features/tasks/validation.ts');
const validation = load('src/features/planning/validation.ts', { '@/features/tasks/validation': taskValidation });
const id = (n) => '10000000-0000-0000-0000-' + String(n).padStart(12, '0');
const task = (n, extra={}) => ({ id:id(n), title:'Task '+n, status:'todo', priority:'normal', dueDate:null, projectId:null, parentId:null, estimatedMinutes:null, createdAt:'2026-10-01', ...extra });
test('calendar work blocks link to their dated daily plan without changing task deadlines', () => {
 const calendar=load('src/features/calendar/events.ts');
 const own=task(1,{dueDate:'2099-10-02'});
 const plan={id:id(9),date:'2099-10-01',items:[{taskId:own.id,title:own.title,start:'2099-10-01T12:00:00Z',end:'2099-10-01T12:30:00Z'}]};
 const events=calendar.connectedCalendarEvents([], [own],false,[plan]);
 assert.equal(events.length,2);
 assert.equal(events.find(e=>e.extendedProps.kind==='task').start,'2099-10-02');
 const block=events.find(e=>e.extendedProps.kind==='block');
 assert.equal(block.allDay,false);assert.equal(block.url,'/dashboard/planning?date=2099-10-01');
 assert.equal(block.end,'2099-10-01T12:30:00Z');
});
test('assistant drafts daily plans and task splits without executing either, and rejects foreign IDs', async () => {
 let output=[];let options;
 const own=task(1,{estimatedMinutes:30,dueDate:'2099-10-01'});
 const planning={timezone:'UTC',today:'2099-10-01',plans:[]};
 const chat=load('src/features/assistant/server/chat.ts',{
  'node:crypto':require('node:crypto'),
  '@/lib/openai/server':{openai:{responses:{create:async(input)=>{options=input;return {output,output_text:''};}}}},
  '@/lib/env/server':{serverEnv:{openAiModel:'test'}},
  '@/features/assistant/moods':{getAssistantMoodOption:()=>({name:'Balanced',openAiInstructions:''})},
  '@/features/profile/server/queries':{getCurrentUserAssistantPreferences:async()=>({assistantContext:null,assistantMood:'balanced'})},
  '@/features/tasks/server/queries':{loadTasksForPage:async()=>({status:'ready',tasks:[own]})},
  '@/features/tasks/validation':taskValidation,
  '@/features/projects/server/queries':{listProjects:async()=>[]},
  '@/features/projects/validation':load('src/features/projects/validation.ts'),
  '@/features/planning/server/queries':{loadPlanningData:async()=>planning},
  '@/features/planning/logic':logic,'@/features/planning/validation':validation,
 });
 output=[{type:'function_call',name:'propose_daily_plan',arguments:JSON.stringify({date:'2099-10-01',budgetMinutes:45,items:[{taskId:own.id,start:null,end:null}]})}];
 const proposed=await chat.createAssistantChatResponse('Plan my day');
 assert.equal(proposed.actions[0].requiresConfirmation,true);
 assert.equal(proposed.actions[0].type,'plan_day');
 assert.equal(proposed.actions[0].data.plans[0].items[0].estimate.minutes,30);
 assert.match(options.input[0].content,/estimated|estimate/);
 assert.equal(options.parallel_tool_calls,false);
 output=[{type:'function_call',name:'propose_split_task',arguments:JSON.stringify({parentId:own.id,children:[{title:'First step',description:'',estimatedMinutes:15}]})}];
 const split=await chat.createAssistantChatResponse('Split that task');
 assert.equal(split.actions[0].requiresConfirmation,true);assert.equal(split.actions[0].parentId,own.id);
 assert.equal(taskValidation.taskId(split.actions[0].children[0].id),split.actions[0].children[0].id);
 output=[{type:'function_call',name:'propose_daily_plan',arguments:JSON.stringify({date:'2099-10-01',budgetMinutes:45,items:[{taskId:id(99),start:null,end:null}]})}];
 await assert.rejects(chat.createAssistantChatResponse('Plan'),/unavailable/);
 output=[{type:'function_call',name:'propose_split_task',arguments:JSON.stringify({parentId:id(99),children:[{title:'Attack',description:'',estimatedMinutes:15}]})}];
 await assert.rejects(chat.createAssistantChatResponse('Split'),/unavailable/);
});
test('planning validation rejects duplicate tasks, invalid budgets, dates, zones, and blocks', () => {
 const input={date:'2099-10-01',timezone:'America/New_York',budgetMinutes:90,revision:0,items:[{taskId:id(1),start:null,end:null}]};
 assert.equal(validation.parsePlanInput(input).items.length,1);
 for(const value of [{...input,date:'2099-02-30'},{...input,timezone:'Other'},{...input,budgetMinutes:-1},{...input,budgetMinutes:1.5},{...input,items:[...input.items,...input.items]},{...input,items:[{taskId:id(1),start:'2099-10-01T12:00:00Z',end:null}]}]) assert.throws(()=>validation.parsePlanInput(value));
 assert.throws(()=>validation.parseSplitChildren([{id:id(1),title:'Work',description:'',estimatedMinutes:0}]));
});
test('estimates flag partial totals; candidates prioritize deadlines, importance and fit without duplicate parents', () => {
 const tasks=[task(1,{estimatedMinutes:100}),task(2,{parentId:id(1),estimatedMinutes:30}),task(3,{parentId:id(1)}),task(4,{dueDate:'2026-10-02',estimatedMinutes:20,priority:'low'}),task(5,{priority:'high',estimatedMinutes:15}),task(6,{status:'done'}),task(7,{archivedAt:'2026-10-01'})];
 assert.deepEqual(logic.taskEstimate(tasks[0],tasks),{minutes:30,unknown:1});
 assert.deepEqual(logic.planningCandidates(tasks,[]).map(x=>x.id),[id(4),id(5),id(2),id(3)]);
 assert.deepEqual(logic.suggestedTasks(tasks,[],35).map(x=>x.id),[id(4),id(5),id(3)]);
 const items=[{taskId:id(2),title:'A',estimate:{minutes:30,unknown:0},start:'2099-10-01T12:00:00Z',end:'2099-10-01T12:45:00Z'},{taskId:id(3),title:'B',estimate:{minutes:0,unknown:1},start:'2099-10-01T12:30:00Z',end:'2099-10-01T13:00:00Z'}];
 assert.deepEqual(logic.planTotals(items),{estimated:30,unknown:1,scheduled:75});
 assert.deepEqual(logic.overlaps(items),['A overlaps B']);
 assert.equal(logic.dateInZone('America/New_York',new Date('2026-10-02T01:00:00Z')),'2026-10-01');
});
test('work blocks use the selected timezone and reject ambiguous or nonexistent DST times', async () => {
 const temporal=await import('temporal-polyfill');
 const scheduling=load('src/features/planning/scheduling.ts',{'temporal-polyfill':temporal});
 assert.equal(scheduling.scheduledInstant('2026-10-01T09:00','America/New_York'),'2026-10-01T13:00:00Z');
 assert.equal(scheduling.scheduledLocal('2026-10-01T13:00:00Z','America/New_York'),'2026-10-01T09:00');
 assert.throws(()=>scheduling.scheduledInstant('2026-03-08T02:30','America/New_York'));
 assert.throws(()=>scheduling.scheduledInstant('2026-11-01T01:30','America/New_York'));
});
test('planning actions authenticate and do not accept client ownership or fabricated snapshots', async () => {
 let signedIn=false; const calls=[];
 const actions=load('src/features/planning/server/actions.ts',{
  'next/cache':{revalidatePath(){}},'../validation':validation,'@/features/tasks/validation':taskValidation,
  '@/lib/supabase/server':{createServerSupabaseClient:async()=>({auth:{getUser:async()=>({data:{user:signedIn?{id:'owner'}:null},error:null})},rpc:async(name,args)=>{calls.push([name,args]);return {error:null};}})},
 });
 const input={date:'2099-10-01',timezone:'UTC',budgetMinutes:30,revision:0,userId:'attacker',items:[{taskId:id(1),start:null,end:null,title:'Fake',status:'done'}]};
 assert.equal((await actions.saveDailyPlan(input)).status,'error'); assert.equal(calls.length,0);
 signedIn=true;assert.equal((await actions.saveDailyPlan(input)).status,'success');
 assert.deepEqual(calls[0][1].p_items,[{taskId:id(1),start:null,end:null}]);assert.equal(calls[0][1].userId,undefined);
 await actions.splitTask(id(1),[{id:id(2),title:'Child',description:'',estimatedMinutes:15}]);
 assert.equal(calls[1][0],'split_task');
});
