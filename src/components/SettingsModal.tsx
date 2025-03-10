import React from "react";
import { IconX, IconSun, IconMoon, IconWorld } from "@tabler/icons-react";

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Cài đặt</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <IconX size={20} />
          </button>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Giao diện</h3>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => onThemeChange("light")}
              className={`flex flex-col items-center p-3 rounded-lg border cursor-pointer ${
                theme === "light"
                  ? "border-black bg-gray-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <IconSun size={24} />
              <span className="mt-1 text-sm">Sáng</span>
            </button>
            <button
              onClick={() => onThemeChange("dark")}
              className={`flex flex-col items-center p-3 rounded-lg border cursor-pointer ${
                theme === "dark"
                  ? "border-black bg-gray-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <IconMoon size={24} />
              <span className="mt-1 text-sm">Tối</span>
            </button>
            <button
              onClick={() => onThemeChange("system")}
              className={`flex flex-col items-center p-3 rounded-lg border cursor-pointer ${
                theme === "system"
                  ? "border-black bg-gray-50"
                  : "border-gray-200 hover:border-gray-300"
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
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
          >
            Xong
          </button>
        </div>
      </div>
    </div>
  );
}
