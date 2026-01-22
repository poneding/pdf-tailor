import { create } from 'zustand';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const applyTheme = (theme: Theme) => {
  const root = window.document.documentElement;
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  root.classList.remove('light', 'dark');

  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.add('light');
  }
};

export const useTheme = create<ThemeState>((set) => {
  const savedTheme = localStorage.getItem('theme') as Theme;
  const initialTheme = savedTheme && ['light', 'dark', 'system'].includes(savedTheme) 
    ? savedTheme 
    : 'system';
    
  applyTheme(initialTheme);

  return {
    theme: initialTheme,
    setTheme: (theme) => {
      localStorage.setItem('theme', theme);
      applyTheme(theme);
      set({ theme });
    },
  };
});

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  const currentTheme = useTheme.getState().theme;
  if (currentTheme === 'system') {
    applyTheme('system');
  }
});
