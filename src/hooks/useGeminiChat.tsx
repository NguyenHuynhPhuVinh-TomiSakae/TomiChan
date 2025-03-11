/* eslint-disable @typescript-eslint/no-unused-vars */
import { useChat } from "./useChat";
import { getGeminiResponse } from "../lib/gemini";
import { Message } from "../types";

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

  const sendMessage = async (message: string) => {
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
            accumulatedMessages = newMessages;
            saveChat(accumulatedMessages, currentChatId);
          }

          return newMessages;
        });
      };

      await getGeminiResponse(message, chatHistory, handleChunk);
    } catch (error) {
      setError("Đã xảy ra lỗi khi xử lý yêu cầu");
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

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  };
}
