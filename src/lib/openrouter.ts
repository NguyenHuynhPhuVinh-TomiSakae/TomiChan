/* eslint-disable @typescript-eslint/no-unused-vars */
import { getLocalStorage } from "../utils/localStorage";

export const getOpenRouterResponse = async (
  message: string,
  history: { role: string; content: string }[] = [],
  onChunk: (chunk: string) => void,
  signal?: AbortSignal
) => {
  try {
    const apiKey = getLocalStorage("openrouter_api_key");
    if (!apiKey) {
      return "Vui lòng nhập API key OpenRouter trong cài đặt.";
    }

    const selectedModel = getLocalStorage(
      "openrouter_model",
      "deepseek/deepseek-r1:free"
    );
    const temperature = Number(
      getLocalStorage("openrouter_temperature", "0.7")
    );
    const maxTokens = Number(getLocalStorage("openrouter_max_tokens", "4096"));
    const topP = Number(getLocalStorage("openrouter_top_p", "0.95"));
    const topK = Number(getLocalStorage("openrouter_top_k", "40"));

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin,
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            ...history.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
            { role: "user", content: message },
          ],
          stream: true,
          temperature,
          max_tokens: maxTokens,
          top_p: topP,
          top_k: topK,
        }),
        signal,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Response body is not readable");
    }

    const decoder = new TextDecoder();
    let buffer = "";
    let isInsideThink = false;
    let fullResponse = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        while (true) {
          const lineEnd = buffer.indexOf("\n");
          if (lineEnd === -1) break;

          const line = buffer.slice(0, lineEnd).trim();
          buffer = buffer.slice(lineEnd + 1);

          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0].delta.content;
              const reasoning = parsed.choices[0].delta.reasoning;

              if (reasoning) {
                if (!isInsideThink) {
                  isInsideThink = true;
                  onChunk("<think>");
                }
                const processedReasoning = reasoning.replace(/\n/g, " ");
                onChunk(processedReasoning);
                fullResponse += processedReasoning;
              }

              if (content) {
                if (isInsideThink) {
                  isInsideThink = false;
                  onChunk("</think>\n\n");
                  fullResponse += "</think>\n\n";
                }
                onChunk(content);
                fullResponse += content;
              }
            } catch (e) {
              console.error("Lỗi khi parse JSON chunk:", e);
            }
          }
        }
      }
      return fullResponse;
    } finally {
      reader.cancel();
    }
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw error;
    }
    console.error("Lỗi khi gọi API OpenRouter:", error);
    throw error;
  }
};
