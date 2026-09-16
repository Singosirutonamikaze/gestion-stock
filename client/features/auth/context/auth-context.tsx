'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { useRouter } from 'next/navigation';
import { User } from '../../../types/api/api.types';
import { UserRole } from '../../../types/enums/enums';
import {
  getStoredToken,
  getStoredUser,
  setSession,
  clearSession,
} from '../../../lib/auth/session';
import {
  getDefaultDashboardPath,
  hasRole,
} from '../../../lib/auth/permissions';

/**
 * Interface du contexte d'authentification utilisateur.
 */
export interface AuthContextType {
  readonly user: User | null;
  readonly token: string | null;
  readonly isAuthenticated: boolean;
  readonly isLoading: boolean;
  readonly login: (
    token: string,
    user: User,
    refreshToken?: string,
  ) => void;
  readonly logout: () => void;
  readonly canAccess: (allowedRoles?: readonly UserRole[]) => boolean;
}

/**
 * Propriétés du composant AuthProvider.
 */
export interface AuthProviderProps {
  readonly children: React.ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Fournisseur de contexte gérant l'état global d'authentification et de session.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 * @param {Readonly<AuthProviderProps>} props - Propriétés du fournisseur
 * @returns {React.JSX.Element} Fournisseur de contexte React
 */
export function AuthProvider({
  children,
}: Readonly<AuthProviderProps>): React.JSX.Element {
  const [token, setToken] = useState<string | null>(getStoredToken);
  const [user, setUser] = useState<User | null>(getStoredUser);
  const router = useRouter();

  const login = useCallback(
    (newToken: string, newUser: User, refreshToken?: string) => {
      setSession(newToken, newUser, refreshToken);
      setToken(newToken);
      setUser(newUser);
      const defaultPath = getDefaultDashboardPath(newUser.role);
      router.push(defaultPath);
    },
    [router],
  );

  const logout = useCallback(() => {
    clearSession();
    setToken(null);
    setUser(null);
    router.push('/login');
  }, [router]);

  const canAccess = useCallback(
    (allowedRoles?: readonly UserRole[]) => {
      return hasRole(user?.role, allowedRoles as UserRole[]);
    },
    [user],
  );

  const contextValue = useMemo<AuthContextType>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isLoading: false,
      login,
      logout,
      canAccess,
    }),
    [user, token, login, logout, canAccess],
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook personnalisé permettant d'accéder au contexte d'authentification.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 * @throws {Error} Si utilisé en dehors de AuthProvider
 * @returns {AuthContextType} État et méthodes d'authentification
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
