import { useRef, useEffect } from "react";
import { Message } from "../types";
import { generateImage, extractImagePrompt } from "../lib/together";
import { searchGoogle, extractSearchQuery } from "../lib/googleSearch";

export function useTagProcessors() {
  const imagePromptRef = useRef<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchQueryRef = useRef<string | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup khi unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const processMessageTags = (
    content: string,
    messageId: string,
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
    saveChat: (messages: Message[], chatId?: string, model?: string) => void,
    chatId?: string,
    model?: string,
    setIsGeneratingImage?: React.Dispatch<React.SetStateAction<boolean>>,
    setIsSearching?: React.Dispatch<React.SetStateAction<boolean>>,
    messageIndex?: number,
    sendFollowUpMessage?: (
      searchResults: string,
      messageId: string
    ) => Promise<void>
  ) => {
    // Xử lý IMAGE_PROMPT
    if (
      content.includes("[IMAGE_PROMPT]") &&
      content.includes("[/IMAGE_PROMPT]")
    ) {
      const imagePrompt = extractImagePrompt(content);
      if (imagePrompt && imagePrompt !== imagePromptRef.current) {
        imagePromptRef.current = imagePrompt;
        setIsGeneratingImage?.(true);

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          generateImage(imagePrompt)
            .then((imageBase64) => {
              setMessages((prev) => {
                const newMessages = [...prev];
                const targetIndex =
                  messageIndex !== undefined
                    ? messageIndex
                    : newMessages.findIndex((msg) => msg.id === messageId);

                if (targetIndex !== -1) {
                  newMessages[targetIndex] = {
                    ...newMessages[targetIndex],
                    images: [
                      {
                        url: "generated-image.png",
                        data: `data:image/png;base64,${imageBase64}`,
                      },
                    ],
                  };
                  saveChat(newMessages, chatId, model);
                }
                return newMessages;
              });
            })
            .catch((error) => {
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
                const targetIndex =
                  messageIndex !== undefined
                    ? messageIndex
                    : newMessages.findIndex((msg) => msg.id === messageId);

                if (targetIndex !== -1) {
                  const errorMessage =
                    error instanceof Error
                      ? error.message
                      : "Lỗi không xác định khi tạo ảnh";

                  newMessages[targetIndex] = {
                    ...newMessages[targetIndex],
                    content: content + `\n\n*Lỗi: ${errorMessage}*`,
                    images: undefined,
                  };
                  saveChat(newMessages, chatId, model);
                }
                return newMessages;
              });
            })
            .finally(() => {
              setIsGeneratingImage?.(false);
              imagePromptRef.current = null;
            });
        }, 1000);
      }
    }

    // Xử lý SEARCH_QUERY
    if (
      content.includes("[SEARCH_QUERY]") &&
      content.includes("[/SEARCH_QUERY]")
    ) {
      const searchQuery = extractSearchQuery(content);
      if (searchQuery && searchQuery !== searchQueryRef.current) {
        searchQueryRef.current = searchQuery;
        setIsSearching?.(true);

        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
        }

        // Hiển thị trạng thái "đang tìm kiếm" trên UI
        setMessages((prev) => {
          const newMessages = [...prev];
          const targetIndex =
            messageIndex !== undefined
              ? messageIndex
              : newMessages.findIndex((msg) => msg.id === messageId);

          if (targetIndex !== -1) {
            newMessages[targetIndex] = {
              ...newMessages[targetIndex],
              content: "*Đang tìm kiếm...*",
            };
            saveChat(newMessages, chatId, model);
          }
          return newMessages;
        });

        searchTimeoutRef.current = setTimeout(() => {
          searchGoogle(searchQuery)
            .then((searchResults) => {
              // Định dạng kết quả tìm kiếm
              let searchResultsForAI = `Kết quả tìm kiếm cho "${searchQuery}":\n\n`;

              if (searchResults.length > 0) {
                searchResults.forEach((result, index) => {
                  searchResultsForAI += `${index + 1}. Tiêu đề: ${
                    result.title
                  }\nTrích đoạn: ${result.snippet}\nNguồn: ${
                    result.displayLink
                  }\n\n`;
                });
              } else {
                searchResultsForAI = "Không tìm thấy kết quả tìm kiếm phù hợp.";
              }

              // Xóa tin nhắn tìm kiếm và gửi kết quả cho AI
              setMessages((prev) => {
                const newMessages = prev.filter((msg) => msg.id !== messageId);
                return newMessages;
              });

              // Gửi kết quả tìm kiếm cho AI để phân tích
              if (sendFollowUpMessage) {
                sendFollowUpMessage(searchResultsForAI, messageId);
              }
            })
            .catch((error) => {
              setMessages((prev) => {
                const newMessages = [...prev];
                const targetIndex =
                  messageIndex !== undefined
                    ? messageIndex
                    : newMessages.findIndex((msg) => msg.id === messageId);

                if (targetIndex !== -1) {
                  const errorMessage =
                    error instanceof Error
                      ? error.message
                      : "Lỗi không xác định khi tìm kiếm";

                  newMessages[targetIndex] = {
                    ...newMessages[targetIndex],
                    content: `*Lỗi tìm kiếm: ${errorMessage}*`,
                  };
                  saveChat(newMessages, chatId, model);
                }
                return newMessages;
              });
            })
            .finally(() => {
              setIsSearching?.(false);
              searchQueryRef.current = null;
            });
        }, 1000);
      }
    }
  };

  return { processMessageTags };
}
