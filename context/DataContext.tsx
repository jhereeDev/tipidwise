import React, { createContext, useContext } from 'react';
import { useAuth } from './AuthContext';

type StorageMode = 'local' | 'cloud';

interface DataState {
  mode: StorageMode;
  userId: string | null;
}

const DataContext = createContext<DataState>({ mode: 'local', userId: null });

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, user, isGuest } = useAuth();

  const mode: StorageMode = isSignedIn && user ? 'cloud' : 'local';
  const userId = user?.id ?? null;

  return (
    <DataContext.Provider value={{ mode, userId }}>
      {children}
    </DataContext.Provider>
  );
}

export function useDataMode() {
  return useContext(DataContext);
}
