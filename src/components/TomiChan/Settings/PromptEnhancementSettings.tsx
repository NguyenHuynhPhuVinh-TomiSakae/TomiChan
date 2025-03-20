import React, { useState } from "react";
import { getLocalStorage, setLocalStorage } from "@/utils/localStorage";

interface PromptEnhancementSettingsProps {
  onSave?: () => void;
}

export default function PromptEnhancementSettings({
  onSave,
}: PromptEnhancementSettingsProps) {
  const [provider, setProvider] = useState(
    getLocalStorage("prompt_enhancement_provider", "google")
  );

  const handleProviderChange = (newProvider: string) => {
    setProvider(newProvider);
    setLocalStorage("prompt_enhancement_provider", newProvider);
    if (onSave) onSave();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Cường hóa Prompt
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          Chọn AI provider để sử dụng khi cường hóa prompt. Việc cường hóa giúp
          làm rõ và chi tiết hơn yêu cầu của bạn.
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-sm mb-2 block">Provider cho Cường hóa</label>
            <div className="grid grid-cols-1 gap-3">
              <div
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer ${
                  provider === "google"
                    ? "border-black dark:border-white bg-gray-50 dark:bg-gray-900"
                    : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                }`}
                onClick={() => handleProviderChange("google")}
              >
                <div className="flex items-center">
                  <span className="ml-3 text-sm">Google (Gemini)</span>
                </div>
                <div className="w-4 h-4 rounded-full border border-black dark:border-white flex items-center justify-center">
                  {provider === "google" && (
                    <div className="w-2 h-2 rounded-full bg-black dark:bg-white"></div>
                  )}
                </div>
              </div>

              <div
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer ${
                  provider === "groq"
                    ? "border-black dark:border-white bg-gray-50 dark:bg-gray-900"
                    : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                }`}
                onClick={() => handleProviderChange("groq")}
              >
                <div className="flex items-center">
                  <span className="ml-3 text-sm">Groq</span>
                </div>
                <div className="w-4 h-4 rounded-full border border-black dark:border-white flex items-center justify-center">
                  {provider === "groq" && (
                    <div className="w-2 h-2 rounded-full bg-black dark:bg-white"></div>
                  )}
                </div>
              </div>

              <div
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer ${
                  provider === "openrouter"
                    ? "border-black dark:border-white bg-gray-50 dark:bg-gray-900"
                    : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                }`}
                onClick={() => handleProviderChange("openrouter")}
              >
                <div className="flex items-center">
                  <span className="ml-3 text-sm">OpenRouter</span>
                </div>
                <div className="w-4 h-4 rounded-full border border-black dark:border-white flex items-center justify-center">
                  {provider === "openrouter" && (
                    <div className="w-2 h-2 rounded-full bg-black dark:bg-white"></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
