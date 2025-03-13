import { useRef, useEffect } from "react";
import { Message } from "../types";
import { generateImage, extractImagePrompt } from "../lib/together";
import { searchGoogle, extractSearchQuery } from "../lib/googleSearch";

export function useTagProcessors() {
  const imagePromptRef = useRef<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchQueryRef = useRef<string | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchCountRef = useRef<number>(0);

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
    sendFollowUpMessage?: (searchResults: string) => Promise<void>
  ) => {
    // Reset search count khi bắt đầu xử lý tin nhắn mới
    searchCountRef.current = 0;

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
      // Kiểm tra số lần tìm kiếm
      if (searchCountRef.current >= 10) {
        setMessages((prev) => {
          const newMessages = [...prev];
          const targetIndex = newMessages.findIndex(
            (msg) => msg.id === messageId
          );
          if (targetIndex !== -1) {
            newMessages[targetIndex] = {
              ...newMessages[targetIndex],
              content:
                content +
                "\n\n[ĐÃ ĐẠT GIỚI HẠN TÌM KIẾM] Vui lòng tổng hợp thông tin đã có.",
            };
          }
          return newMessages;
        });
        return;
      }

      const searchQuery = extractSearchQuery(content);
      if (searchQuery && searchQuery !== searchQueryRef.current) {
        searchCountRef.current += 1; // Tăng biến đếm
        searchQueryRef.current = searchQuery;
        setIsSearching?.(true);

        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
        }

        // Kiểm tra xem tin nhắn hiện tại có phải là follow-up search không
        setMessages((prev) => {
          const currentMessage = prev.find((msg) => msg.id === messageId);
          const isFollowUpSearch = currentMessage?.isFollowUpSearch;

          const newMessages = isFollowUpSearch
            ? prev // Giữ nguyên tin nhắn cũ nếu là follow-up search
            : prev.filter((msg) => msg.id !== messageId); // Xóa tin nhắn hiện tại nếu là tìm kiếm thông thường

          // Thêm trạng thái "đang tìm kiếm" vào cuối
          const searchingMessage: Message = {
            id: Date.now().toString(),
            content: "*Đang tìm kiếm...*",
            sender: "bot",
          };

          return [...newMessages, searchingMessage];
        });

        searchTimeoutRef.current = setTimeout(() => {
          searchGoogle(searchQuery)
            .then((searchResults) => {
              let searchResultsForAI = `Kết quả tìm kiếm cho "${searchQuery}" (Lần tìm kiếm thứ ${searchCountRef.current}/10):\n\n`;

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

              // Xóa tin nhắn "đang tìm kiếm"
              setMessages((prev) => {
                return prev.filter(
                  (msg) => msg.content !== "*Đang tìm kiếm...*"
                );
              });

              // Thêm thông báo nếu đã đạt giới hạn
              if (searchCountRef.current >= 10) {
                searchResultsForAI +=
                  "\n\n[SYSTEM] Đã đạt giới hạn 10 lần tìm kiếm. Hãy tổng hợp tất cả thông tin đã thu thập và đưa ra kết luận cuối cùng. Không thực hiện thêm tìm kiếm nào nữa.";
              }

              // Gửi kết quả tìm kiếm cho AI để phân tích
              if (sendFollowUpMessage) {
                sendFollowUpMessage(searchResultsForAI);
              }
            })
            .catch((error) => {
              setMessages((prev) => {
                const errorMessage =
                  error instanceof Error
                    ? error.message
                    : "Lỗi không xác định khi tìm kiếm";

                const newMessages = prev.filter(
                  (msg) => msg.content !== "*Đang tìm kiếm...*"
                );
                return [
                  ...newMessages,
                  {
                    id: Date.now().toString(),
                    content: `*Lỗi tìm kiếm: ${errorMessage}*`,
                    sender: "bot",
                  },
                ];
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

  // Reset search count khi unmount
  useEffect(() => {
    return () => {
      searchCountRef.current = 0;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return { processMessageTags };
}
