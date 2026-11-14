import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import {
  getStoredAccessToken,
  removeStoredAccessToken,
  registerWithEmailPassword,
  signInWithEmailPassword,
} from '@/services/auth';
import { getErrorMessage } from '@/utils/errors';

type AuthContextValue = {
  accessToken: string | null;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: React.PropsWithChildren) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getStoredAccessToken()
      .then(setAccessToken)
      .catch((cause: unknown) => setError(getErrorMessage(cause)))
      .finally(() => setIsLoading(false));
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const response = await signInWithEmailPassword(email, password);
    setAccessToken(response.access_token);
    setError(null);
  }, []);

  const register = useCallback(async (
    name: string,
    email: string,
    password: string,
  ) => {
    const response = await registerWithEmailPassword(name, email, password);
    setAccessToken(response.access_token);
    setError(null);
  }, []);

  const signOut = useCallback(async () => {
    await removeStoredAccessToken();
    setAccessToken(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);
  const value = useMemo(
    () => ({
      accessToken,
      isLoading,
      error,
      signIn,
      register,
      signOut,
      clearError,
    }),
    [accessToken, isLoading, error, signIn, register, signOut, clearError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}
