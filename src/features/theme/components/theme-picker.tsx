'use client';

import { useEffect, useState, useTransition } from 'react';

import { updateTheme } from '../server/actions';
import { THEME_OPTIONS, type Theme } from '../types';

type ThemePickerProps = {
    initialTheme: Theme;
};

export function ThemePicker({ initialTheme }: ThemePickerProps) {
    const [selectedTheme, setSelectedTheme] = useState(initialTheme);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        document.documentElement.dataset.theme = selectedTheme;
    }, [selectedTheme]);

    function selectTheme(theme: Theme) {
        if (theme === selectedTheme || isPending) {
            return;
        }

        const previousTheme = selectedTheme;
        setSelectedTheme(theme);
        setError(null);

        startTransition(async () => {
            try {
                await updateTheme(theme);
            } catch {
                setSelectedTheme(previousTheme);
                setError('Unable to save your color theme. Please try again.');
            }
        });
    }

    return (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {THEME_OPTIONS.map((theme) => {
                const isSelected = selectedTheme === theme.id;

                return (
                    <button
                        aria-pressed={isSelected}
                        className={`rounded-md border p-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-vt-green disabled:cursor-not-allowed disabled:opacity-60 ${
                            isSelected
                                ? 'border-vt-green bg-vt-green-surface'
                                : 'border-vt-border bg-vt-background hover:border-vt-border-strong'
                        }`}
                        disabled={isPending}
                        key={theme.id}
                        onClick={() => selectTheme(theme.id)}
                        type="button"
                    >
                        <div className="flex items-center justify-between gap-3">
                            <span className="font-mono text-sm font-black uppercase text-vt-text">
                                {theme.name}
                            </span>
                            {isSelected ? (
                                <span className="font-mono text-xs font-black uppercase text-vt-green">
                                    Active
                                </span>
                            ) : null}
                        </div>
                        <span className="mt-4 flex overflow-hidden rounded-sm border border-vt-border">
                            {theme.swatches.map((swatch) => (
                                <span
                                    aria-hidden="true"
                                    className="h-8 flex-1"
                                    key={swatch}
                                    style={{ backgroundColor: swatch }}
                                />
                            ))}
                        </span>
                    </button>
                );
            })}
            {error ? (
                <p className="font-mono text-sm text-vt-red">{error}</p>
            ) : null}
        </div>
    );
}
