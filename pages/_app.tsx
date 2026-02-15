import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { useEffect, useState } from 'react';

type ThemeMode = 'original' | 'neon' | 'summer';

const THEME_STORAGE_KEY = 'quizview-theme';

export default function App({ Component, pageProps }: AppProps) {
  const [theme, setTheme] = useState<ThemeMode>('neon');

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    const nextTheme: ThemeMode = storedTheme === 'neon' || storedTheme === 'summer' ? storedTheme : 'original';
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const handleThemeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextTheme = event.target.value as ThemeMode;
    setTheme(nextTheme);
  };

  return (
    <>
      <div className="theme-toggle">
        <label className="theme-toggle-label" htmlFor="theme-picker">Theme</label>
        <select id="theme-picker" className="theme-toggle-select" value={theme} onChange={handleThemeChange}>
          <option value="original">Autumn</option>
          <option value="neon">Neon</option>
          <option value="summer">Summer</option>
        </select>
      </div>
      <Component {...pageProps} />
    </>
  );
}
