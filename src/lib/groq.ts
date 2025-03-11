import { Groq } from "groq-sdk";
import { getLocalStorage } from "../utils/localStorage";

type Role = "user" | "assistant" | "system";

export const getGroqResponse = async (
  message: string,
  history: { role: string; content: string }[] = [],
  onChunk: (chunk: string) => void,
  signal?: AbortSignal
) => {
  try {
    const apiKey = getLocalStorage("groq_api_key");
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
    const temperature = Number(getLocalStorage("groq_temperature", "1"));
    const topP = Number(getLocalStorage("groq_top_p", "1"));
    const maxOutputTokens = Number(
      getLocalStorage("groq_max_output_tokens", "1024")
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
    for await (const chunk of chatCompletion) {
      const chunkText = chunk.choices[0]?.delta?.content || "";
      fullResponse += chunkText;
      onChunk(chunkText);
    }

    return fullResponse;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw error;
    }
    console.error("Lỗi khi gọi API Groq:", error);
    return "Đã xảy ra lỗi khi xử lý yêu cầu của bạn. Vui lòng thử lại sau.";
  }
};
