import { useChatCommon } from "./useChatCommon";
import { getGeminiResponse } from "../../lib/gemini";

type GeminiHistory = {
  role: string;
  parts: (
    | { text: string }
    | { inlineData: { data: string; mimeType: string } }
  )[];
}[];

export function useGeminiChat(chatId?: string) {
  return useChatCommon<GeminiHistory>({
    chatId,
    provider: "gemini",
    getResponse: getGeminiResponse,
  });
}
