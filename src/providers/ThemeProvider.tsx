"use client";
import React, { createContext, useContext, ReactNode, useEffect } from "react";
import { useTheme } from "../hooks/useTheme";

type ThemeContextType = {
  theme: "light" | "dark" | "system";
  setTheme: (theme: "light" | "dark" | "system") => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useThemeContext phải được sử dụng trong ThemeProvider");
  }
  return context;
};

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const themeHook = useTheme();

  useEffect(() => {
    // Khởi tạo ban đầu khi trình duyệt load
    const root = window.document.documentElement;
    const isDark =
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, []);

  return (
    <ThemeContext.Provider value={themeHook}>{children}</ThemeContext.Provider>
  );
}
