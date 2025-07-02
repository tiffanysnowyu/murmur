import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';

type User = {
  id: string;
  name?: string;
  email?: string;
  photo?: string;
} | null;

type AuthContextType = {
  user: User;
  isLoading: boolean;
  signIn: (userData: any) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from secure storage on app start
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userJson = await SecureStore.getItemAsync('user');
        if (userJson) {
          setUser(JSON.parse(userJson));
        }
      } catch (error) {
        console.error('Failed to load user', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const signIn = async (userData: any) => {
    try {
      const userToStore = {
        id: userData.id,
        name: userData.name || userData.fullName?.givenName,
        email: userData.email,
        photo: userData.photo || userData.picture,
      };
      
      await SecureStore.setItemAsync('user', JSON.stringify(userToStore));
      setUser(userToStore);
    } catch (error) {
      console.error('Failed to sign in', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await SecureStore.deleteItemAsync('user');
      setUser(null);
    } catch (error) {
      console.error('Failed to sign out', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
