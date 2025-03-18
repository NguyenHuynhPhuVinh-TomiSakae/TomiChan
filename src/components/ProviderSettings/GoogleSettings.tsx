import React, { useState, useEffect } from "react";
import ModalWrapper from "./ModalWrapper";
import { getLocalStorage, setLocalStorage } from "../../utils/localStorage";
import { IconChevronUp, IconChevronDown } from "@tabler/icons-react";

interface GoogleSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GoogleSettings({
  isOpen,
  onClose,
}: GoogleSettingsProps) {
  // Khởi tạo state từ localStorage
  const [apiKey, setApiKey] = useState(() =>
    getLocalStorage("google_api_key", "")
  );
  const [model, setModel] = useState(() =>
    getLocalStorage("selected_model", "gemini-2.0-flash")
  );
  const [systemPrompt, setSystemPrompt] = useState(() =>
    getLocalStorage(
      "system_prompt",
      "Bạn là 1 Chat Bot AI tên là TomiChan được phát triển bởi TomiSakae!"
    )
  );
  const [temperature, setTemperature] = useState(() =>
    Number(getLocalStorage("temperature", "1"))
  );
  const [topP, setTopP] = useState(() =>
    Number(getLocalStorage("top_p", "0.95"))
  );
  const [topK, setTopK] = useState(() =>
    Number(getLocalStorage("top_k", "40"))
  );
  const [maxOutputTokens, setMaxOutputTokens] = useState(() =>
    Number(getLocalStorage("max_output_tokens", "8192"))
  );
  const [safetySettings, setSafetySettings] = useState(() => ({
    harassment: getLocalStorage("safety_harassment", "block_none"),
    hateSpeech: getLocalStorage("safety_hate_speech", "block_none"),
    sexuallyExplicit: getLocalStorage("safety_sexually_explicit", "block_none"),
    dangerousContent: getLocalStorage("safety_dangerous_content", "block_none"),
    civicIntegrity: getLocalStorage("safety_civic_integrity", "block_none"),
  }));
  const [isGemini20Open, setIsGemini20Open] = useState(true);
  const [isGemini15Open, setIsGemini15Open] = useState(false);

  // Khi mở modal, reset các giá trị hiển thị từ localStorage
  useEffect(() => {
    if (isOpen) {
      setApiKey(getLocalStorage("google_api_key", ""));
      const savedModel = getLocalStorage("selected_model", "gemini-2.0-flash");
      setModel(savedModel);
      // Mở nhóm chứa model đã chọn
      if (savedModel.includes("2.0")) {
        setIsGemini20Open(true);
        setIsGemini15Open(false);
      } else {
        setIsGemini20Open(false);
        setIsGemini15Open(true);
      }
      setSystemPrompt(
        getLocalStorage(
          "system_prompt",
          "Bạn là 1 Chat Bot AI tên là TomiChan được phát triển bởi TomiSakae!"
        )
      );
      setTemperature(Number(getLocalStorage("temperature", "1")));
      setTopP(Number(getLocalStorage("top_p", "0.95")));
      setTopK(Number(getLocalStorage("top_k", "40")));
      setMaxOutputTokens(Number(getLocalStorage("max_output_tokens", "8192")));
      setSafetySettings({
        harassment: getLocalStorage("safety_harassment", "block_none"),
        hateSpeech: getLocalStorage("safety_hate_speech", "block_none"),
        sexuallyExplicit: getLocalStorage(
          "safety_sexually_explicit",
          "block_none"
        ),
        dangerousContent: getLocalStorage(
          "safety_dangerous_content",
          "block_none"
        ),
        civicIntegrity: getLocalStorage("safety_civic_integrity", "block_none"),
      });
    }
  }, [isOpen]);

  // Hàm cập nhật cài đặt an toàn
  const handleSafetySettingsChange = (category: string, value: string) => {
    setSafetySettings((prev) => ({
      ...prev,
      [category]: value,
    }));
  };

  // Hàm reset về mặc định (giữ nguyên API Key)
  const handleReset = () => {
    const currentApiKey = apiKey;
    setModel("gemini-2.0-flash");
    setSystemPrompt(
      "Bạn là 1 Chat Bot AI tên là TomiChan được phát triển bởi TomiSakae!"
    );
    setTemperature(1);
    setTopP(0.95);
    setTopK(40);
    setMaxOutputTokens(8192);
    setSafetySettings({
      harassment: "block_none",
      hateSpeech: "block_none",
      sexuallyExplicit: "block_none",
      dangerousContent: "block_none",
      civicIntegrity: "block_none",
    });
    setApiKey(currentApiKey);
  };

  const handleSave = () => {
    setLocalStorage("google_api_key", apiKey);
    setLocalStorage("selected_model", model);
    setLocalStorage("system_prompt", systemPrompt);
    setLocalStorage("temperature", temperature.toString());
    setLocalStorage("top_p", topP.toString());
    setLocalStorage("top_k", topK.toString());
    setLocalStorage("max_output_tokens", maxOutputTokens.toString());

    setLocalStorage("safety_harassment", safetySettings.harassment);
    setLocalStorage("safety_hate_speech", safetySettings.hateSpeech);
    setLocalStorage(
      "safety_sexually_explicit",
      safetySettings.sexuallyExplicit
    );
    setLocalStorage(
      "safety_dangerous_content",
      safetySettings.dangerousContent
    );
    setLocalStorage("safety_civic_integrity", safetySettings.civicIntegrity);

    onClose();
  };

  // Chia options thành 2 nhóm
  const gemini20Options = [
    { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
    { value: "gemini-2.0-flash-lite", label: "Gemini 2.0 Flash Lite" },
    { value: "gemini-2.0-pro-exp-02-05", label: "Gemini 2.0 Pro Exp 02-05" },
    {
      value: "gemini-2.0-flash-thinking-exp-01-21",
      label: "Gemini 2.0 Flash Thinking Exp 01-21",
    },
    { value: "gemini-2.0-flash-exp", label: "Gemini 2.0 Flash Exp" },
  ];

  const gemini15Options = [
    { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
    { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
    { value: "gemini-1.5-flash-8b", label: "Gemini 1.5 Flash 8B" },
  ];

  const safetyOptions = [
    { value: "block_none", label: "Không chặn" },
    {
      value: "block_low_and_above",
      label: "Chặn nội dung có hại cấp Thấp và cao hơn",
    },
    {
      value: "block_medium_and_above",
      label: "Chặn nội dung có hại cấp Trung bình và cao hơn",
    },
    {
      value: "block_high_and_above",
      label: "Chỉ chặn nội dung có hại cấp Cao",
    },
  ];

  // Component tái sử dụng cho thanh kéo của cài đặt an toàn
  const SafetySlider = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: string;
    onChange: (newValue: string) => void;
  }) => {
    const currentIndex = safetyOptions.findIndex((opt) => opt.value === value);
    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newIndex = Number(e.target.value);
      onChange(safetyOptions[newIndex].value);
    };

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
        <input
          type="range"
          min="0"
          max="3"
          step="1"
          value={currentIndex === -1 ? 0 : currentIndex}
          onChange={handleSliderChange}
          className="w-full"
        />
        <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {currentIndex !== -1
            ? safetyOptions[currentIndex].label
            : safetyOptions[0].label}
        </div>
      </div>
    );
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Cài đặt Google AI"
      maxWidth="4xl"
      onReset={handleReset}
      onSave={handleSave}
    >
      <form className="flex flex-col gap-6">
        {/* Phần chọn mô hình và cài đặt chung */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cột trái - Cài đặt chung */}
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
                placeholder="AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              />
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Bạn có thể lấy API Key tại{" "}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Google AI Studio
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
              <div className="flex justify-between text-xs mt-1">
                <span>Ít sáng tạo hơn (0)</span>
                <span>Cân bằng (1)</span>
                <span>Sáng tạo hơn (2)</span>
              </div>
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
              <div className="flex justify-between text-xs mt-1">
                <span>Tập trung hơn (0)</span>
                <span>Cân bằng (0.95)</span>
                <span>Đa dạng hơn (1)</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Top K ({topK})
              </label>
              <input
                type="range"
                min="1"
                max="100"
                value={topK}
                onChange={(e) => setTopK(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs mt-1">
                <span>Tập trung hơn (1)</span>
                <span>Cân bằng (40)</span>
                <span>Đa dạng hơn (100)</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Output Tokens ({maxOutputTokens})
              </label>
              <input
                type="range"
                min="1"
                max="8192"
                value={maxOutputTokens}
                onChange={(e) => setMaxOutputTokens(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          {/* Cột phải - Chọn mô hình */}
          <div className="space-y-4 order-1 md:order-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Chọn mô hình
            </label>
            <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
              {[
                {
                  title: "Gemini 2.0",
                  options: gemini20Options,
                  isOpen: isGemini20Open,
                  setIsOpen: setIsGemini20Open,
                },
                {
                  title: "Gemini 1.5",
                  options: gemini15Options,
                  isOpen: isGemini15Open,
                  setIsOpen: setIsGemini15Open,
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
                            name="google_model"
                            value={option.value}
                            checked={model === option.value}
                            onChange={() => setModel(option.value)}
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

        {/* Phần cài đặt an toàn - Hiển thị cuối cùng trên mobile */}
        <div className="order-3 border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
            Cài đặt an toàn
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <SafetySlider
                label="Quấy rối (Harassment)"
                value={safetySettings.harassment}
                onChange={(value) =>
                  handleSafetySettingsChange("harassment", value)
                }
              />
              <SafetySlider
                label="Phát ngôn thù ghét (Hate Speech)"
                value={safetySettings.hateSpeech}
                onChange={(value) =>
                  handleSafetySettingsChange("hateSpeech", value)
                }
              />
              <SafetySlider
                label="Nội dung khiêu dâm (Sexually Explicit)"
                value={safetySettings.sexuallyExplicit}
                onChange={(value) =>
                  handleSafetySettingsChange("sexuallyExplicit", value)
                }
              />
            </div>
            <div className="space-y-4">
              <SafetySlider
                label="Nội dung nguy hiểm (Dangerous Content)"
                value={safetySettings.dangerousContent}
                onChange={(value) =>
                  handleSafetySettingsChange("dangerousContent", value)
                }
              />
              <SafetySlider
                label="Vi phạm tính toàn vẹn công dân (Civic Integrity)"
                value={safetySettings.civicIntegrity}
                onChange={(value) =>
                  handleSafetySettingsChange("civicIntegrity", value)
                }
              />
            </div>
          </div>
        </div>
      </form>
    </ModalWrapper>
  );
}
