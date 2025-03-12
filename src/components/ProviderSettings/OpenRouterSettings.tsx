import React, { useState, useEffect } from "react";
import { IconX, IconChevronDown, IconChevronUp } from "@tabler/icons-react";
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
    getLocalStorage("openrouter_model", "deepseek/deepseek-r1:free")
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

  // Các trạng thái collapse cho nhóm các model
  const [isGoogleOpen, setIsGoogleOpen] = useState(false);
  const [isDeepSeekOpen, setIsDeepSeekOpen] = useState(false);
  const [isQwenOpen, setIsQwenOpen] = useState(false);
  const [isMetaOpen, setIsMetaOpen] = useState(false);
  const [isMistralOpen, setIsMistralOpen] = useState(false);
  const [isOthersOpen, setIsOthersOpen] = useState(false);

  // Định nghĩa option theo nhóm
  const groupGoogleOptions = [
    { value: "google/gemma-3-27b-it:free", label: "Gemma 3 27B" },
    {
      value: "google/gemini-2.0-flash-lite-preview-02-05:free",
      label: "Gemini Flash Lite 2.0 Preview",
    },
    {
      value: "google/gemini-2.0-pro-exp-02-05:free",
      label: "Gemini Pro 2.0 Experimental",
    },
    {
      value: "google/gemini-2.0-flash-thinking-exp:free",
      label: "Gemini 2.0 Flash Thinking Experimental",
    },
    {
      value: "google/gemini-2.0-flash-exp:free",
      label: "Gemini Flash 2.0 Experimental",
    },
    { value: "google/gemma-2-9b-it:free", label: "Gemma 2 9B" },
  ];

  const groupDeepSeekOptions = [
    { value: "deepseek/deepseek-r1-zero:free", label: "DeepSeek R1 Zero" },
    {
      value: "deepseek/deepseek-r1-distill-qwen-32b:free",
      label: "R1 Distill Qwen 32B",
    },
    {
      value: "deepseek/deepseek-r1-distill-llama-70b:free",
      label: "R1 Distill Llama 70B",
    },
    { value: "deepseek/deepseek-r1:free", label: "DeepSeek R1" },
    { value: "deepseek/deepseek-chat:free", label: "DeepSeek V3" },
  ];

  const groupQwenOptions = [
    { value: "qwen/qwq-32b:free", label: "QwQ 32B" },
    {
      value: "qwen/qwen2.5-vl-72b-instruct:free",
      label: "Qwen2.5 VL 72B Instruct",
    },
    {
      value: "qwen/qwen-2.5-coder-32b-instruct:free",
      label: "Qwen2.5 Coder 32B Instruct",
    },
    { value: "qwen/qwen-2-7b-instruct:free", label: "Qwen 2 7B Instruct" },
  ];

  const groupMetaOptions = [
    {
      value: "meta-llama/llama-3.3-70b-instruct:free",
      label: "Llama 3.3 70B Instruct",
    },
    {
      value: "meta-llama/llama-3.2-3b-instruct:free",
      label: "Llama 3.2 3B Instruct",
    },
    {
      value: "meta-llama/llama-3.2-1b-instruct:free",
      label: "Llama 3.2 1B Instruct",
    },
    {
      value: "meta-llama/llama-3.2-11b-vision-instruct:free",
      label: "Llama 3.2 11B Vision Instruct",
    },
    {
      value: "meta-llama/llama-3.1-8b-instruct:free",
      label: "Llama 3.1 8B Instruct",
    },
    {
      value: "meta-llama/llama-3-8b-instruct:free",
      label: "Llama 3 8B Instruct",
    },
  ];

  const groupMistralOptions = [
    {
      value: "mistralai/mistral-small-24b-instruct-2501:free",
      label: "Mistral Small 3",
    },
    { value: "mistralai/mistral-nemo:free", label: "Mistral Nemo" },
    {
      value: "mistralai/mistral-7b-instruct:free",
      label: "Mistral 7B Instruct",
    },
  ];

  const groupOthersOptions = [
    {
      value: "moonshotai/moonlight-16b-a3b-instruct:free",
      label: "Moonshot AI: Moonlight 16B A3B Instruct",
    },
    {
      value: "nousresearch/deephermes-3-llama-3-8b-preview:free",
      label: "Nous: DeepHermes 3 Llama 3 8B Preview",
    },
    {
      value: "cognitivecomputations/dolphin3.0-r1-mistral-24b:free",
      label: "Dolphin3.0 R1 Mistral 24B",
    },
    {
      value: "microsoft/phi-3-mini-128k-instruct:free",
      label: "Microsoft: Phi-3 Mini 128K Instruct",
    },
    {
      value: "microsoft/phi-3-medium-128k-instruct:free",
      label: "Microsoft: Phi-3 Medium 128K Instruct",
    },
    { value: "openchat/openchat-7b:free", label: "OpenChat 3.5 7B" },
  ];

  // Khi mở modal, load lại dữ liệu và mở nhóm chứa model đã lưu
  useEffect(() => {
    if (isOpen) {
      setApiKey(getLocalStorage("openrouter_api_key", ""));
      const savedModel = getLocalStorage(
        "openrouter_model",
        "deepseek/deepseek-r1:free"
      );
      setModel(savedModel);
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

      // Mở nhóm chứa model vừa lưu
      if (savedModel.startsWith("google/")) {
        setIsGoogleOpen(true);
        setIsDeepSeekOpen(false);
        setIsQwenOpen(false);
        setIsMetaOpen(false);
        setIsMistralOpen(false);
        setIsOthersOpen(false);
      } else if (savedModel.startsWith("deepseek/")) {
        setIsGoogleOpen(false);
        setIsDeepSeekOpen(true);
        setIsQwenOpen(false);
        setIsMetaOpen(false);
        setIsMistralOpen(false);
        setIsOthersOpen(false);
      } else if (savedModel.startsWith("qwen/")) {
        setIsGoogleOpen(false);
        setIsDeepSeekOpen(false);
        setIsQwenOpen(true);
        setIsMetaOpen(false);
        setIsMistralOpen(false);
        setIsOthersOpen(false);
      } else if (savedModel.startsWith("meta-llama/")) {
        setIsGoogleOpen(false);
        setIsDeepSeekOpen(false);
        setIsQwenOpen(false);
        setIsMetaOpen(true);
        setIsMistralOpen(false);
        setIsOthersOpen(false);
      } else if (savedModel.startsWith("mistralai/")) {
        setIsGoogleOpen(false);
        setIsDeepSeekOpen(false);
        setIsQwenOpen(false);
        setIsMetaOpen(false);
        setIsMistralOpen(true);
        setIsOthersOpen(false);
      } else {
        setIsGoogleOpen(false);
        setIsDeepSeekOpen(false);
        setIsQwenOpen(false);
        setIsMetaOpen(false);
        setIsMistralOpen(false);
        setIsOthersOpen(true);
      }
    }
  }, [isOpen]);

  const handleModelChange = (selectedModel: string) => {
    setModel(selectedModel);
  };

  const handleReset = () => {
    const currentApiKey = apiKey;
    setModel("deepseek/deepseek-r1:free");
    setSystemPrompt(
      "Bạn là 1 Chat Bot AI tên là TomiChan được phát triển bởi TomiSakae!"
    );
    setTemperature(0.7);
    setMaxTokens(4096);
    setTopP(0.95);
    setTopK(40);
    setApiKey(currentApiKey);
    // Mở nhóm mặc định của Google
    setIsGoogleOpen(true);
    setIsDeepSeekOpen(false);
    setIsQwenOpen(false);
    setIsMetaOpen(false);
    setIsMistralOpen(false);
    setIsOthersOpen(false);
  };

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
              <div className="mb-4">
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
              {/* Phần chọn mô hình với nhóm và radio */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Chọn mô hình
                </label>
                <div className="space-y-3">
                  {/* Nhóm Google */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setIsGoogleOpen(!isGoogleOpen)}
                      className="w-full flex justify-between items-center p-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none"
                    >
                      <span>Google</span>
                      {isGoogleOpen ? (
                        <IconChevronUp size={18} />
                      ) : (
                        <IconChevronDown size={18} />
                      )}
                    </button>
                    {isGoogleOpen && (
                      <div className="mt-2 space-y-2">
                        {groupGoogleOptions.map((option) => (
                          <label
                            key={option.value}
                            className="flex items-center cursor-pointer border rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-900"
                          >
                            <input
                              type="radio"
                              name="openrouter_model"
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
                  {/* Nhóm DeepSeek */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setIsDeepSeekOpen(!isDeepSeekOpen)}
                      className="w-full flex justify-between items-center p-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none"
                    >
                      <span>DeepSeek</span>
                      {isDeepSeekOpen ? (
                        <IconChevronUp size={18} />
                      ) : (
                        <IconChevronDown size={18} />
                      )}
                    </button>
                    {isDeepSeekOpen && (
                      <div className="mt-2 space-y-2">
                        {groupDeepSeekOptions.map((option) => (
                          <label
                            key={option.value}
                            className="flex items-center cursor-pointer border rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-900"
                          >
                            <input
                              type="radio"
                              name="openrouter_model"
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
                  {/* Nhóm Qwen */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setIsQwenOpen(!isQwenOpen)}
                      className="w-full flex justify-between items-center p-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none"
                    >
                      <span>Qwen</span>
                      {isQwenOpen ? (
                        <IconChevronUp size={18} />
                      ) : (
                        <IconChevronDown size={18} />
                      )}
                    </button>
                    {isQwenOpen && (
                      <div className="mt-2 space-y-2">
                        {groupQwenOptions.map((option) => (
                          <label
                            key={option.value}
                            className="flex items-center cursor-pointer border rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-900"
                          >
                            <input
                              type="radio"
                              name="openrouter_model"
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
                  {/* Nhóm Meta */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setIsMetaOpen(!isMetaOpen)}
                      className="w-full flex justify-between items-center p-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none"
                    >
                      <span>Meta</span>
                      {isMetaOpen ? (
                        <IconChevronUp size={18} />
                      ) : (
                        <IconChevronDown size={18} />
                      )}
                    </button>
                    {isMetaOpen && (
                      <div className="mt-2 space-y-2">
                        {groupMetaOptions.map((option) => (
                          <label
                            key={option.value}
                            className="flex items-center cursor-pointer border rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-900"
                          >
                            <input
                              type="radio"
                              name="openrouter_model"
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
                  {/* Nhóm Mistral */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setIsMistralOpen(!isMistralOpen)}
                      className="w-full flex justify-between items-center p-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none"
                    >
                      <span>Mistral</span>
                      {isMistralOpen ? (
                        <IconChevronUp size={18} />
                      ) : (
                        <IconChevronDown size={18} />
                      )}
                    </button>
                    {isMistralOpen && (
                      <div className="mt-2 space-y-2">
                        {groupMistralOptions.map((option) => (
                          <label
                            key={option.value}
                            className="flex items-center cursor-pointer border rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-900"
                          >
                            <input
                              type="radio"
                              name="openrouter_model"
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
                  {/* Nhóm Others */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setIsOthersOpen(!isOthersOpen)}
                      className="w-full flex justify-between items-center p-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none"
                    >
                      <span>Others</span>
                      {isOthersOpen ? (
                        <IconChevronUp size={18} />
                      ) : (
                        <IconChevronDown size={18} />
                      )}
                    </button>
                    {isOthersOpen && (
                      <div className="mt-2 space-y-2">
                        {groupOthersOptions.map((option) => (
                          <label
                            key={option.value}
                            className="flex items-center cursor-pointer border rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-900"
                          >
                            <input
                              type="radio"
                              name="openrouter_model"
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

              <form className="space-y-4">
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
