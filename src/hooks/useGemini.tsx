/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
import { Message, ChatHistory } from "../types";
import { getGeminiResponse } from "../lib/gemini";
import { chatDB } from "../utils/db";

export function useGemini(chatId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load tin nhắn khi chatId thay đổi
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
  }, [chatId]); // Chỉ phụ thuộc vào chatId

  const sendMessage = async (message: string) => {
    // Lưu lại chatId và messages hiện tại
    const currentChatId = chatId;
    const currentMessages = [...messages];

    const apiKey = localStorage.getItem("api_key");

    if (!apiKey) {
      // Thông báo cho người dùng nhập API key
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: message,
          sender: "user",
        },
        {
          id: (Date.now() + 1).toString(),
          content:
            "Vui lòng nhập API key Gemini trong cài đặt để sử dụng chatbot.",
          sender: "bot",
        },
      ]);
      return;
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      content: message,
      sender: "user",
    };

    const botMessageId = (Date.now() + 1).toString();
    const newBotMessage: Message = {
      id: botMessageId,
      content: "",
      sender: "bot" as const,
    };

    // Cập nhật messages với cả user message và bot message
    const updatedMessages = [...currentMessages, newMessage, newBotMessage];
    setMessages(updatedMessages);
    setIsLoading(true);
    setError(null);

    try {
      const chatHistory = currentMessages.map((msg) => ({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      }));

      chatHistory.push({
        role: "user",
        parts: [{ text: message }],
      });

      let accumulatedMessages = [...currentMessages, newMessage];

      const handleChunk = (chunk: string) => {
        setMessages((prev) => {
          const newMessages = [...prev];
          const botMessageIndex = newMessages.findIndex(
            (msg) => msg.id === botMessageId
          );

          if (botMessageIndex !== -1) {
            newMessages[botMessageIndex] = {
              ...newMessages[botMessageIndex],
              content: newMessages[botMessageIndex].content + chunk,
            };

            // Cập nhật accumulated messages
            accumulatedMessages = newMessages;

            // Lưu vào DB với accumulated messages
            if (currentChatId) {
              const chat: ChatHistory = {
                id: currentChatId,
                title: accumulatedMessages[0]?.content.slice(0, 50) + "...",
                messages: accumulatedMessages,
                createdAt: new Date(),
                updatedAt: new Date(),
              };
              chatDB.saveChat(chat);
            }
          }

          return newMessages;
        });
      };

      await getGeminiResponse(message, chatHistory, handleChunk);
    } catch (error) {
      setError("Đã xảy ra lỗi khi xử lý yêu cầu");

      // Cập nhật messages với thông báo lỗi
      setMessages((prev) => {
        const updatedMessages = [...prev];
        const botMessageIndex = updatedMessages.findIndex(
          (msg) => msg.id === botMessageId
        );

        if (botMessageIndex !== -1) {
          updatedMessages[botMessageIndex] = {
            ...updatedMessages[botMessageIndex],
            content:
              "Đã xảy ra lỗi khi xử lý tin nhắn của bạn. Vui lòng thử lại sau.",
          };
        }

        return updatedMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
    setError(null);
  };

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  };
}
