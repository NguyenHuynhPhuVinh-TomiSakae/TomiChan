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
          setMessages([]); // Reset messages nếu không tìm thấy chat
        }
      }
    };

    loadChat();
  }, [chatId]); // Chỉ phụ thuộc vào chatId

  const sendMessage = async (message: string) => {
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

    setMessages((prev) => [...prev, newMessage]);
    setIsLoading(true);
    setError(null);

    // Lưu vào DB ngay khi người dùng gửi tin nhắn
    if (chatId) {
      const updatedMessages = [...messages, newMessage];
      const chat: ChatHistory = {
        id: chatId,
        title: updatedMessages[0]?.content.slice(0, 50) + "...", // Sử dụng tin nhắn đầu làm title
        messages: updatedMessages,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await chatDB.saveChat(chat);
    }

    const botMessageId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      {
        id: botMessageId,
        content: "",
        sender: "bot",
      },
    ]);

    try {
      // Chuyển đổi lịch sử trò chuyện cho AI
      const chatHistory = messages.map((msg) => ({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      }));

      // Thêm tin nhắn mới vào history
      chatHistory.push({
        role: "user",
        parts: [{ text: message }],
      });

      const handleChunk = (chunk: string) => {
        setMessages((prev) => {
          const updatedMessages = [...prev];
          const botMessageIndex = updatedMessages.findIndex(
            (msg) => msg.id === botMessageId
          );

          if (botMessageIndex !== -1) {
            updatedMessages[botMessageIndex] = {
              ...updatedMessages[botMessageIndex],
              content: updatedMessages[botMessageIndex].content + chunk,
            };
          }

          return updatedMessages;
        });
      };

      // Gửi toàn bộ history cho AI
      await getGeminiResponse(message, chatHistory, handleChunk);

      // Lưu vào DB sau khi nhận phản hồi từ bot
      if (chatId) {
        setMessages((currentMessages) => {
          const chat: ChatHistory = {
            id: chatId,
            title: currentMessages[0]?.content.slice(0, 50) + "...",
            messages: currentMessages,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          chatDB.saveChat(chat);
          return currentMessages;
        });
      }
    } catch (error) {
      console.error("Lỗi khi xử lý tin nhắn:", error);
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
