/* eslint-disable @typescript-eslint/no-unused-vars */
import { useChatCommon } from "./useChatCommon";
import { getGroqResponse } from "../../lib/groq";

export function useGroqChat(chatId?: string) {
  return useChatCommon({
    chatId,
    provider: "groq",
    getResponse: getGroqResponse,
  });
}
