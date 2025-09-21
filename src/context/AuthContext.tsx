// src/context/AuthContext.tsx
import * as SecureStore from 'expo-secure-store';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { router, useRouter } from 'expo-router';

type User = {
  name: string;
  email: string;
  avatar?: string;
  role: string;
  status: string;
  facilityID: string;
  fabricEnrollmentID: string;
};

// Định nghĩa kiểu
interface AuthContextType {
  login: (token: string) => void;
  logout: () => void;
  setUserProfile: (user: User | null) => Promise<void>;
  userToken: string | null;
  user: User | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        setUserToken(token);
      } catch (e) {
        console.error('Failed to load token', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadToken();
  }, []);

  const login = async (token: string) => {
    setUserToken(token);
    await SecureStore.setItemAsync('userToken', token);
  };

  const setUserProfile = async (user: User | null) => {
    setUser(user);
    await SecureStore.setItemAsync('userProfile', JSON.stringify(user));
  };

  const logout = async () => {
    setUserToken(null);
    await SecureStore.deleteItemAsync('userToken');
    router.replace('/login');
  };

  return (
    <AuthContext.Provider value={{ login, setUserProfile, logout, userToken, isLoading, user }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook để sử dụng context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
