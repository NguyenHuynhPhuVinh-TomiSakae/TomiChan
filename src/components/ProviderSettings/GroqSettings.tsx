import React, { useState, useEffect } from "react";
import { IconX, IconChevronDown, IconChevronUp } from "@tabler/icons-react";
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
    getLocalStorage("groq_model", "deepseek-r1-distill-llama-70b")
  );
  const [systemPrompt, setSystemPrompt] = useState(() =>
    getLocalStorage(
      "groq_system_prompt",
      "Bạn là 1 Chat Bot AI tên là TomiChan được phát triển bởi TomiSakae!"
    )
  );
  const [temperature, setTemperature] = useState(() =>
    Number(getLocalStorage("groq_temperature", "0.6"))
  );
  const [topP, setTopP] = useState(() =>
    Number(getLocalStorage("groq_top_p", "0.95"))
  );
  const [maxOutputTokens, setMaxOutputTokens] = useState(() =>
    Number(getLocalStorage("groq_max_output_tokens", "4096"))
  );

  const [isGroupAOpen, setIsGroupAOpen] = useState(false);
  const [isGroupBOpen, setIsGroupBOpen] = useState(false);

  const groupAOptions = [
    { value: "qwen-2.5-32b", label: "Qwen 2.5 32B" },
    { value: "qwen-2.5-coder-32b", label: "Qwen 2.5 Coder 32B" },
    { value: "qwen-qwq-32b", label: "Qwen QWQ 32B" },
    {
      value: "deepseek-r1-distill-qwen-32b",
      label: "DeepSeek R1 Distill Qwen 32B",
    },
    {
      value: "deepseek-r1-distill-llama-70b",
      label: "DeepSeek R1 Distill LLaMA 70B",
    },
  ];

  const groupBOptions = [
    { value: "llama-3.1-8b-instant", label: "LLaMA 3.1 8B Instant" },
    {
      value: "llama-3.2-11b-vision-preview",
      label: "LLaMA 3.2 11B Vision Preview",
    },
    { value: "llama-3.2-1b-preview", label: "LLaMA 3.2 1B Preview" },
    { value: "llama-3.2-3b-preview", label: "LLaMA 3.2 3B Preview" },
    {
      value: "llama-3.2-90b-vision-preview",
      label: "LLaMA 3.2 90B Vision Preview",
    },
    { value: "llama-3.3-70b-specdec", label: "LLaMA 3.3 70B SpecDec" },
    { value: "llama-3.3-70b-versatile", label: "LLaMA 3.3 70B Versatile" },
    { value: "llama-guard-3-8b", label: "LLaMA Guard 3 8B" },
    { value: "llama3-70b-8192", label: "LLaMA3 70B 8192" },
    { value: "llama3-8b-8192", label: "LLaMA3 8B 8192" },
    { value: "mistral-saba-24b", label: "Mistral Saba 24B" },
    { value: "mixtral-8x7b-32768", label: "Mixtral 8x7B 32768" },
    { value: "allam-2-7b", label: "Allam 2 7B" },
  ];

  useEffect(() => {
    if (isOpen) {
      const savedModel = getLocalStorage(
        "groq_model",
        "deepseek-r1-distill-llama-70b"
      );
      setApiKey(getLocalStorage("groq_api_key", ""));
      setModel(savedModel);
      setSystemPrompt(
        getLocalStorage(
          "groq_system_prompt",
          "Bạn là 1 Chat Bot AI tên là TomiChan được phát triển bởi TomiSakae!"
        )
      );

      if (savedModel.includes("qwen") || savedModel.includes("deepseek")) {
        setTemperature(Number(getLocalStorage("groq_temperature", "0.6")));
        setTopP(Number(getLocalStorage("groq_top_p", "0.95")));
        setMaxOutputTokens(
          Number(getLocalStorage("groq_max_output_tokens", "4096"))
        );
        setIsGroupAOpen(true);
        setIsGroupBOpen(false);
      } else {
        setTemperature(Number(getLocalStorage("groq_temperature", "1")));
        setTopP(Number(getLocalStorage("groq_top_p", "1")));
        setMaxOutputTokens(
          Number(getLocalStorage("groq_max_output_tokens", "1024"))
        );
        setIsGroupAOpen(false);
        setIsGroupBOpen(true);
      }
    }
  }, [isOpen]);

  const handleModelChange = (selectedModel: string) => {
    setModel(selectedModel);

    if (selectedModel.includes("qwen") || selectedModel.includes("deepseek")) {
      setTemperature(0.6);
      setTopP(0.95);
      setMaxOutputTokens(4096);
      setIsGroupAOpen(true);
      setIsGroupBOpen(false);
    } else {
      setTemperature(1);
      setTopP(1);
      setMaxOutputTokens(1024);
      setIsGroupAOpen(false);
      setIsGroupBOpen(true);
    }
  };

  const handleReset = () => {
    const currentApiKey = apiKey;
    setModel("deepseek-r1-distill-llama-70b");
    setSystemPrompt(
      "Bạn là 1 Chat Bot AI tên là TomiChan được phát triển bởi TomiSakae!"
    );
    setTemperature(0.6);
    setTopP(0.95);
    setMaxOutputTokens(4096);
    setApiKey(currentApiKey);
    setIsGroupAOpen(true);
    setIsGroupBOpen(false);
  };

  const handleClose = () => {
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
        <div className="bg-white dark:bg-black sm:rounded-lg w-full max-w-4xl p-6 relative text-black dark:text-white dark:border dark:border-white">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Cài đặt Groq</h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors cursor-pointer"
            >
              <IconX size={20} />
            </button>
          </div>

          <div className="max-h-[calc(100vh-200px)] overflow-y-auto pr-2 scrollbar-hide">
            <form>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Chọn mô hình
                  </label>
                  <div className="space-y-3">
                    <div>
                      <button
                        type="button"
                        onClick={() => setIsGroupAOpen(!isGroupAOpen)}
                        className="w-full flex justify-between items-center p-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none cursor-pointer"
                      >
                        <span>Nhóm AI phân tích tốt</span>
                        {isGroupAOpen ? (
                          <IconChevronUp size={18} />
                        ) : (
                          <IconChevronDown size={18} />
                        )}
                      </button>
                      {isGroupAOpen && (
                        <div className="mt-2 space-y-2">
                          {groupAOptions.map((option) => (
                            <label
                              key={option.value}
                              className="flex items-center p-2 border rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900"
                            >
                              <input
                                type="radio"
                                name="groq_model"
                                value={option.value}
                                checked={model === option.value}
                                onChange={() => handleModelChange(option.value)}
                                className="mr-2"
                              />
                              <span>{option.label}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={() => setIsGroupBOpen(!isGroupBOpen)}
                        className="w-full flex justify-between items-center p-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none cursor-pointer"
                      >
                        <span>Nhóm AI phản hồi nhanh</span>
                        {isGroupBOpen ? (
                          <IconChevronUp size={18} />
                        ) : (
                          <IconChevronDown size={18} />
                        )}
                      </button>
                      {isGroupBOpen && (
                        <div className="mt-2 space-y-2">
                          {groupBOptions.map((option) => (
                            <label
                              key={option.value}
                              className="flex items-center p-2 border rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900"
                            >
                              <input
                                type="radio"
                                name="groq_model"
                                value={option.value}
                                checked={model === option.value}
                                onChange={() => handleModelChange(option.value)}
                                className="mr-2"
                              />
                              <span>{option.label}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
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
                      onChange={(e) =>
                        setMaxOutputTokens(Number(e.target.value))
                      }
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>

          <div className="flex justify-end gap-3 mt-6">
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
    </Portal>
  );
}
