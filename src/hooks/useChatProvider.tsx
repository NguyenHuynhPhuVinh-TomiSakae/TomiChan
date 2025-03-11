import { useGeminiChat } from "./useGeminiChat";
import { useGroqChat } from "./useGroqChat";
import { getLocalStorage } from "../utils/localStorage";

export function useChatProvider(chatId?: string, provider?: string) {
  const selectedProvider =
    provider || getLocalStorage("selected_provider", "google");
  const geminiChat = useGeminiChat(chatId);
  const groqChat = useGroqChat(chatId);

  return selectedProvider === "google" ? geminiChat : groqChat;
}
