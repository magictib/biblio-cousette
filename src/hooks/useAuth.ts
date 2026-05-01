'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUsername } from '@/lib/auth';

export interface AuthUser {
  uid: string;
  username: string;
  firebaseUser: User;
}

export function useAuth(): {
  authUser: AuthUser | null;
  loading: boolean;
  setUsername: (name: string) => void;
} {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const username = await getUsername(user.uid);
        setAuthUser({ uid: user.uid, username: username ?? 'utilisateur', firebaseUser: user });
      } else {
        setAuthUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const setUsername = (name: string) => {
    setAuthUser(prev => prev ? { ...prev, username: name } : null);
  };

  return { authUser, loading, setUsername };
}
