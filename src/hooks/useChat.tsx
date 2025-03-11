import { useState, useEffect } from "react";
import { Message, ChatHistory } from "../types";
import { chatDB } from "../utils/db";

export function useChat(chatId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadChat = async () => {
      if (chatId) {
        const chat = await chatDB.getChat(chatId);
        if (chat) {
          setMessages(chat.messages);
        } else {
          setMessages([]);
        }
      }
    };

    loadChat();
  }, [chatId]);

  const saveChat = async (messages: Message[], currentChatId?: string) => {
    if (currentChatId) {
      const chat: ChatHistory = {
        id: currentChatId,
        title: messages[0]?.content.slice(0, 50) + "...",
        messages: messages,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await chatDB.saveChat(chat);
    }
  };

  const clearMessages = () => {
    setMessages([]);
    setError(null);
  };

  return {
    messages,
    setMessages,
    isLoading,
    setIsLoading,
    error,
    setError,
    saveChat,
    clearMessages,
  };
}
