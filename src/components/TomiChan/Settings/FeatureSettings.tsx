import React from "react";

interface FeatureSettingsProps {
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
  searchEnabled: boolean;
  onSearchEnabledChange: (enabled: boolean) => void;
  searchConfig: {
    googleApiKey?: string;
    googleCseId?: string;
    numResults?: number;
    deepSearch?: boolean;
  };
  onSearchConfigChange: (config: {
    googleApiKey?: string;
    googleCseId?: string;
    numResults?: number;
    deepSearch?: boolean;
  }) => void;
  e2bApiKey?: string;
  onE2bApiKeyChange: (apiKey: string) => void;
  e2bEnabled: boolean;
  onE2bEnabledChange: (enabled: boolean) => void;
}

export default function FeatureSettings({
  imageGeneration,
  onImageGenerationChange,
  imageConfig,
  onImageConfigChange,
  searchEnabled,
  onSearchEnabledChange,
  searchConfig,
  onSearchConfigChange,
  e2bApiKey,
  onE2bApiKeyChange,
  e2bEnabled,
  onE2bEnabledChange,
}: FeatureSettingsProps) {
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

  const handleResetSearchConfig = () => {
    // Giữ lại API key và CSE ID hiện tại
    const currentApiKey = searchConfig.googleApiKey;
    const currentCseId = searchConfig.googleCseId;

    // Reset các cài đặt về mặc định nhưng giữ lại API key và CSE ID
    onSearchConfigChange({
      googleApiKey: currentApiKey,
      googleCseId: currentCseId,
      numResults: 3, // Giá trị mặc định
      deepSearch: false,
    });
  };

  return (
    <div className="space-y-6">
      {/* Tạo ảnh AI */}
      <div>
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

      {/* Tìm kiếm web */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Tìm kiếm web
        </h3>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm">Cho phép tìm kiếm web</span>
          <button
            onClick={() => onSearchEnabledChange(!searchEnabled)}
            className={`w-12 h-6 rounded-full transition-colors cursor-pointer ${
              searchEnabled
                ? "bg-black dark:bg-white"
                : "bg-gray-200 dark:bg-gray-700"
            } relative`}
          >
            <span
              className={`block w-4 h-4 rounded-full bg-white dark:bg-black transition-transform transform ${
                searchEnabled ? "translate-x-7" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {searchEnabled && (
          <div className="space-y-4">
            <div>
              <label className="text-sm mb-1 block">Google API Key</label>
              <input
                type="password"
                value={searchConfig.googleApiKey || ""}
                onChange={(e) =>
                  onSearchConfigChange({
                    ...searchConfig,
                    googleApiKey: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
                placeholder="Nhập Google API Key của bạn..."
              />
              <p className="mt-1 text-xs text-gray-500">
                Lấy API key tại{" "}
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Google Cloud Console
                </a>
              </p>
            </div>

            <div>
              <label className="text-sm mb-1 block">
                Google Custom Search Engine ID
              </label>
              <input
                type="password"
                value={searchConfig.googleCseId || ""}
                onChange={(e) =>
                  onSearchConfigChange({
                    ...searchConfig,
                    googleCseId: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
                placeholder="Nhập Google CSE ID của bạn..."
              />
              <p className="mt-1 text-xs text-gray-500">
                Tạo và lấy CSE ID tại{" "}
                <a
                  href="https://programmablesearchengine.google.com/controlpanel/create"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Programmable Search Engine
                </a>
              </p>
            </div>

            <div>
              <label className="text-sm mb-1 block">
                Số lượng kết quả tìm kiếm ({searchConfig.numResults || 3})
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={searchConfig.numResults || 3}
                onChange={(e) =>
                  onSearchConfigChange({
                    ...searchConfig,
                    numResults: parseInt(e.target.value),
                  })
                }
                className={`w-full cursor-pointer ${
                  searchConfig.deepSearch ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={searchConfig.deepSearch}
              />
              <p className="mt-1 text-xs text-gray-500">
                Số lượng kết quả tìm kiếm nhiều hơn sẽ cung cấp thông tin chi
                tiết hơn.
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm">Tìm kiếm sâu</span>
                <p className="text-xs text-gray-500">
                  Phân tích sâu với nhiều kết quả tìm kiếm.
                </p>
              </div>
              <button
                onClick={() => {
                  const newDeepSearch = !searchConfig.deepSearch;
                  onSearchConfigChange({
                    ...searchConfig,
                    deepSearch: newDeepSearch,
                    numResults: newDeepSearch ? 10 : 3,
                  });
                }}
                className={`w-12 h-6 rounded-full transition-colors cursor-pointer ${
                  searchConfig.deepSearch
                    ? "bg-black dark:bg-white"
                    : "bg-gray-200 dark:bg-gray-700"
                } relative`}
              >
                <span
                  className={`block w-4 h-4 rounded-full bg-white dark:bg-black transition-transform transform ${
                    searchConfig.deepSearch ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleResetSearchConfig}
                className="text-sm text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 cursor-pointer"
              >
                Đặt lại cấu hình tìm kiếm
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Thực thi mã (E2B) */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Thực thi mã (E2B)
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm">Cho phép thực thi mã</span>
            <button
              onClick={() => onE2bEnabledChange(!e2bEnabled)}
              className={`w-12 h-6 rounded-full transition-colors cursor-pointer ${
                e2bEnabled
                  ? "bg-black dark:bg-white"
                  : "bg-gray-200 dark:bg-gray-700"
              } relative`}
            >
              <span
                className={`block w-4 h-4 rounded-full bg-white dark:bg-black transition-transform transform ${
                  e2bEnabled ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div>
            <label className="text-sm mb-1 block">E2B API Key</label>
            <input
              type="password"
              value={e2bApiKey || ""}
              onChange={(e) => onE2bApiKeyChange(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
              placeholder="Nhập E2B API Key của bạn..."
            />
            <p className="mt-1 text-xs text-gray-500">
              Lấy API key tại{" "}
              <a
                href="https://e2b.dev/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                E2B Dashboard
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
