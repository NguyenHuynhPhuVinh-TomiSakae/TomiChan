import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { getLocalStorage } from "../utils/localStorage";

export const getGeminiResponse = async (
  message: string,
  history: { role: string; parts: { text: string }[] }[] = [],
  onChunk: (chunk: string) => void
) => {
  try {
    const apiKey = getLocalStorage("api_key");

    if (!apiKey) {
      return "Vui lòng nhập API key trong cài đặt.";
    }

    const selectedModel = getLocalStorage("selected_model", "gemini-2.0-flash");
    const systemPrompt = getLocalStorage(
      "system_prompt",
      "Bạn là 1 Chat Bot AI tên là TomiChan được phát triển bởi TomiSakae!"
    );
    const temperature = Number(getLocalStorage("temperature", "1"));
    const topP = Number(getLocalStorage("top_p", "0.95"));
    const topK = Number(getLocalStorage("top_k", "40"));
    const maxOutputTokens = Number(
      getLocalStorage("max_output_tokens", "8192")
    );

    // Lấy cài đặt an toàn riêng cho từng loại
    const harassmentSetting = getLocalStorage(
      "safety_harassment",
      "block_none"
    );
    const hateSpeechSetting = getLocalStorage(
      "safety_hate_speech",
      "block_none"
    );
    const sexuallyExplicitSetting = getLocalStorage(
      "safety_sexually_explicit",
      "block_none"
    );
    const dangerousContentSetting = getLocalStorage(
      "safety_dangerous_content",
      "block_none"
    );
    const civicIntegritySetting = getLocalStorage(
      "safety_civic_integrity",
      "block_none"
    );

    const genAI = new GoogleGenerativeAI(apiKey);

    // Hàm chuyển đổi cài đặt thành threshold
    const getThreshold = (setting: string): HarmBlockThreshold => {
      switch (setting) {
        case "block_low_and_above":
          return HarmBlockThreshold.BLOCK_LOW_AND_ABOVE;
        case "block_medium_and_above":
          return HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE;
        case "block_high_and_above":
          return HarmBlockThreshold.BLOCK_ONLY_HIGH;
        default:
          return HarmBlockThreshold.BLOCK_NONE;
      }
    };

    // Thiết lập cấu hình an toàn cho từng loại
    const getSafetySettings = () => {
      return [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: getThreshold(harassmentSetting),
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: getThreshold(hateSpeechSetting),
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: getThreshold(sexuallyExplicitSetting),
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: getThreshold(dangerousContentSetting),
        },
        {
          category: HarmCategory.HARM_CATEGORY_CIVIC_INTEGRITY,
          threshold: getThreshold(civicIntegritySetting),
        },
      ];
    };

    const model = genAI.getGenerativeModel({
      model: selectedModel,
      systemInstruction: systemPrompt,
      safetySettings: getSafetySettings(),
    });

    const generationConfig = {
      temperature,
      topP,
      topK,
      maxOutputTokens,
      responseMimeType: "text/plain",
    };

    const chatSession = model.startChat({
      generationConfig,
      history: history,
    });

    const result = await chatSession.sendMessageStream(message);

    let fullResponse = "";
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullResponse += chunkText;
      onChunk(chunkText);
    }

    return fullResponse;
  } catch (error) {
    console.error("Lỗi khi gọi API Gemini:", error);
    return "Đã xảy ra lỗi khi xử lý yêu cầu của bạn. Vui lòng thử lại sau.";
  }
};
