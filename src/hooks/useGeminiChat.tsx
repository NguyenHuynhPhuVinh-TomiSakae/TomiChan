/* eslint-disable @typescript-eslint/no-unused-vars */
import { useChat } from "./useChat";
import { getGeminiResponse } from "../lib/gemini";
import { Message } from "../types";
import { useState } from "react";

export function useGeminiChat(chatId?: string) {
  const {
    messages,
    setMessages,
    isLoading,
    setIsLoading,
    error,
    setError,
    saveChat,
    clearMessages,
  } = useChat(chatId);

  const [abortController, setAbortController] =
    useState<AbortController | null>(null);

  const sendMessage = async (
    message: string,
    imageData?: { url: string; data: string }[],
    fileData?: { name: string; type: string; data: string }[]
  ) => {
    const apiKey = localStorage.getItem("api_key");
    const currentChatId = chatId;
    const currentMessages = [...messages];

    if (!apiKey) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: message,
          sender: "user",
          images: imageData,
          files: fileData,
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
      images: imageData,
      files: fileData,
    };

    const botMessageId = (Date.now() + 1).toString();
    const newBotMessage: Message = {
      id: botMessageId,
      content: "",
      sender: "bot",
    };

    const updatedMessages = [...currentMessages, newMessage, newBotMessage];
    setMessages(updatedMessages);
    setIsLoading(true);
    setError(null);

    try {
      const chatHistory = currentMessages.map((msg) => ({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      }));

      if (!imageData || imageData.length === 0) {
        chatHistory.push({
          role: "user",
          parts: [{ text: message }],
        });
      }

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
            accumulatedMessages = newMessages;
            saveChat(accumulatedMessages, currentChatId);
          }

          return newMessages;
        });
      };

      const controller = new AbortController();
      setAbortController(controller);

      const botResponse = await getGeminiResponse(
        message,
        chatHistory,
        handleChunk,
        controller.signal,
        imageData,
        fileData
      );
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }

      let errorMessage = "Đã xảy ra lỗi khi xử lý yêu cầu";

      // Kiểm tra và hiển thị lỗi cụ thể hơn từ API
      if (error instanceof Error) {
        console.error("Gemini API error:", error.message);

        if (
          error.message.includes("400") ||
          error.message.includes("Bad Request")
        ) {
          if (error.message.includes("SAFETY")) {
            errorMessage = "Nội dung bị chặn bởi bộ lọc an toàn của Gemini.";
          } else if (error.message.includes("BLOCKED_REASON")) {
            errorMessage =
              "Nội dung bị từ chối do vi phạm chính sách của Gemini.";
          } else if (error.message.includes("API key")) {
            errorMessage =
              "API key không hợp lệ. Vui lòng kiểm tra lại trong phần cài đặt.";
          } else {
            errorMessage =
              "Lỗi yêu cầu không hợp lệ (400). Vui lòng thử cách diễn đạt khác.";
          }
        }
      }

      setError(errorMessage);
      setMessages((prev) => {
        const updatedMessages = [...prev];
        const botMessageIndex = updatedMessages.findIndex(
          (msg) => msg.id === botMessageId
        );

        if (botMessageIndex !== -1) {
          updatedMessages[botMessageIndex] = {
            ...updatedMessages[botMessageIndex],
            content: errorMessage,
          };
        }

        return updatedMessages;
      });
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  };

  const stopGeneration = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
  };

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    stopGeneration,
  };
}
