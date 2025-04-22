import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import * as SecureStore from 'expo-secure-store';
import { useRouter, useSegments } from 'expo-router';
import { Platform } from 'react-native';

interface User {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string;
  stats?: {
    puzzlesCreated: number;
    puzzlesCompleted: number;
    totalPoints: number;
  };
}

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  signIn: (credentials: { email: string; password: string }) => Promise<{ data?: any; error?: any }>;
  signUp: (credentials: { email: string; password: string; username: string }) => Promise<{ data?: any; error?: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ data?: any; error?: any }>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  loading: true,
  signIn: async () => ({ error: new Error('Not implemented') }),
  signUp: async () => ({ error: new Error('Not implemented') }),
  signOut: async () => {},
  resetPassword: async () => ({ error: new Error('Not implemented') }),
  updateProfile: async () => {},
});

// For Web: Use localStorage instead of SecureStore
const tokenStorage = {
  async getItem(key: string) {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
  async setItem(key: string, value: string) {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    return SecureStore.setItemAsync(key, value);
  },
  async removeItem(key: string) {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    return SecureStore.deleteItemAsync(key);
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  // Effect to set up auth state listener
  useEffect(() => {
    // Initialize with stored user if available
    const initializeAuth = async () => {
      try {
        // Try to get stored session
        const session = await supabase.auth.getSession();
        
        if (session?.data?.session?.user) {
          const userData = await getUserProfile(session.data.session.user.id);
          setUser(userData);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const userData = await getUserProfile(session.user.id);
        setUser(userData);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    // Cleanup subscription
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Effect to handle protected routes
  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';
    
    if (!user && !inAuthGroup) {
      // Redirect to login if not logged in and not in auth group
      router.replace('/login');
    } else if (user && inAuthGroup) {
      // Redirect to home if logged in and in auth group
      router.replace('/');
    }
  }, [user, loading, segments]);

  // Function to get user profile data
  const getUserProfile = async (userId: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        return {
          id: data.id,
          email: data.email,
          username: data.username,
          avatarUrl: data.avatar_url,
          stats: data.stats || {
            puzzlesCreated: 0,
            puzzlesCompleted: 0,
            totalPoints: 0,
          },
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  // Sign in with email and password
  const signIn = async ({ email, password }: { email: string; password: string }) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      if (data?.user) {
        const userData = await getUserProfile(data.user.id);
        setUser(userData);
        return { data: userData };
      }

      return { data: null };
    } catch (error) {
      console.error('Error signing in:', error);
      return { error };
    }
  };

  // Sign up with email and password
  const signUp = async ({ email, password, username }: { email: string; password: string; username: string }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      if (data?.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              email,
              username,
              stats: {
                puzzlesCreated: 0,
                puzzlesCompleted: 0,
                totalPoints: 0,
              },
            },
          ]);

        if (profileError) {
          console.error('Error creating profile:', profileError);
          return { error: profileError };
        }

        const userData = await getUserProfile(data.user.id);
        setUser(userData);
        return { data: userData };
      }

      return { data: null };
    } catch (error) {
      console.error('Error signing up:', error);
      return { error };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      await tokenStorage.removeItem('supabase.auth.token');
      setUser(null);
      router.replace('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email);
      return { data, error };
    } catch (error) {
      console.error('Error resetting password:', error);
      return { error };
    }
  };

  // Update user profile
  const updateProfile = async (updates: Partial<User>) => {
    try {
      if (!user) throw new Error('No user logged in');

      const { error } = await supabase
        .from('profiles')
        .update({
          ...(updates.username && { username: updates.username }),
          ...(updates.avatarUrl && { avatar_url: updates.avatarUrl }),
        })
        .eq('id', user.id);

      if (error) throw error;

      // Update local user state
      setUser({
        ...user,
        ...updates,
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);