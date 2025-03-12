/* eslint-disable @typescript-eslint/no-unused-vars */
import { useChat } from "./useChat";
import { getGeminiResponse } from "../lib/gemini";
import { Message } from "../types";
import { useState, useRef, useEffect } from "react";
import { useSystemPrompt } from "./useSystemPrompt";
import { generateImage, extractImagePrompt } from "../lib/together";

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

  const { getEnhancedSystemPrompt } = useSystemPrompt();

  const [abortController, setAbortController] =
    useState<AbortController | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const imagePromptRef = useRef<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const sendMessage = async (
    message: string,
    imageData?: { url: string; data: string }[],
    fileData?: { name: string; type: string; data: string }[],
    videoData?: { url: string; data: string }[],
    audioData?: { url: string; data: string }[]
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
          videos: videoData,
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

    const isImageCreationCommand = /^\/(?:create\s+)?image\s+/i.test(message);

    if (isImageCreationCommand) {
      try {
        const prompt = message.replace(/^\/(?:create\s+)?image\s+/i, "");
        const imageBase64 = await generateImage(prompt);

        // Thêm ảnh được tạo vào tin nhắn bot
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

    const newMessage: Message = {
      id: Date.now().toString(),
      content: message,
      sender: "user",
      images: imageData,
      files: fileData,
      videos: videoData,
      audios: audioData,
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

      const systemPrompt = getEnhancedSystemPrompt("google");

      if (
        !imageData?.length &&
        !fileData?.length &&
        !videoData?.length &&
        !audioData?.length
      ) {
        chatHistory.push({
          role: "user",
          parts: [{ text: message }],
        });
      }

      let accumulatedMessages = [...currentMessages, newMessage];

      const handleBotResponse = async (
        content: string,
        botMessageId: string
      ) => {
        const imagePrompt = extractImagePrompt(content);

        if (imagePrompt && !isGeneratingImage) {
          if (imagePrompt !== imagePromptRef.current) {
            imagePromptRef.current = imagePrompt;

            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }

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
                    saveChat(newMessages, chatId, "google");
                  }
                  return newMessages;
                });
              } catch (error) {
                console.error("Lỗi khi tạo ảnh:", error);

                // Bỏ qua nếu là lỗi Too Many Requests
                if (
                  error instanceof Error &&
                  (error.message.includes("429") ||
                    error.message.includes("Too Many Requests"))
                ) {
                  return;
                }

                setMessages((prev) => {
                  const newMessages = [...prev];
                  const botMessageIndex = newMessages.findIndex(
                    (msg) => msg.id === botMessageId
                  );

                  if (botMessageIndex !== -1) {
                    const errorMessage =
                      error instanceof Error
                        ? error.message
                        : "Lỗi không xác định khi tạo ảnh";

                    newMessages[botMessageIndex] = {
                      ...newMessages[botMessageIndex],
                      content: content + `\n\n*Lỗi: ${errorMessage}*`,
                      images: undefined, // Xóa placeholder
                    };
                    saveChat(newMessages, chatId, "google");
                  }
                  return newMessages;
                });
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

            // Đợi cho đến khi có cả tag đóng mới xử lý
            if (
              newContent.includes("[IMAGE_PROMPT]") &&
              newContent.includes("[/IMAGE_PROMPT]")
            ) {
              // Đảm bảo gọi handleBotResponse bên ngoài setState
              setTimeout(() => handleBotResponse(newContent, botMessageId), 0);
            }

            accumulatedMessages = newMessages;
            saveChat(accumulatedMessages, currentChatId, "google");
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
        systemPrompt,
        imageData,
        fileData,
        videoData,
        audioData
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

  const regenerateMessage = async (messageId: string) => {
    const messageIndex = messages.findIndex((msg) => msg.id === messageId);
    if (messageIndex === -1) return;

    const previousUserMessage = messages
      .slice(0, messageIndex)
      .reverse()
      .find((msg) => msg.sender === "user");

    if (!previousUserMessage) return;

    setIsLoading(true);
    setError(null);

    try {
      const chatHistory = messages.slice(0, messageIndex).map((msg) => ({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      }));

      const systemPrompt = getEnhancedSystemPrompt("google");

      const controller = new AbortController();
      setAbortController(controller);

      // Reset message content và images
      const updatedMessages = messages.slice(0, messageIndex + 1);
      updatedMessages[messageIndex] = {
        ...updatedMessages[messageIndex],
        content: "",
        images: undefined, // Xóa ảnh cũ
      };
      setMessages(updatedMessages);
      saveChat(updatedMessages, chatId, "google");

      const handleChunk = (chunk: string) => {
        setMessages((prev) => {
          const newMessages = [...prev];
          const newContent = newMessages[messageIndex].content + chunk;
          newMessages[messageIndex] = {
            ...newMessages[messageIndex],
            content: newContent,
          };

          // Kiểm tra và tạo ảnh mới nếu có image prompt
          if (
            newContent.includes("[IMAGE_PROMPT]") &&
            newContent.includes("[/IMAGE_PROMPT]")
          ) {
            const imagePrompt = extractImagePrompt(newContent);
            if (imagePrompt) {
              generateImage(imagePrompt).then((imageBase64) => {
                setMessages((prev) => {
                  const updatedMessages = [...prev];
                  updatedMessages[messageIndex] = {
                    ...updatedMessages[messageIndex],
                    images: [
                      {
                        url: "generated-image.png",
                        data: `data:image/png;base64,${imageBase64}`,
                      },
                    ],
                  };
                  saveChat(updatedMessages, chatId, "google");
                  return updatedMessages;
                });
              });
            }
          }

          saveChat(newMessages, chatId, "google");
          return newMessages;
        });
      };

      await getGeminiResponse(
        previousUserMessage.content,
        chatHistory,
        handleChunk,
        controller.signal,
        systemPrompt,
        previousUserMessage.images,
        previousUserMessage.files,
        previousUserMessage.videos,
        previousUserMessage.audios
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
