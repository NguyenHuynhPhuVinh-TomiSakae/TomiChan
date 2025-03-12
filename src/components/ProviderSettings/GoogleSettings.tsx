import React, { useState, useEffect } from "react";
import { IconX } from "@tabler/icons-react";
import Portal from "../Portal";
import { getLocalStorage, setLocalStorage } from "../../utils/localStorage";

interface GoogleSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GoogleSettings({
  isOpen,
  onClose,
}: GoogleSettingsProps) {
  // Khởi tạo tất cả state từ localStorage
  const [apiKey, setApiKey] = useState(() => getLocalStorage("api_key", ""));
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

  // Reset form khi mở modal
  useEffect(() => {
    if (isOpen) {
      setApiKey(getLocalStorage("api_key", ""));
      setModel(getLocalStorage("selected_model", "gemini-2.0-flash"));
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

  // Hàm xử lý an toàn
  const handleSafetySettingsChange = (category: string, value: string) => {
    setSafetySettings((prev) => ({
      ...prev,
      [category]: value,
    }));
  };

  // Hàm reset về giá trị mặc định
  const handleReset = () => {
    // Giữ nguyên API key
    const currentApiKey = apiKey;

    // Reset các giá trị về mặc định
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

    // Giữ nguyên API key
    setApiKey(currentApiKey);
  };

  // Thay đổi handleSubmit thành handleClose
  const handleClose = () => {
    // Lưu các cài đặt vào localStorage
    setLocalStorage("api_key", apiKey);
    setLocalStorage("selected_model", model);
    setLocalStorage("system_prompt", systemPrompt);
    setLocalStorage("temperature", temperature.toString());
    setLocalStorage("top_p", topP.toString());
    setLocalStorage("top_k", topK.toString());
    setLocalStorage("max_output_tokens", maxOutputTokens.toString());

    // Lưu cài đặt an toàn
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

  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
        <div className="bg-white dark:bg-black md:rounded-lg w-full max-w-4xl p-6 relative text-black dark:text-white dark:border dark:border-white max-h-[90vh] overflow-y-auto scrollbar-hide">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Cài đặt Google AI</h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors cursor-pointer"
            >
              <IconX size={20} />
            </button>
          </div>

          <form>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Chọn mô hình
                  </label>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-black"
                  >
                    <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                    <option value="gemini-2.0-flash-lite">
                      Gemini 2.0 Flash Lite
                    </option>
                    <option value="gemini-2.0-pro-exp-02-05">
                      Gemini 2.0 Pro Exp 02-05
                    </option>
                    <option value="gemini-2.0-flash-thinking-exp-01-21">
                      Gemini 2.0 Flash Thinking Exp 01-21
                    </option>
                    <option value="gemini-2.0-flash-exp">
                      Gemini 2.0 Flash Exp
                    </option>
                    <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                    <option value="gemini-1.5-flash-8b">
                      Gemini 1.5 Flash 8B
                    </option>
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

              <div className="space-y-4">
                <h3 className="text-lg font-medium mb-3">Cài đặt an toàn</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quấy rối (Harassment)
                  </label>
                  <select
                    value={safetySettings.harassment}
                    onChange={(e) =>
                      handleSafetySettingsChange("harassment", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-black"
                  >
                    <option value="block_none">Không chặn</option>
                    <option value="block_low_and_above">
                      Chặn nội dung có hại cấp Thấp và cao hơn
                    </option>
                    <option value="block_medium_and_above">
                      Chặn nội dung có hại cấp Trung bình và cao hơn
                    </option>
                    <option value="block_high_and_above">
                      Chỉ chặn nội dung có hại cấp Cao
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phát ngôn thù ghét (Hate Speech)
                  </label>
                  <select
                    value={safetySettings.hateSpeech}
                    onChange={(e) =>
                      handleSafetySettingsChange("hateSpeech", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-black"
                  >
                    <option value="block_none">Không chặn</option>
                    <option value="block_low_and_above">
                      Chặn nội dung có hại cấp Thấp và cao hơn
                    </option>
                    <option value="block_medium_and_above">
                      Chặn nội dung có hại cấp Trung bình và cao hơn
                    </option>
                    <option value="block_high_and_above">
                      Chỉ chặn nội dung có hại cấp Cao
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nội dung khiêu dâm (Sexually Explicit)
                  </label>
                  <select
                    value={safetySettings.sexuallyExplicit}
                    onChange={(e) =>
                      handleSafetySettingsChange(
                        "sexuallyExplicit",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-black"
                  >
                    <option value="block_none">Không chặn</option>
                    <option value="block_low_and_above">
                      Chặn nội dung có hại cấp Thấp và cao hơn
                    </option>
                    <option value="block_medium_and_above">
                      Chặn nội dung có hại cấp Trung bình và cao hơn
                    </option>
                    <option value="block_high_and_above">
                      Chỉ chặn nội dung có hại cấp Cao
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nội dung nguy hiểm (Dangerous Content)
                  </label>
                  <select
                    value={safetySettings.dangerousContent}
                    onChange={(e) =>
                      handleSafetySettingsChange(
                        "dangerousContent",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-black"
                  >
                    <option value="block_none">Không chặn</option>
                    <option value="block_low_and_above">
                      Chặn nội dung có hại cấp Thấp và cao hơn
                    </option>
                    <option value="block_medium_and_above">
                      Chặn nội dung có hại cấp Trung bình và cao hơn
                    </option>
                    <option value="block_high_and_above">
                      Chỉ chặn nội dung có hại cấp Cao
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Vi phạm tính toàn vẹn công dân (Civic Integrity)
                  </label>
                  <select
                    value={safetySettings.civicIntegrity}
                    onChange={(e) =>
                      handleSafetySettingsChange(
                        "civicIntegrity",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-black"
                  >
                    <option value="block_none">Không chặn</option>
                    <option value="block_low_and_above">
                      Chặn nội dung có hại cấp Thấp và cao hơn
                    </option>
                    <option value="block_medium_and_above">
                      Chặn nội dung có hại cấp Trung bình và cao hơn
                    </option>
                    <option value="block_high_and_above">
                      Chỉ chặn nội dung có hại cấp Cao
                    </option>
                  </select>
                </div>
              </div>
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
          </form>
        </div>
      </div>
    </Portal>
  );
}
