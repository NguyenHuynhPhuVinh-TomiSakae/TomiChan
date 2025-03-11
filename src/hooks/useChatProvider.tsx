import { useGeminiChat } from "./useGeminiChat";
import { useGroqChat } from "./useGroqChat";

export function useChatProvider(chatId?: string) {
  const selectedProvider =
    localStorage.getItem("selected_provider") || "google";
  const geminiChat = useGeminiChat(chatId);
  const groqChat = useGroqChat(chatId);

  return selectedProvider === "google" ? geminiChat : groqChat;
}
