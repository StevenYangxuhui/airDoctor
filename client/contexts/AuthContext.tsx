import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

interface User {
  id: string;
  phone: string;
  name: string;
  idCard: string;
  age: number;
  gender: string;
  emergencyContact: string;
  emergencyPhone: string;
  medicalHistory: string;
  doctorNotes: string;
}

interface AuthContextType {
  user: User | null;
  userId: string | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (phone: string) => Promise<{ success: boolean; error?: string }>;
  register: (phone: string, name: string, idCard?: string, age?: number, gender?: string) => Promise<{ success: boolean; error?: string }>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEVICE_ID_KEY = '@cloud_medicine_device_id';
const USER_ID_KEY = '@cloud_medicine_user_id';
const USER_DATA_KEY = '@cloud_medicine_user_data';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      // 尝试获取设备ID
      let storedDeviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
      if (!storedDeviceId) {
        storedDeviceId = Crypto.randomUUID();
        await AsyncStorage.setItem(DEVICE_ID_KEY, storedDeviceId);
      }

      // 尝试获取已登录用户
      const storedUserId = await AsyncStorage.getItem(USER_ID_KEY);
      const storedUserData = await AsyncStorage.getItem(USER_DATA_KEY);

      if (storedUserId && storedUserData) {
        setUserId(storedUserId);
        setUser(JSON.parse(storedUserData));
      }
    } catch (error) {
      console.error('Failed to load stored auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (phone: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (data.success) {
        setUserId(data.userId);
        setUser(data.user);
        await AsyncStorage.setItem(USER_ID_KEY, data.userId);
        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(data.user));
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: '登录失败，请检查网络连接' };
    }
  };

  const register = async (
    phone: string,
    name: string,
    idCard?: string,
    age?: number,
    gender?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, name, idCard, age, gender }),
      });

      const data = await response.json();

      if (data.success) {
        setUserId(data.userId);
        setUser(data.user);
        await AsyncStorage.setItem(USER_ID_KEY, data.userId);
        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(data.user));
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: '注册失败，请检查网络连接' };
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!userId) return;

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(data.user));
      }
    } catch (error) {
      console.error('Update user error:', error);
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      setUserId(null);
      await AsyncStorage.removeItem(USER_ID_KEY);
      await AsyncStorage.removeItem(USER_DATA_KEY);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userId,
        isLoading,
        isLoggedIn: !!userId,
        login,
        register,
        updateUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
