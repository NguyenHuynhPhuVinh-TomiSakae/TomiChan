import { useState, useEffect, useRef } from "react";
import {
  getLocalStorage,
  setLocalStorage,
} from "../../../../../../../utils/localStorage";

export interface EditorSettings {
  fontSize: number;
  minimap: boolean;
  wordWrap: "on" | "off";
  theme: "vs-dark" | "light";
  tabSize: number;
  autoSave: boolean;
}

export function useEditorSettings() {
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<EditorSettings>(() => {
    const savedSettings = getLocalStorage("codeEditorSettings");
    return savedSettings
      ? JSON.parse(savedSettings)
      : {
          fontSize: 14,
          minimap: true,
          wordWrap: "on",
          theme: "vs-dark",
          tabSize: 2,
          autoSave: false,
        };
  });
  const settingsRef = useRef<HTMLDivElement>(null);

  // Lưu cài đặt vào localStorage khi thay đổi
  useEffect(() => {
    setLocalStorage("codeEditorSettings", JSON.stringify(settings));
  }, [settings]);

  // Xử lý click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(event.target as Node)
      ) {
        setShowSettings(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const updateSettings = (newSettings: Partial<EditorSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...newSettings,
    }));
  };

  return {
    settings,
    showSettings,
    setShowSettings,
    updateSettings,
    settingsRef,
  };
}
