import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { getLocalStorage } from "../utils/localStorage";

export const getGeminiResponse = async (
  message: string,
  history: { role: string; parts: { text: string }[] }[] = [],
  onChunk: (chunk: string) => void,
  signal?: AbortSignal,
  systemPrompt?: string,
  images?: { url: string; data: string }[],
  files?: { name: string; type: string; data: string }[],
  videos?: { url: string; data: string }[],
  audios?: { url: string; data: string }[]
) => {
  try {
    const apiKey = getLocalStorage("api_key");

    if (!apiKey) {
      return "Vui lòng nhập API key trong cài đặt.";
    }

    const selectedModel = getLocalStorage("selected_model", "gemini-2.0-flash");
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

    // Kiểm tra xem có hình ảnh, tài liệu, video hoặc âm thanh không
    const hasAttachments =
      (images && images.length > 0) ||
      (files && files.length > 0) ||
      (videos && videos.length > 0) ||
      (audios && audios.length > 0);

    // Xử lý trường hợp không có tài liệu đính kèm
    if (!hasAttachments) {
      const chatSession = model.startChat({
        generationConfig,
        history: history,
      });

      const result = await chatSession.sendMessageStream(message, { signal });

      let fullResponse = "";
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullResponse += chunkText;
        onChunk(chunkText);
      }

      return fullResponse;
    }

    // Xử lý trường hợp có hình ảnh, tài liệu và/hoặc video
    const contentParts = [];

    // Thêm các ảnh vào contentParts nếu có
    if (images && images.length > 0) {
      for (const image of images) {
        try {
          // Lấy phần dữ liệu base64 từ chuỗi data URI
          let base64Data = "";
          let mimeType = "image/jpeg"; // Mặc định ban đầu

          if (image.data.startsWith("data:")) {
            // Trích xuất MIME type trực tiếp từ data URI
            const mimeMatch = image.data.match(/data:([^;]+);/);
            if (mimeMatch && mimeMatch[1]) {
              mimeType = mimeMatch[1].toLowerCase();
              console.log("Đã phát hiện MIME type:", mimeType);
            }

            // Trích xuất phần base64
            const parts = image.data.split(",");
            if (parts.length > 1) {
              base64Data = parts[1];
            }
          } else {
            // Nếu không phải data URI, giả sử là base64 thuần
            base64Data = image.data;
          }

          if (!base64Data) {
            console.error("Không thể trích xuất dữ liệu base64 từ ảnh");
            continue;
          }

          // Kiểm tra nếu base64 hợp lệ (có thể dùng regex đơn giản)
          if (!/^[A-Za-z0-9+/=]+$/.test(base64Data)) {
            // Cố gắng làm sạch chuỗi base64
            base64Data = base64Data.replace(/[^A-Za-z0-9+/=]/g, "");
            console.warn("Đã làm sạch chuỗi base64 do có ký tự không hợp lệ");
          }

          // Thêm vào parts
          contentParts.push({
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          });

          console.log(
            "Đã thêm ảnh với MIME:",
            mimeType,
            "và độ dài base64:",
            base64Data.length
          );
        } catch (error) {
          console.error("Lỗi khi xử lý ảnh:", error);
          continue;
        }
      }
    }

    // Thêm các tệp tin vào contentParts nếu có
    if (files && files.length > 0) {
      for (const file of files) {
        // Lấy phần dữ liệu base64 từ chuỗi data URI
        const base64Data = file.data.split(",")[1] || file.data;

        contentParts.push({
          inlineData: {
            data: base64Data,
            mimeType: file.type,
          },
        });
      }
    }

    // Thêm các video vào contentParts nếu có
    if (videos && videos.length > 0) {
      for (const video of videos) {
        try {
          // Lấy phần dữ liệu base64 từ chuỗi data URI
          let base64Data = "";
          let mimeType = "video/mp4"; // Mặc định ban đầu

          if (video.data.startsWith("data:")) {
            // Trích xuất MIME type trực tiếp từ data URI
            const mimeMatch = video.data.match(/data:([^;]+);/);
            if (mimeMatch && mimeMatch[1]) {
              mimeType = mimeMatch[1].toLowerCase();
              console.log("Đã phát hiện MIME type video:", mimeType);
            }

            // Trích xuất phần base64
            const parts = video.data.split(",");
            if (parts.length > 1) {
              base64Data = parts[1];
            }
          } else {
            // Nếu không phải data URI, giả sử là base64 thuần
            base64Data = video.data;
          }

          if (!base64Data) {
            console.error("Không thể trích xuất dữ liệu base64 từ video");
            continue;
          }

          // Kiểm tra nếu base64 hợp lệ
          if (!/^[A-Za-z0-9+/=]+$/.test(base64Data)) {
            // Cố gắng làm sạch chuỗi base64
            base64Data = base64Data.replace(/[^A-Za-z0-9+/=]/g, "");
            console.warn(
              "Đã làm sạch chuỗi base64 video do có ký tự không hợp lệ"
            );
          }

          // Thêm vào parts
          contentParts.push({
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          });

          console.log(
            "Đã thêm video với MIME:",
            mimeType,
            "và độ dài base64:",
            base64Data.length
          );
        } catch (error) {
          console.error("Lỗi khi xử lý video:", error);
          continue;
        }
      }
    }

    // Thêm các audio vào contentParts nếu có
    if (audios && audios.length > 0) {
      for (const audio of audios) {
        try {
          // Lấy phần dữ liệu base64 từ chuỗi data URI
          let base64Data = "";
          let mimeType = "audio/mp3"; // Mặc định ban đầu

          if (audio.data.startsWith("data:")) {
            // Trích xuất MIME type trực tiếp từ data URI
            const mimeMatch = audio.data.match(/data:([^;]+);/);
            if (mimeMatch && mimeMatch[1]) {
              mimeType = mimeMatch[1].toLowerCase();
              console.log("Đã phát hiện MIME type audio:", mimeType);
            }

            // Trích xuất phần base64
            const parts = audio.data.split(",");
            if (parts.length > 1) {
              base64Data = parts[1];
            }
          } else {
            // Nếu không phải data URI, giả sử là base64 thuần
            base64Data = audio.data;
          }

          if (!base64Data) {
            console.error("Không thể trích xuất dữ liệu base64 từ audio");
            continue;
          }

          // Kiểm tra nếu base64 hợp lệ
          if (!/^[A-Za-z0-9+/=]+$/.test(base64Data)) {
            // Cố gắng làm sạch chuỗi base64
            base64Data = base64Data.replace(/[^A-Za-z0-9+/=]/g, "");
            console.warn(
              "Đã làm sạch chuỗi base64 audio do có ký tự không hợp lệ"
            );
          }

          // Thêm vào parts
          contentParts.push({
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          });

          console.log(
            "Đã thêm audio với MIME:",
            mimeType,
            "và độ dài base64:",
            base64Data.length
          );
        } catch (error) {
          console.error("Lỗi khi xử lý audio:", error);
          continue;
        }
      }
    }

    // Thêm nội dung tin nhắn
    if (message) {
      contentParts.push({ text: message });
    }

    // Gọi generateContentStream với đúng định dạng
    const result = await model.generateContentStream(contentParts, {
      signal,
    });

    let fullResponse = "";
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullResponse += chunkText;
      onChunk(chunkText);
    }

    return fullResponse;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw error;
    }
    console.error("Lỗi khi gọi API Gemini:", error);
    throw error;
  }
};
