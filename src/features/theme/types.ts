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
        id: 'sunrise',
        name: 'Sunrise',
        swatches: ['#fff9ed', '#39aaa5', '#267b4d', '#f9e1a2'],
    },
    {
        id: 'studio',
        name: 'Studio',
        swatches: ['#f4fbf9', '#eb81b0', '#2e8a53', '#62c7c3'],
    },
] as const;

export type Theme = (typeof THEME_OPTIONS)[number]['id'];

export function isTheme(value: string | undefined): value is Theme {
    return THEME_OPTIONS.some((theme) => theme.id === value);
}
