import { useEffect, useState } from "react";

const THEME_KEY = "theme";

const applyThemeClass = (theme) => {
  // body 클래스에 theme-light / theme-dark 적용
  document.body.classList.remove("theme-dark", "theme-light");
  document.body.classList.add(`theme-${theme}`);
};

const useThemeMode = () => {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY) || "dark";
    setTheme(saved);
    applyThemeClass(saved);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem(THEME_KEY, next);
      applyThemeClass(next);
      return next;
    });
  };

  return { theme, toggleTheme };
};

export default useThemeMode;
