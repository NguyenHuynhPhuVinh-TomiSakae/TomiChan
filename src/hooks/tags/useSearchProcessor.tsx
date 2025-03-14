import { useRef, useEffect } from "react";
import { Message } from "../../types";
import { searchGoogle, extractSearchQuery } from "../../lib/googleSearch";

export function useSearchProcessor() {
  const searchQueryRef = useRef<string | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchCountRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      searchCountRef.current = 0;
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const resetSearchCount = () => {
    searchCountRef.current = 0;
    searchQueryRef.current = null;
  };

  const processSearchTag = (
    content: string,
    messageId: string,
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
    setIsSearching?: React.Dispatch<React.SetStateAction<boolean>>,
    sendFollowUpMessage?: (searchResults: string) => Promise<void>
  ) => {
    // Kiểm tra xem có phải là follow-up search không
    const isFollowUpSearch = content.includes("Kết quả tìm kiếm cho");

    // Reset search count nếu KHÔNG phải là follow-up search
    if (!isFollowUpSearch) {
      resetSearchCount();
    }

    if (
      content.includes("[SEARCH_QUERY]") &&
      content.includes("[/SEARCH_QUERY]")
    ) {
      const searchQuery = extractSearchQuery(content);

      // Tăng biến đếm ngay khi có một search query mới
      if (searchQuery && searchQuery !== searchQueryRef.current) {
        searchCountRef.current += 1;

        // Kiểm tra giới hạn tìm kiếm
        if (searchCountRef.current > 10) {
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
                  "\n\n[SYSTEM]Đã đạt giới hạn tìm kiếm. Vui lòng tổng hợp thông tin đã có.[/SYSTEM]",
              };
            }
            return newMessages;
          });
          return;
        }

        searchQueryRef.current = searchQuery;
        setIsSearching?.(true);

        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
        }

        // Sửa phần này để tránh duplicate messages
        setMessages((prev) => {
          // Lọc bỏ tin nhắn "đang tìm kiếm" cũ nếu có
          const filteredMessages = prev.filter(
            (msg) => msg.content !== "*Đang tìm kiếm...*"
          );

          const baseMessages = isFollowUpSearch
            ? filteredMessages
            : filteredMessages.filter((msg) => msg.id !== messageId);

          // Thêm trạng thái "đang tìm kiếm" với ID duy nhất
          const searchingMessage: Message = {
            id: `searching-${Date.now()}`,
            content: "*Đang tìm kiếm...*",
            sender: "bot",
          };

          return [...baseMessages, searchingMessage];
        });

        searchTimeoutRef.current = setTimeout(() => {
          searchGoogle(searchQuery)
            .then((searchResults) => {
              let searchResultsForAI = `Kết quả tìm kiếm cho "${searchQuery}" [SYSTEM]Lần tìm kiếm thứ ${searchCountRef.current}/10[/SYSTEM]:\n\n`;

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
                  "\n\n[SYSTEM]Đã đạt giới hạn 10 lần tìm kiếm. Hãy tổng hợp tất cả thông tin đã thu thập và đưa ra kết luận cuối cùng. Không thực hiện thêm tìm kiếm nào nữa.[/SYSTEM]";
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
                    content: `[SYSTEM]Lỗi tìm kiếm: ${errorMessage}[/SYSTEM]`,
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

  return { processSearchTag, searchCountRef, resetSearchCount };
}
