/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Message } from "../../types";
import { useState, useRef, useEffect } from "react";
import { generateImage } from "../../lib/together";
import { useTagProcessors } from "../tags/useTagProcessors";
import { useSearchProcessor } from "../tags/useSearchProcessor";
import { useSystemPrompt } from "../useSystemPrompt";
import { useChat } from "./useChat";
import { getApiKey } from "../../utils/getApiKey";

export interface ChatCommonProps<T = any> {
  chatId?: string;
  provider: "gemini" | "openrouter" | "groq";
  getResponse: (
    message: string,
    history: T,
    onChunk: (chunk: string) => void,
    signal?: AbortSignal,
    systemPrompt?: string,
    images?: { url: string; data: string }[],
    files?: { name: string; type: string; data: string }[],
    videos?: { url: string; data: string }[],
    audios?: { url: string; data: string }[]
  ) => Promise<string>;
}

type Part =
  | { text: string }
  | { inlineData: { data: string; mimeType: string } };

export function useChatCommon<T>({
  chatId,
  provider,
  getResponse,
}: ChatCommonProps<T>) {
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
  const { resetSearchCount } = useSearchProcessor();
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const stopGeneration = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
  };

  const pushSystemPrompt = (history: any[], systemPrompt?: string) => {
    if ((provider === "groq" || provider === "openrouter") && systemPrompt) {
      history.unshift({
        role: "system",
        content: systemPrompt,
      });
    }
    return history as T;
  };

  const processMediaParts = (message: Message): Part[] => {
    const parts: Part[] = [{ text: message.content }];
    if (message.sender === "user") {
      const mediaTypes = [
        { data: message.images, mimeType: "image/jpeg" },
        { data: message.files, useCustomType: true },
        { data: message.videos, mimeType: "video/mp4" },
        { data: message.audios, mimeType: "audio/mp3" },
      ];

      mediaTypes.forEach(({ data, mimeType, useCustomType }) => {
        if (data?.length) {
          parts.push(
            ...data.map((item: any) => ({
              inlineData: {
                data: item.data.split(",")[1],
                mimeType: useCustomType
                  ? item.type
                  : item.data.match(/data:([^;]+);/)?.[1] || mimeType,
              },
            }))
          );
        }
      });
    }
    return parts;
  };

  const formatMessageForProvider = (msg: Message) => {
    if (provider === "groq") {
      return {
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.content,
      };
    }
    return {
      role: msg.sender === "user" ? "user" : "model",
      parts: processMediaParts(msg),
    };
  };

  const handleApiError = (error: unknown, messageId: string) => {
    if (error instanceof Error && error.name === "AbortError") {
      return;
    }

    let errorMessage = "Đã xảy ra lỗi khi xử lý yêu cầu";

    if (error instanceof Error) {
      console.error(`${provider} API error:`, error.message);

      if (
        error.message.includes("400") ||
        error.message.includes("Bad Request")
      ) {
        if (error.message.includes("SAFETY")) {
          errorMessage = `Nội dung bị chặn bởi bộ lọc an toàn của ${provider}.`;
        } else if (error.message.includes("BLOCKED_REASON")) {
          errorMessage = `Nội dung bị từ chối do vi phạm chính sách của ${provider}.`;
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
        (msg) => msg.id === messageId
      );

      if (botMessageIndex !== -1) {
        updatedMessages[botMessageIndex] = {
          ...updatedMessages[botMessageIndex],
          content: errorMessage,
        };
      }

      return updatedMessages;
    });
  };

  const sendMessage = async (
    message: string,
    imageData?: { url: string; data: string }[],
    fileData?: { name: string; type: string; data: string }[],
    videoData?: { url: string; data: string }[],
    audioData?: { url: string; data: string }[]
  ) => {
    // Reset search count khi có tin nhắn mới từ user
    resetSearchCount();

    const currentChatId = chatId;
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

    const updatedMessages = [...messages, newMessage, newBotMessage];
    setMessages(updatedMessages);
    setIsLoading(true);
    setError(null);

    try {
      const apiKey =
        localStorage.getItem(`${provider}_api_key`) ||
        (await getApiKey(provider, `${provider}_api_key`));
      if (!apiKey) {
        setMessages((prev) => {
          const updatedMessages = [...prev];
          const botMessageIndex = updatedMessages.findIndex(
            (msg) => msg.id === botMessageId
          );
          if (botMessageIndex !== -1) {
            updatedMessages[botMessageIndex] = {
              ...updatedMessages[botMessageIndex],
              content: `Vui lòng nhập API key ${provider} trong cài đặt để sử dụng chatbot.`,
            };
          }
          return updatedMessages;
        });
        return;
      }

      const isImageCreationCommand = /^\/(?:create\s+)?image\s+/i.test(message);

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
        const chatHistory = pushSystemPrompt(
          updatedMessages
            .slice(0, -2)
            .map((msg) => formatMessageForProvider(msg)),
          getEnhancedSystemPrompt(provider)
        );

        let accumulatedMessages = updatedMessages;

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
                      provider,
                      setIsGeneratingImage,
                      setIsSearching,
                      undefined,
                      sendFollowUpMessage
                    ),
                  0
                );
              }

              accumulatedMessages = newMessages;
              saveChat(accumulatedMessages, currentChatId, provider);
            }

            return newMessages;
          });
        };

        const controller = new AbortController();
        setAbortController(controller);

        await getResponse(
          message,
          chatHistory,
          handleChunk,
          controller.signal,
          getEnhancedSystemPrompt(provider),
          imageData,
          fileData,
          videoData,
          audioData
        );
      } catch (error) {
        handleApiError(error, botMessageId);
      }
    } catch (error) {
      console.error("Error in sendMessage:", error);
      setError("Đã xảy ra lỗi khi gửi tin nhắn");
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
      const chatHistory = pushSystemPrompt(
        messages
          .slice(0, messageIndex)
          .map((msg) => formatMessageForProvider(msg)),
        getEnhancedSystemPrompt(provider)
      );

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
      saveChat(updatedMessages, chatId, provider);

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
            // Sử dụng hook mới để xử lý các tag
            processMessageTags(
              newContent,
              messageId,
              setMessages,
              saveChat,
              chatId,
              provider,
              setIsGeneratingImage,
              setIsSearching,
              messageIndex,
              sendFollowUpMessage
            );
          }

          saveChat(newMessages, chatId, provider);
          return newMessages;
        });
      };

      await getResponse(
        previousUserMessage.content,
        chatHistory,
        handleChunk,
        controller.signal,
        getEnhancedSystemPrompt(provider)
      );
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }
      handleApiError(error, messageId);
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
    const apiKey =
      localStorage.getItem(`${provider}_api_key`) ||
      (await getApiKey(provider, `${provider}_api_key`));
    if (!apiKey) return;

    const botMessageId = Date.now().toString();
    const newBotMessage: Message = {
      id: botMessageId,
      content: "",
      sender: "bot",
      isFollowUpSearch: true,
    };

    setMessages((prev) => [...prev, newBotMessage]);
    setIsLoading(true);
    setError(null);

    const systemPrompt = getEnhancedSystemPrompt(provider);

    // Sửa đổi hướng dẫn tìm kiếm sâu
    const searchConfig = JSON.parse(
      localStorage.getItem("search_config") || "{}"
    );
    const deepSearchInstruction = searchConfig.deepSearch
      ? `Bạn chỉ được thực hiện ÍT NHẤT 3 lần tìm kiếm và TỐI ĐA 10 lần tìm kiếm để tránh quá tải. Với mỗi chủ đề hoặc khía cạnh quan trọng nhất của vấn đề, hãy sử dụng tag [SEARCH_QUERY]...[/SEARCH_QUERY] với từ khóa phù hợp.

Quy trình tìm kiếm của bạn:
1. Phân tích kết quả tìm kiếm hiện tại
2. Xác định 1-2 khía cạnh quan trọng nhất cần tìm hiểu thêm
3. Thực hiện tìm kiếm bổ sung (không quá 10 lần)
4. Tổng hợp tất cả thông tin sau khi hoàn thành`
      : "";

    const enhancedSystemPrompt =
      systemPrompt +
      (deepSearchInstruction ? `\n\n${deepSearchInstruction}` : "");

    try {
      const chatHistory = pushSystemPrompt(
        messages.map((msg) => formatMessageForProvider(msg)),
        enhancedSystemPrompt
      );

      const searchPrompt = searchResults + "\n\nPhân tích:";

      const controller = new AbortController();
      setAbortController(controller);

      let isFirstChunk = true;
      const handleChunk = (chunk: string) => {
        setMessages((prev) => {
          const newMessages = [...prev];
          const botMessageIndex = newMessages.findIndex(
            (msg) => msg.id === botMessageId
          );

          if (botMessageIndex !== -1) {
            const newContent = isFirstChunk
              ? searchPrompt + "\n\n" + chunk
              : newMessages[botMessageIndex].content + chunk;

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
                    provider,
                    setIsGeneratingImage,
                    setIsSearching,
                    undefined,
                    sendFollowUpMessage
                  ),
                0
              );
            }

            if (isFirstChunk) {
              isFirstChunk = false;
            }

            saveChat(newMessages, chatId, provider);
          }
          return newMessages;
        });
      };

      await getResponse(
        searchPrompt,
        chatHistory,
        handleChunk,
        controller.signal,
        enhancedSystemPrompt // Sử dụng enhanced system prompt
      );
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }

      let errorMessage = "Đã xảy ra lỗi khi xử lý kết quả tìm kiếm";
      if (error instanceof Error) {
        console.error("Gemini API error:", error.message);
        if (
          error.message.includes("400") ||
          error.message.includes("Bad Request")
        ) {
          errorMessage = "Lỗi xử lý kết quả tìm kiếm. Vui lòng thử lại sau.";
        }
      }

      handleApiError(error, botMessageId);
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  };

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
