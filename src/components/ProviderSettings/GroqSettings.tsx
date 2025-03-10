import React from "react";

interface GroqSettingsProps {
  model: string;
  apiKey: string;
  onModelChange: (value: string) => void;
  onApiKeyChange: (value: string) => void;
}

export default function GroqSettings({
  model,
  apiKey,
  onModelChange,
  onApiKeyChange,
}: GroqSettingsProps) {
  return (
    <>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Chọn mô hình
        </label>
        <select
          value={model}
          onChange={(e) => onModelChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-black"
        >
          <option value="mixtral-8x7b-32768">Mixtral 8x7B 32K</option>
          <option value="llama2-70b-4096">LLaMA2 70B 4K</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          API Key
        </label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => onApiKeyChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-black"
          placeholder="gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
        />
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Bạn có thể lấy API Key tại{" "}
          <a
            href="https://console.groq.com/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Groq Console
          </a>
        </p>
      </div>
    </>
  );
}
