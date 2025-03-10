import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

export const getGeminiResponse = async (
  message: string,
  history: { role: string; parts: { text: string }[] }[] = []
) => {
  try {
    // Lấy API key từ local storage
    const apiKey = localStorage.getItem("api_key");

    if (!apiKey) {
      return "Vui lòng nhập API key trong cài đặt.";
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });

    const generationConfig = {
      temperature: 1,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
      responseMimeType: "text/plain",
    };

    const chatSession = model.startChat({
      generationConfig,
      history: history,
    });

    const result = await chatSession.sendMessage(message);
    return result.response.text();
  } catch (error) {
    console.error("Lỗi khi gọi API Gemini:", error);
    return "Đã xảy ra lỗi khi xử lý yêu cầu của bạn. Vui lòng thử lại sau.";
  }
};
