/* eslint-disable @typescript-eslint/no-explicit-any */
import { useGeminiChat } from "./useGeminiChat";
import { useGroqChat } from "./useGroqChat";
import { getLocalStorage } from "../utils/localStorage";
import { Message } from "../types";
import { useOpenRouterChat } from "./useOpenRouterChat";

interface ChatProviderReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (message: string, ...args: any[]) => Promise<void>;
  clearMessages: () => void;
  stopGeneration: () => void;
  setMessages: (messages: Message[]) => void;
  regenerateMessage: (messageId: string) => Promise<void>;
}

export function useChatProvider(
  chatId?: string,
  provider?: string
): ChatProviderReturn {
  const selectedProvider =
    provider || getLocalStorage("selected_provider", "google");
  const geminiChat = useGeminiChat(chatId);
  const groqChat = useGroqChat(chatId);
  const openRouterChat = useOpenRouterChat(chatId);

  switch (selectedProvider) {
    case "google":
      return geminiChat;
    case "groq":
      return groqChat;
    case "openrouter":
      return openRouterChat;
    default:
      return geminiChat;
  }
}
