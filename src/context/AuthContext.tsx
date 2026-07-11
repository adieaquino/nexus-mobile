// src/context/AuthContext.tsx
// Real token persistence via AsyncStorage, not in-memory-only (survives app restart).

import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as api from '../api/client';

interface AuthState {
  token: string | null;
  userId: string | null;
  email: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

const STORAGE_KEY = 'nexus_auth_token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(stored => {
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as { token: string; userId: string; email: string };
          setToken(parsed.token);
          setUserId(parsed.userId);
          setEmail(parsed.email);
        } catch {
          // corrupted storage — ignore, user will need to sign in again
        }
      }
      setLoading(false);
    });
  }, []);

  async function persist(t: string, uid: string, em: string) {
    setToken(t);
    setUserId(uid);
    setEmail(em);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ token: t, userId: uid, email: em }));
  }

  async function signIn(emailInput: string, password: string) {
    const res = await api.login(emailInput, password);
    await persist(res.token, res.user.id, res.user.email);
  }

  async function signUp(emailInput: string, password: string, name?: string) {
    const res = await api.register(emailInput, password, name);
    await persist(res.token, res.user.id, res.user.email);
  }

  async function signOut() {
    setToken(null);
    setUserId(null);
    setEmail(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }

  return (
    <AuthContext.Provider value={{ token, userId, email, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
