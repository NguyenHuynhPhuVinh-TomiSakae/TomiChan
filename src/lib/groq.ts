import { Groq } from "groq-sdk";
import { getLocalStorage } from "../utils/localStorage";
import { getApiKey } from "../utils/getApiKey";

type Role = "user" | "assistant" | "system";

export const getGroqResponse = async (
  message: string,
  history: { role: string; content: string }[] = [],
  onChunk: (chunk: string) => void,
  signal?: AbortSignal
) => {
  try {
    const apiKey = await getApiKey("groq", "groq_api_key");
    if (!apiKey) {
      return "Vui lòng nhập API key Groq trong cài đặt.";
    }

    const selectedModel = getLocalStorage(
      "groq_model",
      "deepseek-r1-distill-llama-70b"
    );
    const systemPrompt = getLocalStorage(
      "groq_system_prompt",
      "Bạn là 1 Chat Bot AI tên là TomiChan được phát triển bởi TomiSakae!"
    );
    const temperature = Number(getLocalStorage("groq_temperature", "0.6"));
    const topP = Number(getLocalStorage("groq_top_p", "0.95"));
    const maxOutputTokens = Number(
      getLocalStorage("groq_max_output_tokens", "4096")
    );

    const groq = new Groq({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true,
    });

    const chatCompletion = await groq.chat.completions.create(
      {
        messages: [
          {
            role: "system" as Role,
            content: systemPrompt,
          },
          ...history.map((msg) => ({
            role: (msg.role === "user" ? "user" : "assistant") as Role,
            content: msg.content,
          })),
          { role: "user" as Role, content: message },
        ],
        model: selectedModel,
        temperature,
        max_completion_tokens: maxOutputTokens,
        top_p: topP,
        stream: true,
        stop: null,
      },
      { signal }
    );

    let fullResponse = "";
    let isInsideThink = false;

    for await (const chunk of chatCompletion) {
      let chunkText = chunk.choices[0]?.delta?.content || "";

      // Kiểm tra xem chunk có mở đầu thẻ think không
      if (chunkText.includes("<think>")) {
        isInsideThink = true;
      }

      // Nếu đang trong think, thay thế xuống dòng bằng khoảng trắng
      if (isInsideThink) {
        chunkText = chunkText.replace(/\n/g, " ");
      }

      // Kiểm tra xem chunk có đóng thẻ think không
      if (chunkText.includes("</think>")) {
        isInsideThink = false;
        // Thêm 2 dòng trống sau </think>
        chunkText = chunkText.replace("</think>", "</think>\n\n");
      }

      fullResponse += chunkText;
      onChunk(chunkText);
    }

    // Đảm bảo có đủ dòng trống sau </think> trong toàn bộ response
    fullResponse = fullResponse.replace(
      /<\/think>(?!\n\s*\n)/g,
      "</think>\n\n"
    );

    return fullResponse;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw error;
    }
    console.error("Lỗi khi gọi API Groq:", error);
    return "Đã xảy ra lỗi khi xử lý yêu cầu của bạn. Vui lòng thử lại sau.";
  }
};
