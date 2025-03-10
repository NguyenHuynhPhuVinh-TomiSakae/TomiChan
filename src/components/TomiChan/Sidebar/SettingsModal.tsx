import React from "react";
import { IconX, IconSun, IconMoon, IconWorld } from "@tabler/icons-react";
import Portal from "../../Portal";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: "light" | "dark" | "system";
  onThemeChange: (theme: "light" | "dark" | "system") => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  theme,
  onThemeChange,
}: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
        <div className="bg-white dark:bg-black rounded-lg w-full max-w-md p-6 relative text-black dark:text-white dark:border dark:border-white">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Cài đặt</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors cursor-pointer"
            >
              <IconX size={20} />
            </button>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Giao diện
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => onThemeChange("light")}
                className={`flex flex-col items-center p-3 rounded-lg border cursor-pointer ${
                  theme === "light"
                    ? "border-black dark:border-white bg-white dark:bg-black"
                    : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                }`}
              >
                <IconSun size={24} />
                <span className="mt-1 text-sm">Sáng</span>
              </button>
              <button
                onClick={() => onThemeChange("dark")}
                className={`flex flex-col items-center p-3 rounded-lg border cursor-pointer ${
                  theme === "dark"
                    ? "border-black dark:border-white bg-white dark:bg-black"
                    : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                }`}
              >
                <IconMoon size={24} />
                <span className="mt-1 text-sm">Tối</span>
              </button>
              <button
                onClick={() => onThemeChange("system")}
                className={`flex flex-col items-center p-3 rounded-lg border cursor-pointer ${
                  theme === "system"
                    ? "border-black dark:border-white bg-white dark:bg-black"
                    : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                }`}
              >
                <IconWorld size={24} />
                <span className="mt-1 text-sm">Hệ thống</span>
              </button>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors cursor-pointer"
            >
              Xong
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
