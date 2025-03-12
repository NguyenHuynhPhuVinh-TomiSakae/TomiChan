import React from "react";
import { IconX, IconSun, IconMoon, IconWorld } from "@tabler/icons-react";
import Portal from "../../Portal";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: "light" | "dark" | "system";
  onThemeChange: (theme: "light" | "dark" | "system") => void;
  imageGeneration: boolean;
  onImageGenerationChange: (enabled: boolean) => void;
  imageConfig: {
    width: number;
    height: number;
    steps: number;
    togetherApiKey?: string;
  };
  onImageConfigChange: (config: {
    width: number;
    height: number;
    steps: number;
    togetherApiKey?: string;
  }) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  theme,
  onThemeChange,
  imageGeneration,
  onImageGenerationChange,
  imageConfig,
  onImageConfigChange,
}: SettingsModalProps) {
  if (!isOpen) return null;

  const handleResetImageConfig = () => {
    // Giữ lại API key hiện tại
    const currentApiKey = imageConfig.togetherApiKey;

    // Reset các cài đặt về mặc định
    onImageConfigChange({
      width: 1024,
      height: 768,
      steps: 4,
      togetherApiKey: currentApiKey, // Giữ nguyên API key
    });
  };

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
        <div className="bg-white dark:bg-black sm:rounded-lg w-full max-w-md p-6 relative text-black dark:text-white dark:border dark:border-white">
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

          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Tạo ảnh AI
            </h3>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm">Cho phép tạo ảnh</span>
              <button
                onClick={() => onImageGenerationChange(!imageGeneration)}
                className={`w-12 h-6 rounded-full transition-colors cursor-pointer ${
                  imageGeneration
                    ? "bg-black dark:bg-white"
                    : "bg-gray-200 dark:bg-gray-700"
                } relative`}
              >
                <span
                  className={`block w-4 h-4 rounded-full bg-white dark:bg-black transition-transform transform ${
                    imageGeneration ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {imageGeneration && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm mb-1 block">Together API Key</label>
                  <input
                    type="password"
                    value={imageConfig.togetherApiKey || ""}
                    onChange={(e) =>
                      onImageConfigChange({
                        ...imageConfig,
                        togetherApiKey: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
                    placeholder="Nhập Together API Key của bạn..."
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Lấy API key tại{" "}
                    <a
                      href="https://api.together.xyz/settings/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      Together AI
                    </a>
                  </p>
                </div>

                <div>
                  <label className="text-sm mb-1 block">Kích thước ảnh</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-xs mb-1 block">
                        Chiều rộng ({imageConfig.width}px)
                      </span>
                      <input
                        type="range"
                        min="256"
                        max="1440"
                        step="8"
                        value={imageConfig.width}
                        onChange={(e) =>
                          onImageConfigChange({
                            ...imageConfig,
                            width: parseInt(e.target.value),
                          })
                        }
                        className="w-full cursor-pointer"
                      />
                    </div>
                    <div>
                      <span className="text-xs mb-1 block">
                        Chiều cao ({imageConfig.height}px)
                      </span>
                      <input
                        type="range"
                        min="256"
                        max="1440"
                        step="8"
                        value={imageConfig.height}
                        onChange={(e) =>
                          onImageConfigChange({
                            ...imageConfig,
                            height: parseInt(e.target.value),
                          })
                        }
                        className="w-full cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm mb-1 block">
                    Số bước tạo ảnh ({imageConfig.steps})
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="4"
                    value={imageConfig.steps}
                    onChange={(e) =>
                      onImageConfigChange({
                        ...imageConfig,
                        steps: parseInt(e.target.value),
                      })
                    }
                    className="w-full cursor-pointer"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleResetImageConfig}
                    className="text-sm text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 cursor-pointer"
                  >
                    Đặt lại cấu hình ảnh
                  </button>
                </div>
              </div>
            )}
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
