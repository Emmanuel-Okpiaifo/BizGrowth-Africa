import { useCallback, useEffect, useState } from "react";

const THEME_KEY = "theme";

export default function useTheme() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(THEME_KEY);
    const enabled = stored ? stored === "dark" : false;
    document.documentElement.classList.toggle("dark", enabled);
    setIsDark(enabled);
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem(THEME_KEY, next ? "dark" : "light");
      return next;
    });
  }, []);

  return { isDark, toggleTheme };
}
