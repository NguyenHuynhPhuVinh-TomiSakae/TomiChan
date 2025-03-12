/* eslint-disable @typescript-eslint/no-unused-vars */
import { useChat } from "./useChat";
import { getGroqResponse } from "../lib/groq";
import { Message } from "../types";
import { useState, useRef, useEffect } from "react";
import { useSystemPrompt } from "./useSystemPrompt";
import { generateImage, extractImagePrompt } from "../lib/together";

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

  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const imagePromptRef = useRef<string | null>(null);
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

      const handleBotResponse = async (
        content: string,
        botMessageId: string
      ) => {
        const imagePrompt = extractImagePrompt(content);

        if (imagePrompt && !isGeneratingImage) {
          // Nếu prompt khác với prompt trước đó
          if (imagePrompt !== imagePromptRef.current) {
            imagePromptRef.current = imagePrompt;

            // Clear timeout cũ nếu có
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }

            // Đặt timeout mới
            timeoutRef.current = setTimeout(async () => {
              try {
                setIsGeneratingImage(true);
                console.log("Đang tạo ảnh với prompt:", imagePrompt);
                const imageBase64 = await generateImage(imagePrompt);

                setMessages((prev) => {
                  const newMessages = [...prev];
                  const botMessageIndex = newMessages.findIndex(
                    (msg) => msg.id === botMessageId
                  );

                  if (botMessageIndex !== -1) {
                    newMessages[botMessageIndex] = {
                      ...newMessages[botMessageIndex],
                      content: content,
                      images: [
                        {
                          url: "generated-image.png",
                          data: `data:image/png;base64,${imageBase64}`,
                        },
                      ],
                    };
                    saveChat(newMessages, chatId, "groq");
                  }
                  return newMessages;
                });
              } catch (error) {
                console.error("Lỗi khi tạo ảnh:", error);
                setError(
                  error instanceof Error ? error.message : "Lỗi khi tạo ảnh"
                );
              } finally {
                setIsGeneratingImage(false);
                imagePromptRef.current = null;
              }
            }, 1000);
          }
        }
      };

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

            // Kiểm tra xem message đã hoàn thành chưa
            if (
              newContent.includes("[IMAGE_PROMPT]") &&
              newContent.includes("[/IMAGE_PROMPT]")
            ) {
              setTimeout(() => handleBotResponse(newContent, botMessageId), 0);
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
    if (messageIndex === -1) return;

    // Tìm tin nhắn user gần nhất phía trước
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

      // Cắt bỏ tất cả tin nhắn sau vị trí đang tạo lại
      const updatedMessages = messages.slice(0, messageIndex + 1);
      updatedMessages[messageIndex] = {
        ...updatedMessages[messageIndex],
        content: "",
      };
      setMessages(updatedMessages);
      saveChat(updatedMessages, chatId, "groq");

      const handleChunk = (chunk: string) => {
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[messageIndex] = {
            ...newMessages[messageIndex],
            content: newMessages[messageIndex].content + chunk,
          };
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
