import React, { useState, useEffect } from "react";
import { IconX } from "@tabler/icons-react";
import Portal from "../Portal";
import { getLocalStorage, setLocalStorage } from "../../utils/localStorage";

interface OpenRouterSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OpenRouterSettings({
  isOpen,
  onClose,
}: OpenRouterSettingsProps) {
  const [apiKey, setApiKey] = useState(() =>
    getLocalStorage("openrouter_api_key", "")
  );
  const [model, setModel] = useState(() =>
    getLocalStorage("openrouter_model", "google/gemma-3-27b-it:free")
  );
  const [systemPrompt, setSystemPrompt] = useState(() =>
    getLocalStorage(
      "openrouter_system_prompt",
      "Bạn là 1 Chat Bot AI tên là TomiChan được phát triển bởi TomiSakae!"
    )
  );
  const [temperature, setTemperature] = useState(() =>
    Number(getLocalStorage("openrouter_temperature", "0.7"))
  );
  const [maxTokens, setMaxTokens] = useState(() =>
    Number(getLocalStorage("openrouter_max_tokens", "4096"))
  );
  const [topP, setTopP] = useState(() =>
    Number(getLocalStorage("openrouter_top_p", "0.95"))
  );
  const [topK, setTopK] = useState(() =>
    Number(getLocalStorage("openrouter_top_k", "40"))
  );

  // Reset form khi mở modal
  useEffect(() => {
    if (isOpen) {
      setApiKey(getLocalStorage("openrouter_api_key", ""));
      setModel(
        getLocalStorage("openrouter_model", "google/gemma-3-27b-it:free")
      );
      setSystemPrompt(
        getLocalStorage(
          "openrouter_system_prompt",
          "Bạn là 1 Chat Bot AI tên là TomiChan được phát triển bởi TomiSakae!"
        )
      );
      setTemperature(Number(getLocalStorage("openrouter_temperature", "0.7")));
      setMaxTokens(Number(getLocalStorage("openrouter_max_tokens", "4096")));
      setTopP(Number(getLocalStorage("openrouter_top_p", "0.95")));
      setTopK(Number(getLocalStorage("openrouter_top_k", "40")));
    }
  }, [isOpen]);

  const handleClose = () => {
    setLocalStorage("openrouter_api_key", apiKey);
    setLocalStorage("openrouter_model", model);
    setLocalStorage("openrouter_system_prompt", systemPrompt);
    setLocalStorage("openrouter_temperature", temperature.toString());
    setLocalStorage("openrouter_max_tokens", maxTokens.toString());
    setLocalStorage("openrouter_top_p", topP.toString());
    setLocalStorage("openrouter_top_k", topK.toString());
    onClose();
  };

  const handleReset = () => {
    const currentApiKey = apiKey;
    setModel("google/gemma-3-27b-it:free");
    setSystemPrompt(
      "Bạn là 1 Chat Bot AI tên là TomiChan được phát triển bởi TomiSakae!"
    );
    setTemperature(0.7);
    setMaxTokens(4096);
    setTopP(0.95);
    setTopK(40);
    setApiKey(currentApiKey);
  };

  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
        <div className="min-h-screen w-full py-8 px-4 flex items-center justify-center">
          <div className="bg-white dark:bg-black sm:rounded-lg w-full max-w-md p-6 relative text-black dark:text-white dark:border dark:border-white">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Cài đặt OpenRouter</h2>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors cursor-pointer"
              >
                <IconX size={20} />
              </button>
            </div>

            <div className="max-h-[calc(100vh-200px)] overflow-y-auto pr-2 scrollbar-hide">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Chọn mô hình
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-black"
                >
                  <optgroup label="Google">
                    <option value="google/gemma-3-27b-it:free">
                      Gemma 3 27B
                    </option>
                    <option value="google/gemini-2.0-flash-lite-preview-02-05:free">
                      Gemini Flash Lite 2.0 Preview
                    </option>
                    <option value="google/gemini-2.0-pro-exp-02-05:free">
                      Gemini Pro 2.0 Experimental
                    </option>
                    <option value="google/gemini-2.0-flash-thinking-exp:free">
                      Gemini 2.0 Flash Thinking Experimental
                    </option>
                    <option value="google/gemini-2.0-flash-exp:free">
                      Gemini Flash 2.0 Experimental
                    </option>
                    <option value="google/gemma-2-9b-it:free">
                      Gemma 2 9B
                    </option>
                  </optgroup>
                  <optgroup label="DeepSeek">
                    <option value="deepseek/deepseek-r1-zero:free">
                      DeepSeek R1 Zero
                    </option>
                    <option value="deepseek/deepseek-r1-distill-qwen-32b:free">
                      R1 Distill Qwen 32B
                    </option>
                    <option value="deepseek/deepseek-r1-distill-llama-70b:free">
                      R1 Distill Llama 70B
                    </option>
                    <option value="deepseek/deepseek-r1:free">
                      DeepSeek R1
                    </option>
                    <option value="deepseek/deepseek-chat:free">
                      DeepSeek V3
                    </option>
                  </optgroup>
                  <optgroup label="Qwen">
                    <option value="qwen/qwq-32b:free">QwQ 32B</option>
                    <option value="qwen/qwen2.5-vl-72b-instruct:free">
                      Qwen2.5 VL 72B Instruct
                    </option>
                    <option value="qwen/qwen-2.5-coder-32b-instruct:free">
                      Qwen2.5 Coder 32B Instruct
                    </option>
                    <option value="qwen/qwen-2-7b-instruct:free">
                      Qwen 2 7B Instruct
                    </option>
                  </optgroup>
                  <optgroup label="Meta">
                    <option value="meta-llama/llama-3.3-70b-instruct:free">
                      Llama 3.3 70B Instruct
                    </option>
                    <option value="meta-llama/llama-3.2-3b-instruct:free">
                      Llama 3.2 3B Instruct
                    </option>
                    <option value="meta-llama/llama-3.2-1b-instruct:free">
                      Llama 3.2 1B Instruct
                    </option>
                    <option value="meta-llama/llama-3.2-11b-vision-instruct:free">
                      Llama 3.2 11B Vision Instruct
                    </option>
                    <option value="meta-llama/llama-3.1-8b-instruct:free">
                      Llama 3.1 8B Instruct
                    </option>
                    <option value="meta-llama/llama-3-8b-instruct:free">
                      Llama 3 8B Instruct
                    </option>
                  </optgroup>
                  <optgroup label="Mistral">
                    <option value="mistralai/mistral-small-24b-instruct-2501:free">
                      Mistral Small 3
                    </option>
                    <option value="mistralai/mistral-nemo:free">
                      Mistral Nemo
                    </option>
                    <option value="mistralai/mistral-7b-instruct:free">
                      Mistral 7B Instruct
                    </option>
                  </optgroup>
                  <optgroup label="Others">
                    <option value="moonshotai/moonlight-16b-a3b-instruct:free">
                      Moonshot AI: Moonlight 16B A3B Instruct
                    </option>
                    <option value="nousresearch/deephermes-3-llama-3-8b-preview:free">
                      Nous: DeepHermes 3 Llama 3 8B Preview
                    </option>
                    <option value="cognitivecomputations/dolphin3.0-r1-mistral-24b:free">
                      Dolphin3.0 R1 Mistral 24B
                    </option>
                    <option value="microsoft/phi-3-mini-128k-instruct:free">
                      Microsoft: Phi-3 Mini 128K Instruct
                    </option>
                    <option value="microsoft/phi-3-medium-128k-instruct:free">
                      Microsoft: Phi-3 Medium 128K Instruct
                    </option>
                    <option value="openchat/openchat-7b:free">
                      OpenChat 3.5 7B
                    </option>
                  </optgroup>
                </select>
              </div>

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-black"
                    placeholder="sk-or-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  />
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Lấy API Key tại{" "}
                    <a
                      href="https://openrouter.ai/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      OpenRouter Dashboard
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
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-black"
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
                    Max Tokens
                  </label>
                  <input
                    type="number"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(Number(e.target.value))}
                    min="1"
                    max="32768"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-black"
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
                    Top K
                  </label>
                  <input
                    type="number"
                    value={topK}
                    onChange={(e) => setTopK(Number(e.target.value))}
                    min="1"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-black"
                  />
                </div>
              </form>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
              >
                Đặt lại mặc định
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Xong
              </button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}
