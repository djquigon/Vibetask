import type { StaticImageData } from 'next/image';
import aSpongeCharacter from './assets/characters/a-sponge.png';
import arenaAnnouncerCharacter from './assets/characters/arena-announcer.png';
import cowboyCharacter from './assets/characters/cowboy.png';
import electricCarSalesmanCharacter from './assets/characters/electric-car-salesman.png';
import imperialLegionnaireCharacter from './assets/characters/imperial-legionnaire.png';
import meeguCharacter from './assets/characters/meegu.png';
import monkCharacter from './assets/characters/monk.png';
import morganFreemanCharacter from './assets/characters/morgan-freeman.png';
import newsAnchorCharacter from './assets/characters/news-anchor.png';
import peterGriffinCharacter from './assets/characters/peter-griffin.png';
import presidentialCandidateCharacter from './assets/characters/presidential-candidate.png';
import radioHostCharacter from './assets/characters/radio-host.png';
import robotFemaleCalmCharacter from './assets/characters/robot-female-calm.png';
import robotFemalePlayfulCharacter from './assets/characters/robot-female-playful.png';
import robotMale2000Character from './assets/characters/robot-male-2000.png';
import robotMale2001Character from './assets/characters/robot-male-2001.png';
import robotMaleCreepyCharacter from './assets/characters/robot-male-creepy.png';
import robotMaleEvilCharacter from './assets/characters/robot-male-evil.png';
import robotMaleFriendlyCharacter from './assets/characters/robot-male-friendly.png';
import robotMaleOldschoolCharacter from './assets/characters/robot-male-oldschool.png';
import rohitSharmaCharacter from './assets/characters/rohit-sharma.png';
import socratesCharacter from './assets/characters/socrates.png';
import spaceMarineCharacter from './assets/characters/space-marine.png';
import spaceQueenCharacter from './assets/characters/space-queen.png';
import steveHarveyCharacter from './assets/characters/steve-harvey.png';
import taylorSwiftCharacter from './assets/characters/taylor-swift.png';
import theDarkEmperorCharacter from './assets/characters/the-dark-emperor.png';
import theJokerCharacter from './assets/characters/the-joker.png';
import upstandingCitizenCharacter from './assets/characters/upstanding-citizen.png';
import warrenBuffettCharacter from './assets/characters/warren-buffett.png';
import sleepyManCharacter from './assets/characters/sleepy-man.png';

export type AssistantVoiceOption = {
    id: string;
    name: string;
    characterImage?: StaticImageData;
};

export const ASSISTANT_VOICE_OPTIONS: AssistantVoiceOption[] = [
    {
        id: 'af77ffc672ae4a1d97ee250598ddd944',
        name: 'Robot - Male - Friendly',
        characterImage: robotMaleFriendlyCharacter,
    },
    {
        id: '271b3db7aa744ec4b311e00b288715ca',
        name: 'Space Marine',
        characterImage: spaceMarineCharacter,
    },
    {
        id: '3a97995bc55b4673b02ec87bbedb2424',
        name: 'Space Queen',
        characterImage: spaceQueenCharacter,
    },
    {
        id: '90e65eaaf50e4470b8e6d43ee6afd7d5',
        name: 'Arena Announcer',
        characterImage: arenaAnnouncerCharacter,
    },
    {
        id: 'fa049bec789c4968864a85e53dd68364',
        name: 'Stock Market Analyst',
        characterImage: warrenBuffettCharacter,
    },
    {
        id: 'fad5a5a6770e47019f566b8f8c0ff609',
        name: 'Clown',
        characterImage: theJokerCharacter,
    },
    {
        id: '3ad4d432023c47ee9e6c7805b973630a',
        name: 'Audiobook Narrator',
        characterImage: morganFreemanCharacter,
    },
    {
        id: 'ce9c96291460478ea6851049cb847d73',
        name: 'Tech Support - Male',
        characterImage: rohitSharmaCharacter,
    },
    {
        id: '0429f2b252464b88b2ab2128f084290c',
        name: 'Tech Support - Female',
        characterImage: rohitSharmaCharacter,
    },
    {
        id: '2d68791e46f34687bd1231e2086ee925',
        name: 'Electric Car Salesman',
        characterImage: electricCarSalesmanCharacter,
    },
    {
        id: '2947ec32c7e1479c8ec5628a1fc035f1',
        name: 'Greek Philosopher',
        characterImage: socratesCharacter,
    },
    {
        id: 'feb65c48a1774041960b55e1156cac39',
        name: 'Monk',
        characterImage: monkCharacter,
    },
    {
        id: '16ad95ddabdf40b1b695caa5cec14bf8',
        name: 'A Sponge',
        characterImage: aSpongeCharacter,
    },
    {
        id: '63d5460e91e2411fa2e6bf95e7456f03',
        name: 'News Anchor',
        characterImage: newsAnchorCharacter,
    },
    {
        id: '8a5a849eff184046ae6bdb9a1825165c',
        name: 'Sleepy Man',
        characterImage: sleepyManCharacter,
    },
    {
        id: 'acc8237220d8470985ec9be6c4c480a9',
        name: 'Meegu',
        characterImage: meeguCharacter,
    },
    {
        id: 'e632a33e32b442afb45d52d112d5290f',
        name: 'Gangster',
        characterImage: upstandingCitizenCharacter,
    },
    {
        id: '929adc39f2f04ae78090589ffbf79f65',
        name: 'Rap Artist',
        characterImage: taylorSwiftCharacter,
    },
    {
        id: '75e451f629a44984a2b54c26de2f9826',
        name: 'Game Show Host',
        characterImage: steveHarveyCharacter,
    },
    {
        id: '0b2e96151d67433d93891f15efc25dbd',
        name: 'Radio Host',
        characterImage: radioHostCharacter,
    },
    {
        id: 'd75c270eaee14c8aa1e9e980cc37cf1b',
        name: 'A Family Guy',
        characterImage: peterGriffinCharacter,
    },
    {
        id: '40af8e6319ef4d81aa4cf22a619553bb',
        name: 'Cowboy',
        characterImage: cowboyCharacter,
    },
    {
        id: 'cafe6bac75eb46caa839886ff445543a',
        name: 'Imperial Legionnaire',
        characterImage: imperialLegionnaireCharacter,
    },
    {
        id: '459088411d374c36ad71e0d6f05d9b67',
        name: 'The Dark Emperor',
        characterImage: theDarkEmperorCharacter,
    },
    {
        id: 'f95771a3e3f442ab87a53ed25c2edeb5',
        name: 'Presidential Candidate',
        characterImage: presidentialCandidateCharacter,
    },
    {
        id: '48ba075d2240437aa5433ccee7fecfc3',
        name: 'Robot - Male - Creepy',
        characterImage: robotMaleCreepyCharacter,
    },
    {
        id: '3f4d5082bec54ea89345b141dd254633',
        name: 'Robot - Male - Evil',
        characterImage: robotMaleEvilCharacter,
    },
    {
        id: 'abde9e336a2c4125a47c008e8206dddd',
        name: 'Robot - Female - Playful',
        characterImage: robotFemalePlayfulCharacter,
    },
    {
        id: '439895c3270543439da5da1532a5d21b',
        name: 'Robot - Female - Calm',
        characterImage: robotFemaleCalmCharacter,
    },
    {
        id: '6b8274810fde4572b151d9365e021321',
        name: 'Robot - Male - 2000',
        characterImage: robotMale2000Character,
    },
    {
        id: '9448934a82f7456f875c445f218e62cb',
        name: 'Robot - Male - 2001',
        characterImage: robotMale2001Character,
    },
    {
        id: '6981ed38ce504d3ca6440e3512d1d536',
        name: 'Robot - Male - Oldschool',
        characterImage: robotMaleOldschoolCharacter,
    },
];

export const DEFAULT_ASSISTANT_VOICE_ID = ASSISTANT_VOICE_OPTIONS[0].id;
