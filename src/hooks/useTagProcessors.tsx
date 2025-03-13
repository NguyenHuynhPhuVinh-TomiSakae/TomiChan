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
    messageIndex?: number
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

        searchTimeoutRef.current = setTimeout(() => {
          searchGoogle(searchQuery)
            .then((searchResults) => {
              // Định dạng kết quả tìm kiếm
              let searchResultsText = "";

              if (searchResults.length > 0) {
                searchResultsText = "\n\n**Kết quả tìm kiếm:**\n\n";
                searchResults.slice(0, 3).forEach((result, index) => {
                  searchResultsText += `${index + 1}. **${result.title}**\n${
                    result.snippet
                  }\nNguồn: ${result.displayLink}\n\n`;
                });
              } else {
                searchResultsText = "\n\n*Không tìm thấy kết quả phù hợp.*\n\n";
              }

              setMessages((prev) => {
                const newMessages = [...prev];
                const targetIndex =
                  messageIndex !== undefined
                    ? messageIndex
                    : newMessages.findIndex((msg) => msg.id === messageId);

                if (targetIndex !== -1) {
                  const updatedContent = content.replace(
                    /\[SEARCH_QUERY\].*?\[\/SEARCH_QUERY\]/,
                    `[SEARCH_QUERY]${searchQuery}[/SEARCH_QUERY]${searchResultsText}`
                  );

                  newMessages[targetIndex] = {
                    ...newMessages[targetIndex],
                    content: updatedContent,
                  };
                  saveChat(newMessages, chatId, model);
                }
                return newMessages;
              });
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

                  const updatedContent = content.replace(
                    /\[SEARCH_QUERY\].*?\[\/SEARCH_QUERY\]/,
                    `[SEARCH_QUERY]${searchQuery}[/SEARCH_QUERY]\n\n*Lỗi tìm kiếm: ${errorMessage}*\n\n`
                  );

                  newMessages[targetIndex] = {
                    ...newMessages[targetIndex],
                    content: updatedContent,
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
