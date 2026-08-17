// src/auth.ts — Supabase authentication module

import { createClient, type User, type Session, type AuthChangeEvent, type AuthError } from '@supabase/supabase-js';

// Browser-safe public credentials (anon key, not service-role)
const SUPABASE_URL = 'https://qzunabrdemvyruvaozer.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6dW5hYnJkZW12eXJ1dmFvemVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5NDU3MDgsImV4cCI6MjEwMjUyMTcwOH0.cE3JVKZt0Y0EO5nS1SdEimVljdudfzKhS2mHhoH0wng';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export interface AuthState {
  user: User | null;
  loading: boolean;
  authenticated: boolean;
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('getCurrentUser error:', error);
      return null;
    }
    return user;
  } catch (err) {
    console.error('getCurrentUser exception:', err);
    return null;
  }
}

export async function getSession(): Promise<Session | null> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('getSession error:', error);
      return null;
    }
    return session;
  } catch (err) {
    console.error('getSession exception:', err);
    return null;
  }
}

export async function signUp(email: string, password: string): Promise<{ user: User | null; error: AuthError | null }> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error('signUp error:', error);
      return { user: null, error };
    }

    return { user: data.user, error: null };
  } catch (err) {
    console.error('signUp exception:', err);
    const errorMessage = err instanceof Error ? err.message : 'Network error: Failed to connect to authentication server';
    return {
      user: null,
      error: {
        message: errorMessage,
        name: 'NetworkError',
        status: 0,
      } as AuthError
    };
  }
}

export async function signIn(email: string, password: string): Promise<{ user: User | null; error: AuthError | null }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('signIn error:', error);
      return { user: null, error };
    }

    return { user: data.user, error: null };
  } catch (err) {
    console.error('signIn exception:', err);
    const errorMessage = err instanceof Error ? err.message : 'Network error: Failed to connect to authentication server';
    return {
      user: null,
      error: {
        message: errorMessage,
        name: 'NetworkError',
        status: 0,
      } as AuthError
    };
  }
}

export async function signOut(): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('signOut error:', error);
    }
    return { error };
  } catch (err) {
    console.error('signOut exception:', err);
    return {
      error: {
        message: err instanceof Error ? err.message : 'Sign out failed',
        name: 'SignOutError',
        status: 0,
      } as AuthError
    };
  }
}

export async function resetPassword(email: string): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}`,
    });

    if (error) {
      console.error('resetPassword error:', error);
    }

    return { error };
  } catch (err) {
    console.error('resetPassword exception:', err);
    return {
      error: {
        message: err instanceof Error ? err.message : 'Password reset failed',
        name: 'PasswordResetError',
        status: 0,
      } as AuthError
    };
  }
}

export function onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
  return supabase.auth.onAuthStateChange(callback);
}

