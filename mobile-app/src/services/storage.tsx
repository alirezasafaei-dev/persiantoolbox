import React, {createContext, useContext, ReactNode} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type StorageContextType = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  clear: () => Promise<void>;
};

const StorageContext = createContext<StorageContextType>({
  getItem: async () => null,
  setItem: async () => {},
  removeItem: async () => {},
  clear: async () => {},
});

export function StorageProvider({children}: {children: ReactNode}) {
  const storage = {
    getItem: async (key: string) => {
      try {
        return await AsyncStorage.getItem(key);
      } catch (error) {
        console.error('Storage getItem error:', error);
        return null;
      }
    },
    setItem: async (key: string, value: string) => {
      try {
        await AsyncStorage.setItem(key, value);
      } catch (error) {
        console.error('Storage setItem error:', error);
      }
    },
    removeItem: async (key: string) => {
      try {
        await AsyncStorage.removeItem(key);
      } catch (error) {
        console.error('Storage removeItem error:', error);
      }
    },
    clear: async () => {
      try {
        await AsyncStorage.clear();
      } catch (error) {
        console.error('Storage clear error:', error);
      }
    },
  };

  return (
    <StorageContext.Provider value={storage}>{children}</StorageContext.Provider>
  );
}

export function useStorage() {
  return useContext(StorageContext);
}
