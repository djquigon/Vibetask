'use client';

import { createContext, type ReactNode } from 'react';

import type { CurrentUserProfile } from '../types';

export const CurrentUserContext = createContext<CurrentUserProfile | null | undefined>(
    undefined
);

type CurrentUserProviderProps = {
    currentUser: CurrentUserProfile | null;
    children: ReactNode;
};

export function CurrentUserProvider({
    currentUser,
    children,
}: CurrentUserProviderProps) {
    return (
        <CurrentUserContext.Provider value={currentUser}>
            {children}
        </CurrentUserContext.Provider>
    );
}
