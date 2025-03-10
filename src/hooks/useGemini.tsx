import { useState } from "react";
import { Message } from "../types";
import { getGeminiResponse } from "../lib/gemini";

export function useGemini() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    // Thêm tin nhắn bot với nội dung rỗng để cập nhật theo luồng
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
      // Chuyển đổi lịch sử trò chuyện theo định dạng mới
      const chatHistory = messages.map((msg) => ({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      }));

      // Hàm callback để xử lý từng phần của phản hồi
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

      // Gọi API Gemini với hàm callback xử lý từng phần
      await getGeminiResponse(message, chatHistory, handleChunk);
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
  };

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  };
}
