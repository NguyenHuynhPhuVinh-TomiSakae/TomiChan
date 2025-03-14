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
    // Reset search count khi bắt đầu xử lý tin nhắn mới
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
                  "\n\n[ĐÃ ĐẠT GIỚI HẠN TÌM KIẾM] Vui lòng tổng hợp thông tin đã có.",
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

  return { processSearchTag, searchCountRef, resetSearchCount };
}
