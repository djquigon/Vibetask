export type AssistantVoiceOption = {
    id: string;
    name: string;
};

export const ASSISTANT_VOICE_OPTIONS: AssistantVoiceOption[] = [
    {
        id: '271b3db7aa744ec4b311e00b288715ca',
        name: 'Space Marine',
    },
    {
        id: '90e65eaaf50e4470b8e6d43ee6afd7d5',
        name: 'Arena Announcer',
    },
    {
        id: 'fa049bec789c4968864a85e53dd68364',
        name: 'Warren Buffett',
    },
    {
        id: 'fad5a5a6770e47019f566b8f8c0ff609',
        name: 'The Joker',
    },
    {
        id: '3ad4d432023c47ee9e6c7805b973630a',
        name: 'Morgan Freeman',
    },
    {
        id: '0429f2b252464b88b2ab2128f084290c',
        name: 'Rohit Sharma',
    },
    {
        id: '2d68791e46f34687bd1231e2086ee925',
        name: 'Elon Musk',
    },
    {
        id: '2947ec32c7e1479c8ec5628a1fc035f1',
        name: 'Socrates',
    },
    {
        id: 'feb65c48a1774041960b55e1156cac39',
        name: 'Monk',
    },
    {
        id: '8a5a849eff184046ae6bdb9a1825165c',
        name: 'Sleepy',
    },
    {
        id: '75e451f629a44984a2b54c26de2f9826',
        name: 'Steve Harvey',
    },
    {
        id: '0b2e96151d67433d93891f15efc25dbd',
        name: 'Trapaholics',
    },
    {
        id: 'd75c270eaee14c8aa1e9e980cc37cf1b',
        name: 'Peter Griffin',
    },
];

export const DEFAULT_ASSISTANT_VOICE_ID = ASSISTANT_VOICE_OPTIONS[0].id;
