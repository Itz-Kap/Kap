import { useState, useEffect } from 'react';

export function useTheme() {
  const [darkMode, setDarkMode] = useState<boolean>(
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    // Apply dark mode class to document root
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return { darkMode, toggleDarkMode };
}
