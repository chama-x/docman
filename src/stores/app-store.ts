import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface ThemeState {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

interface AppState {
  isMenuOpen: boolean;
  toggleMenu: () => void;
  setMenuOpen: (open: boolean) => void;
}

type State = ThemeState & AppState;

export const useAppStore = create<State>()(
  persist(
    immer((set) => ({
      // Theme state
      theme: 'system',
      setTheme: (theme) =>
        set((state) => {
          state.theme = theme;
        }),

      // App state
      isMenuOpen: false,
      toggleMenu: () =>
        set((state) => {
          state.isMenuOpen = !state.isMenuOpen;
        }),
      setMenuOpen: (open) =>
        set((state) => {
          state.isMenuOpen = open;
        }),
    })),
    {
      name: 'app-storage',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
); 