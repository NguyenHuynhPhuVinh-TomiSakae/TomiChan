import React from "react";
import type { EditorSettings as EditorSettingsType } from "./hooks/useEditorSettings";

interface EditorSettingsProps {
  settings: EditorSettingsType;
  updateSettings: (newSettings: Partial<EditorSettingsType>) => void;
  settingsRef: React.RefObject<HTMLDivElement>;
}

export default function EditorSettings({
  settings,
  updateSettings,
  settingsRef,
}: EditorSettingsProps) {
  return (
    <div
      ref={settingsRef}
      className="absolute right-4 top-20 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 p-4 w-80 z-10"
    >
      <h3 className="font-bold mb-4 text-gray-900 dark:text-gray-100">
        Cài đặt Editor
      </h3>
      <div className="space-y-4">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Font Size: {settings.fontSize}px
          </label>
          <input
            type="range"
            min="12"
            max="24"
            value={settings.fontSize}
            onChange={(e) =>
              updateSettings({ fontSize: Number(e.target.value) })
            }
            className="w-full"
          />
        </div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Minimap
          </label>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.minimap}
              onChange={(e) => updateSettings({ minimap: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
          </label>
        </div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Word Wrap
          </label>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.wordWrap === "on"}
              onChange={(e) =>
                updateSettings({
                  wordWrap: e.target.checked ? "on" : "off",
                })
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
          </label>
        </div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Auto Save
          </label>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.autoSave}
              onChange={(e) => updateSettings({ autoSave: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
          </label>
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Tab Size: {settings.tabSize}
          </label>
          <input
            type="range"
            min="2"
            max="8"
            step="2"
            value={settings.tabSize}
            onChange={(e) =>
              updateSettings({ tabSize: Number(e.target.value) })
            }
            className="w-full"
          />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Theme
          </label>
          <select
            value={settings.theme}
            onChange={(e) =>
              updateSettings({
                theme: e.target.value as "vs-dark" | "light",
              })
            }
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-purple-500 dark:focus:border-purple-500"
          >
            <option value="vs-dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </div>
      </div>
    </div>
  );
}
