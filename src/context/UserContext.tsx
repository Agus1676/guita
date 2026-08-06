import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  name: string;
  email: string;
  avatarEmoji: string;
  hasCompletedOnboarding: boolean;
}

interface UserContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (name: string, email: string, avatarEmoji?: string) => Promise<void>;
  updateUser: (name: string, avatarEmoji: string) => Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

const UserContext = createContext<UserContextType | null>(null);

const STORAGE_KEY = 'guita_user_session_v1';

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setUser(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Error loading user session', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (name: string, email: string, avatarEmoji?: string) => {
    const newUser: UserProfile = {
      name: name || 'Aguss',
      email: email || 'aguss@guita.app',
      avatarEmoji: avatarEmoji || '🚀',
      hasCompletedOnboarding: true,
    };
    setUser(newUser);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
  };

  const updateUser = async (name: string, avatarEmoji: string) => {
    if (!user) return;
    const updated: UserProfile = {
      ...user,
      name: name || user.name,
      avatarEmoji: avatarEmoji || user.avatarEmoji || '🚀',
    };
    setUser(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
  };

  const completeOnboarding = async () => {
    if (user) {
      const updated = { ...user, hasCompletedOnboarding: true };
      setUser(updated);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  };

  return (
    <UserContext.Provider value={{ user, isLoading, login, updateUser, logout, completeOnboarding }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}
