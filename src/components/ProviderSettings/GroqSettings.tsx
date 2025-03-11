import React, { useState, useEffect } from "react";
import { IconX } from "@tabler/icons-react";
import Portal from "../Portal";
import { getLocalStorage, setLocalStorage } from "../../utils/localStorage";

interface GroqSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GroqSettings({ isOpen, onClose }: GroqSettingsProps) {
  const [apiKey, setApiKey] = useState(() =>
    getLocalStorage("groq_api_key", "")
  );
  const [model, setModel] = useState(() =>
    getLocalStorage("groq_model", "deepseek-r1-distill-qwen-32b")
  );
  const [systemPrompt, setSystemPrompt] = useState(() =>
    getLocalStorage(
      "groq_system_prompt",
      "Bạn là 1 Chat Bot AI tên là TomiChan được phát triển bởi TomiSakae!"
    )
  );
  const [temperature, setTemperature] = useState(() =>
    Number(getLocalStorage("groq_temperature", "1"))
  );
  const [topP, setTopP] = useState(() =>
    Number(getLocalStorage("groq_top_p", "1"))
  );
  const [maxOutputTokens, setMaxOutputTokens] = useState(() =>
    Number(getLocalStorage("groq_max_output_tokens", "1024"))
  );

  // Xác định nhóm mô hình và cập nhật tham số mặc định
  const handleModelChange = (selectedModel: string) => {
    setModel(selectedModel);

    // Nhóm 1: llama, gemma, mistral, allam
    if (
      selectedModel.includes("llama") ||
      selectedModel.includes("gemma") ||
      selectedModel.includes("mistral") ||
      selectedModel.includes("mixtral") ||
      selectedModel.includes("allam")
    ) {
      setTemperature(1);
      setTopP(1);
      setMaxOutputTokens(1024);
    }
    // Nhóm 2: qwen, deepseek
    else if (
      selectedModel.includes("qwen") ||
      selectedModel.includes("deepseek")
    ) {
      setTemperature(0.6);
      setTopP(0.95);
      setMaxOutputTokens(4096);
    }
  };

  // Reset form khi mở modal
  useEffect(() => {
    if (isOpen) {
      setApiKey(getLocalStorage("groq_api_key", ""));
      const savedModel = getLocalStorage(
        "groq_model",
        "deepseek-r1-distill-qwen-32b"
      );
      setModel(savedModel);
      setSystemPrompt(
        getLocalStorage(
          "groq_system_prompt",
          "Bạn là 1 Chat Bot AI tên là TomiChan được phát triển bởi TomiSakae!"
        )
      );

      // Đặt các tham số mặc định dựa trên model đã lưu
      if (
        savedModel.includes("llama") ||
        savedModel.includes("gemma") ||
        savedModel.includes("mistral") ||
        savedModel.includes("mixtral") ||
        savedModel.includes("allam")
      ) {
        setTemperature(Number(getLocalStorage("groq_temperature", "1")));
        setTopP(Number(getLocalStorage("groq_top_p", "1")));
        setMaxOutputTokens(
          Number(getLocalStorage("groq_max_output_tokens", "1024"))
        );
      } else {
        setTemperature(Number(getLocalStorage("groq_temperature", "0.6")));
        setTopP(Number(getLocalStorage("groq_top_p", "0.95")));
        setMaxOutputTokens(
          Number(getLocalStorage("groq_max_output_tokens", "4096"))
        );
      }
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalStorage("groq_api_key", apiKey);
    setLocalStorage("groq_model", model);
    setLocalStorage("groq_system_prompt", systemPrompt);
    setLocalStorage("groq_temperature", temperature.toString());
    setLocalStorage("groq_top_p", topP.toString());
    setLocalStorage("groq_max_output_tokens", maxOutputTokens.toString());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
        <div className="bg-white dark:bg-black sm:rounded-lg w-full max-w-md p-6 relative text-black dark:text-white dark:border dark:border-white">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Cài đặt Groq</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors cursor-pointer"
            >
              <IconX size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Chọn mô hình
                </label>
                <select
                  value={model}
                  onChange={(e) => handleModelChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-black"
                >
                  <optgroup label="Nhóm AI phân tích tốt">
                    <option value="qwen-2.5-32b">Qwen 2.5 32B</option>
                    <option value="qwen-2.5-coder-32b">
                      Qwen 2.5 Coder 32B
                    </option>
                    <option value="qwen-qwq-32b">Qwen QWQ 32B</option>
                    <option value="deepseek-r1-distill-qwen-32b">
                      DeepSeek R1 Distill Qwen 32B
                    </option>
                    <option value="deepseek-r1-distill-llama-70b">
                      DeepSeek R1 Distill LLaMA 70B
                    </option>
                  </optgroup>
                  <optgroup label="Nhóm AI phản hồi nhanh">
                    <option value="llama-3.1-8b-instant">
                      LLaMA 3.1 8B Instant
                    </option>
                    <option value="llama-3.2-11b-vision-preview">
                      LLaMA 3.2 11B Vision Preview
                    </option>
                    <option value="llama-3.2-1b-preview">
                      LLaMA 3.2 1B Preview
                    </option>
                    <option value="llama-3.2-3b-preview">
                      LLaMA 3.2 3B Preview
                    </option>
                    <option value="llama-3.2-90b-vision-preview">
                      LLaMA 3.2 90B Vision Preview
                    </option>
                    <option value="llama-3.3-70b-specdec">
                      LLaMA 3.3 70B SpecDec
                    </option>
                    <option value="llama-3.3-70b-versatile">
                      LLaMA 3.3 70B Versatile
                    </option>
                    <option value="llama-guard-3-8b">LLaMA Guard 3 8B</option>
                    <option value="llama3-70b-8192">LLaMA3 70B 8192</option>
                    <option value="llama3-8b-8192">LLaMA3 8B 8192</option>
                    <option value="mistral-saba-24b">Mistral Saba 24B</option>
                    <option value="mixtral-8x7b-32768">
                      Mixtral 8x7B 32768
                    </option>
                    <option value="allam-2-7b">Allam 2 7B</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  System Prompt
                </label>
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-black"
                  rows={3}
                  placeholder="Nhập system prompt cho AI..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Temperature ({temperature})
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Top P ({topP})
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={topP}
                  onChange={(e) => setTopP(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max Output Tokens ({maxOutputTokens})
                </label>
                <input
                  type="range"
                  min="1"
                  max="32768"
                  value={maxOutputTokens}
                  onChange={(e) => setMaxOutputTokens(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Lưu
              </button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  );
}
