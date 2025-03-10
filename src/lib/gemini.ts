import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

export const getGeminiResponse = async (
  message: string,
  history: { role: string; parts: { text: string }[] }[] = [],
  onChunk: (chunk: string) => void
) => {
  try {
    // Lấy API key từ local storage
    const apiKey = localStorage.getItem("api_key");

    if (!apiKey) {
      return "Vui lòng nhập API key trong cài đặt.";
    }

    // Lấy mô hình đã chọn từ localStorage hoặc sử dụng giá trị mặc định
    const selectedModel =
      localStorage.getItem("selected_model") || "gemini-2.0-flash";

    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: selectedModel,
      systemInstruction:
        "Bạn là 1 Chat Bot AI tên là TomiChan được phát triển bởi TomiSakae!",
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_CIVIC_INTEGRITY,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
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
