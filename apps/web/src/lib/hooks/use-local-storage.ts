import { useState, useEffect } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) setStoredValue(JSON.parse(item) as T);
    } catch (error) {
      console.warn(`useLocalStorage: error reading key "${key}":`, error);
    }
  }, [key]);

  const setValue = (value: T | ((prev: T) => T)) => {
    if (typeof window === 'undefined') return;
    try {
      const valueToStore =
        typeof value === 'function'
          ? (value as (prev: T) => T)(storedValue)
          : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`useLocalStorage: error setting key "${key}":`, error);
    }
  };

  const removeValue = () => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.warn(`useLocalStorage: error removing key "${key}":`, error);
    }
  };

  return [storedValue, setValue, removeValue];
}
