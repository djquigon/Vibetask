export const THEME_COOKIE_NAME = 'vibetask-theme';

export const THEME_OPTIONS = [
    {
        id: 'default',
        name: 'Default',
        swatches: ['#08110f', '#ff7b39', '#50d678', '#f5bf76'],
    },
    {
        id: 'signal',
        name: 'Signal',
        swatches: ['#091516', '#46d6d2', '#92e85b', '#ff6f4a'],
    },
    {
        id: 'ember',
        name: 'Ember',
        swatches: ['#1d1013', '#ed5e93', '#77d5a3', '#f0bb5f'],
    },
    {
        id: 'carbon',
        name: 'Carbon',
        swatches: ['#111413', '#d6cf54', '#a1d46a', '#55c7bd'],
    },
    {
        id: 'neon',
        name: 'Neon',
        swatches: ['#101116', '#f562ce', '#47dfd5', '#f2df64'],
    },
    {
        id: 'midnight',
        name: 'Midnight',
        swatches: ['#0a1222', '#6f9dff', '#57d7b7', '#ffc766'],
    },
    {
        id: 'crimson',
        name: 'Crimson',
        swatches: ['#201014', '#e85b63', '#64d6b3', '#f4bd5c'],
    },
    {
        id: 'radio',
        name: 'Radio',
        swatches: ['#0c1b20', '#5cc8f0', '#a0de64', '#f5cc62'],
    },
    {
        id: 'matrix',
        name: 'Matrix',
        swatches: ['#111a12', '#81d66a', '#73ddc0', '#d1bf67'],
    },
    {
        id: 'monochrome',
        name: 'Monochrome',
        swatches: ['#101010', '#f0f0f0', '#a8a8a8', '#555555'],
    },
    {
        id: 'sunrise',
        name: 'Sunrise',
        swatches: ['#fff9ed', '#39aaa5', '#267b4d', '#f9e1a2'],
    },
    {
        id: 'studio',
        name: 'Studio',
        swatches: ['#f4fbf9', '#eb81b0', '#2e8a53', '#62c7c3'],
    },
    {
        id: 'orchard',
        name: 'Orchard',
        swatches: ['#f7fbf1', '#5faa50', '#278b68', '#c59b37'],
    },
    {
        id: 'glacier',
        name: 'Glacier',
        swatches: ['#f5faff', '#7d9df0', '#218d82', '#c79939'],
    },
    {
        id: 'cloud',
        name: 'Cloud',
        swatches: ['#f7fbfd', '#4d80a0', '#2f856f', '#bc8a26'],
    },
    {
        id: 'rose',
        name: 'Rose',
        swatches: ['#fff8fa', '#ce4f7c', '#248877', '#be8b29'],
    },
] as const;

export type Theme = (typeof THEME_OPTIONS)[number]['id'];

export function isTheme(value: string | undefined): value is Theme {
    return THEME_OPTIONS.some((theme) => theme.id === value);
}
