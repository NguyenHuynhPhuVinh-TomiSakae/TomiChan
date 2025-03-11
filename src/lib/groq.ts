import { Groq } from "groq-sdk";
import { getLocalStorage } from "../utils/localStorage";

type Role = "user" | "assistant" | "system";

export const getGroqResponse = async (
  message: string,
  history: { role: string; content: string }[] = [],
  onChunk: (chunk: string) => void
) => {
  try {
    const apiKey = getLocalStorage("groq_api_key");
    if (!apiKey) {
      return "Vui lòng nhập API key Groq trong cài đặt.";
    }

    const selectedModel = getLocalStorage("groq_model", "mixtral-8x7b-32768");
    const temperature = Number(getLocalStorage("temperature", "1"));
    const topP = Number(getLocalStorage("top_p", "0.95"));
    const maxOutputTokens = Number(
      getLocalStorage("max_output_tokens", "8192")
    );

    const groq = new Groq({
      apiKey: apiKey,
    });

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        ...history.map((msg) => ({
          role: (msg.role === "user" ? "user" : "assistant") as Role,
          content: msg.content,
        })),
        { role: "user" as Role, content: message },
      ],
      model: selectedModel,
      temperature,
      max_tokens: maxOutputTokens,
      top_p: topP,
      stream: true,
    });

    let fullResponse = "";
    for await (const chunk of chatCompletion) {
      const chunkText = chunk.choices[0]?.delta?.content || "";
      fullResponse += chunkText;
      onChunk(chunkText);
    }

    return fullResponse;
  } catch (error) {
    console.error("Lỗi khi gọi API Groq:", error);
    return "Đã xảy ra lỗi khi xử lý yêu cầu của bạn. Vui lòng thử lại sau.";
  }
};
