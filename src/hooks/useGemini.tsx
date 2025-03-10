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

    // Thêm trạng thái loading
    const loadingId = Date.now() + 1;
    setMessages((prev) => [
      ...prev,
      {
        id: loadingId.toString(),
        content: "Đang xử lý...",
        sender: "bot",
      },
    ]);

    try {
      // Chuyển đổi lịch sử trò chuyện theo định dạng mới
      const chatHistory = messages.map((msg) => ({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      }));

      // Gọi API Gemini
      const response = await getGeminiResponse(message, chatHistory);

      // Cập nhật messages, thay thế tin nhắn loading
      setMessages((prev) =>
        prev
          .filter((msg) => msg.id !== loadingId.toString())
          .concat({
            id: (Date.now() + 2).toString(),
            content: response,
            sender: "bot",
          })
      );
    } catch (error) {
      console.error("Lỗi khi xử lý tin nhắn:", error);
      setError("Đã xảy ra lỗi khi xử lý yêu cầu");

      // Cập nhật messages với thông báo lỗi
      setMessages((prev) =>
        prev
          .filter((msg) => msg.id !== loadingId.toString())
          .concat({
            id: (Date.now() + 2).toString(),
            content:
              "Đã xảy ra lỗi khi xử lý tin nhắn của bạn. Vui lòng thử lại sau.",
            sender: "bot",
          })
      );
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
