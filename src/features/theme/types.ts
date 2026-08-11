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
        id: 'sunrise',
        name: 'Sunrise',
        swatches: ['#fff9ed', '#cf5a2b', '#267b4d', '#f9e1a2'],
    },
    {
        id: 'studio',
        name: 'Studio',
        swatches: ['#f4fbf9', '#cf5d44', '#2e8a53', '#62c7c3'],
    },
] as const;

export type Theme = (typeof THEME_OPTIONS)[number]['id'];

export function isTheme(value: string | undefined): value is Theme {
    return THEME_OPTIONS.some((theme) => theme.id === value);
}
