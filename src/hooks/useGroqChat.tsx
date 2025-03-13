/* eslint-disable @typescript-eslint/no-unused-vars */
import { useChat } from "./useChat";
import { getGroqResponse } from "../lib/groq";
import { Message } from "../types";
import { useState, useRef, useEffect } from "react";
import { useSystemPrompt } from "./useSystemPrompt";
import { generateImage } from "../lib/together";
import { useTagProcessors } from "./useTagProcessors";

export function useGroqChat(chatId?: string) {
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

  const { getEnhancedSystemPrompt } = useSystemPrompt();
  const { processMessageTags } = useTagProcessors();

  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const stopGeneration = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
  };

  const sendMessage = async (message: string) => {
    const apiKey = localStorage.getItem("groq_api_key");
    const currentChatId = chatId;
    const currentMessages = [...messages];

    // Kiểm tra xem có phải là lệnh tạo ảnh không
    const isImageCreationCommand = /^\/(?:create\s+)?image\s+/i.test(message);

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
            "Vui lòng nhập API key Groq trong cài đặt để sử dụng chatbot.",
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

    if (isImageCreationCommand) {
      try {
        const prompt = message.replace(/^\/(?:create\s+)?image\s+/i, "");
        const imageBase64 = await generateImage(prompt);

        setMessages((prev) => {
          const newMessages = [...prev];
          const botMessageIndex = newMessages.findIndex(
            (msg) => msg.id === botMessageId
          );

          if (botMessageIndex !== -1) {
            newMessages[botMessageIndex] = {
              ...newMessages[botMessageIndex],
              content: "Đã tạo ảnh theo yêu cầu của bạn:",
              images: [
                {
                  url: "generated-image.png",
                  data: `data:image/png;base64,${imageBase64}`,
                },
              ],
            };
          }
          return newMessages;
        });
        return;
      } catch (error) {
        setError(error instanceof Error ? error.message : "Lỗi khi tạo ảnh");
        return;
      }
    }

    try {
      const chatHistory = currentMessages.map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.content,
      }));

      // Thêm system prompt vào đầu chat history
      chatHistory.unshift({
        role: "system",
        content: getEnhancedSystemPrompt("groq"),
      });

      let accumulatedMessages = [...currentMessages, newMessage];

      const handleChunk = (chunk: string) => {
        setMessages((prev) => {
          const newMessages = [...prev];
          const botMessageIndex = newMessages.findIndex(
            (msg) => msg.id === botMessageId
          );

          if (botMessageIndex !== -1) {
            const newContent = newMessages[botMessageIndex].content + chunk;
            newMessages[botMessageIndex] = {
              ...newMessages[botMessageIndex],
              content: newContent,
            };

            // Xử lý các tag đặc biệt
            if (
              (newContent.includes("[IMAGE_PROMPT]") &&
                newContent.includes("[/IMAGE_PROMPT]")) ||
              (newContent.includes("[SEARCH_QUERY]") &&
                newContent.includes("[/SEARCH_QUERY]"))
            ) {
              setTimeout(
                () =>
                  processMessageTags(
                    newContent,
                    botMessageId,
                    setMessages,
                    saveChat,
                    currentChatId,
                    "groq",
                    setIsGeneratingImage,
                    setIsSearching,
                    undefined,
                    sendFollowUpMessage
                  ),
                0
              );
            }

            accumulatedMessages = newMessages;
            saveChat(accumulatedMessages, currentChatId, "groq");
          }

          return newMessages;
        });
      };

      const controller = new AbortController();
      setAbortController(controller);
      await getGroqResponse(
        message,
        chatHistory,
        handleChunk,
        controller.signal
      );
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }
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
      setAbortController(null);
    }
  };

  const regenerateMessage = async (messageId: string) => {
    const messageIndex = messages.findIndex((msg) => msg.id === messageId);
    if (messageIndex === -1 || isGeneratingImage) return;

    const previousUserMessage = messages
      .slice(0, messageIndex)
      .reverse()
      .find((msg) => msg.sender === "user");

    if (!previousUserMessage) return;

    setIsLoading(true);
    setError(null);

    try {
      const chatHistory = messages.slice(0, messageIndex).map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.content,
      }));

      const controller = new AbortController();
      setAbortController(controller);

      // Reset message content và images
      const updatedMessages = messages.slice(0, messageIndex + 1);
      updatedMessages[messageIndex] = {
        ...updatedMessages[messageIndex],
        content: "",
        images: undefined,
      };
      setMessages(updatedMessages);
      saveChat(updatedMessages, chatId, "groq");

      const handleChunk = (chunk: string) => {
        setMessages((prev) => {
          const newMessages = [...prev];
          const newContent = newMessages[messageIndex].content + chunk;
          newMessages[messageIndex] = {
            ...newMessages[messageIndex],
            content: newContent,
          };

          // Xử lý các tag đặc biệt
          if (
            (newContent.includes("[IMAGE_PROMPT]") &&
              newContent.includes("[/IMAGE_PROMPT]")) ||
            (newContent.includes("[SEARCH_QUERY]") &&
              newContent.includes("[/SEARCH_QUERY]"))
          ) {
            processMessageTags(
              newContent,
              messageId,
              setMessages,
              saveChat,
              chatId,
              "groq",
              setIsGeneratingImage,
              setIsSearching,
              messageIndex,
              sendFollowUpMessage
            );
          }

          saveChat(newMessages, chatId, "groq");
          return newMessages;
        });
      };

      await getGroqResponse(
        previousUserMessage.content,
        chatHistory,
        handleChunk,
        controller.signal
      );
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }
      setError("Đã xảy ra lỗi khi tạo lại phản hồi");
      setMessages((prev) => {
        const updatedMessages = [...prev];
        updatedMessages[messageIndex] = {
          ...updatedMessages[messageIndex],
          content: "Đã xảy ra lỗi khi tạo lại phản hồi. Vui lòng thử lại sau.",
        };
        return updatedMessages;
      });
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  };

  // Thêm hàm gửi tin nhắn follow-up với kết quả tìm kiếm
  const sendFollowUpMessage = async (searchResults: string) => {
    const apiKey = localStorage.getItem("groq_api_key");
    if (!apiKey) return;

    const botMessageId = Date.now().toString();
    const newBotMessage: Message = {
      id: botMessageId,
      content: "",
      sender: "bot",
    };

    setMessages((prev) => [...prev, newBotMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const chatHistory = messages.map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.content,
      }));

      // Thêm system prompt vào đầu chat history
      chatHistory.unshift({
        role: "system",
        content: getEnhancedSystemPrompt("groq"),
      });

      // Thêm kết quả tìm kiếm như một tin nhắn từ người dùng
      chatHistory.push({
        role: "user",
        content: searchResults,
      });

      const controller = new AbortController();
      setAbortController(controller);

      const handleChunk = (chunk: string) => {
        setMessages((prev) => {
          const newMessages = [...prev];
          const botMessageIndex = newMessages.findIndex(
            (msg) => msg.id === botMessageId
          );

          if (botMessageIndex !== -1) {
            const newContent = newMessages[botMessageIndex].content + chunk;
            newMessages[botMessageIndex] = {
              ...newMessages[botMessageIndex],
              content: newContent,
            };

            // Xử lý các tag đặc biệt
            if (
              (newContent.includes("[IMAGE_PROMPT]") &&
                newContent.includes("[/IMAGE_PROMPT]")) ||
              (newContent.includes("[SEARCH_QUERY]") &&
                newContent.includes("[/SEARCH_QUERY]"))
            ) {
              setTimeout(
                () =>
                  processMessageTags(
                    newContent,
                    botMessageId,
                    setMessages,
                    saveChat,
                    chatId,
                    "groq",
                    setIsGeneratingImage,
                    setIsSearching,
                    undefined,
                    sendFollowUpMessage
                  ),
                0
              );
            }

            saveChat(newMessages, chatId, "groq");
          }

          return newMessages;
        });
      };

      await getGroqResponse(
        searchResults,
        chatHistory.slice(0, -1), // Bỏ tin nhắn cuối cùng vì đã thêm vào phần content
        handleChunk,
        controller.signal
      );
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }

      const errorMessage = "Đã xảy ra lỗi khi xử lý kết quả tìm kiếm";
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

  // Cleanup khi unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    stopGeneration,
    setMessages,
    regenerateMessage,
  };
}
