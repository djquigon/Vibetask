'use client';

import { useContext } from 'react';

import { CurrentUserContext } from '../components/current-user-provider';

export function useCurrentUser() {
    const currentUser = useContext(CurrentUserContext);

    if (currentUser === undefined) {
        throw new Error('useCurrentUser must be used within CurrentUserProvider.');
    }

    return currentUser;
}
