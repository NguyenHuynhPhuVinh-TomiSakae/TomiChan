/* eslint-disable @typescript-eslint/no-unused-vars */
import { useChatCommon } from "./useChatCommon";
import { getOpenRouterResponse } from "../../lib/openrouter";

export function useOpenRouterChat(chatId?: string) {
  return useChatCommon({
    chatId,
    provider: "openrouter",
    getResponse: getOpenRouterResponse,
  });
}
