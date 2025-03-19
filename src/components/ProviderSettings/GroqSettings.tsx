import React, { useState, useEffect } from "react";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import ModalWrapper from "./ModalWrapper";
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

  const handleSave = () => {
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
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Cài đặt Groq"
      maxWidth="4xl"
      onReset={handleReset}
      onSave={handleSave}
    >
      <form>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4 order-2 md:order-1">
            <div className="mb-4">
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
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-black"
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

          <div className="space-y-4 order-1 md:order-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Chọn mô hình
            </label>
            <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
              {[
                {
                  title: "Nhóm AI phân tích tốt",
                  options: groupAOptions,
                  isOpen: isGroupAOpen,
                  setIsOpen: setIsGroupAOpen,
                },
                {
                  title: "Nhóm AI phản hồi nhanh",
                  options: groupBOptions,
                  isOpen: isGroupBOpen,
                  setIsOpen: setIsGroupBOpen,
                },
              ].map((group) => (
                <div
                  key={group.title}
                  className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => group.setIsOpen(!group.isOpen)}
                    className="w-full flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <span className="font-medium">{group.title}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {group.options.length} mô hình
                      </span>
                      {group.isOpen ? (
                        <IconChevronUp size={18} />
                      ) : (
                        <IconChevronDown size={18} />
                      )}
                    </div>
                  </button>
                  {group.isOpen && (
                    <div className="p-2 space-y-2">
                      {group.options.map((option) => (
                        <label
                          key={option.value}
                          className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors ${
                            model === option.value
                              ? "bg-blue-50 dark:bg-blue-900"
                              : "hover:bg-gray-100 dark:hover:bg-gray-800"
                          }`}
                        >
                          <input
                            type="radio"
                            name="groq_model"
                            value={option.value}
                            checked={model === option.value}
                            onChange={() => handleModelChange(option.value)}
                            className="mr-2"
                          />
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {option.value}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </form>
    </ModalWrapper>
  );
}
