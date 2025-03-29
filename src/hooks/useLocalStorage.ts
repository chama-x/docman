import { useState, useEffect } from 'react';

/**
 * Custom hook that persists state in localStorage
 * @param key The localStorage key
 * @param initialValue The initial value (or function to get it)
 * @returns A stateful value and a function to update it
 */
export const useLocalStorage = <T>(key: string, initialValue: T | (() => T)) => {
  // Get from localStorage or use initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return typeof initialValue === 'function'
        ? (initialValue as () => T)()
        : initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item 
        ? JSON.parse(item) 
        : typeof initialValue === 'function'
        ? (initialValue as () => T)()
        : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return typeof initialValue === 'function'
        ? (initialValue as () => T)()
        : initialValue;
    }
  });

  // Update localStorage when state changes
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function 
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Update stored value if localStorage changes in another tab
  useEffect(() => {
    function handleStorageChange(event: StorageEvent) {
      if (event.key === key && event.newValue) {
        setStoredValue(JSON.parse(event.newValue));
      }
    }
    
    // Listen for changes
    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key]);

  return [storedValue, setValue] as const;
}; 