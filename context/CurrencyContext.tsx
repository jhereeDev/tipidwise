import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_CURRENCY, STORAGE_KEYS } from '../constants/config';

interface CurrencyContextValue {
  currency: string;
  setCurrency: (symbol: string) => void;
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: DEFAULT_CURRENCY,
  setCurrency: () => {},
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState(DEFAULT_CURRENCY);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.CURRENCY).then((stored) => {
      if (stored) setCurrencyState(stored);
    });
  }, []);

  const setCurrency = (symbol: string) => {
    setCurrencyState(symbol);
    AsyncStorage.setItem(STORAGE_KEYS.CURRENCY, symbol);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency(): string {
  return useContext(CurrencyContext).currency;
}

export function useCurrencyContext(): CurrencyContextValue {
  return useContext(CurrencyContext);
}
