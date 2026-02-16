import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        neonCyan: '#00f3ff',
        neonMagenta: '#ff00ff',
      },
    },
  },
  plugins: [],
};

export default config;
