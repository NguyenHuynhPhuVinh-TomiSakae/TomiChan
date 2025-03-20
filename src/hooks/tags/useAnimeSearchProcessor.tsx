/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useEffect } from "react";
import { Message } from "../../types";
import { getLocalStorage } from "@/utils/localStorage";

interface AnimeSearchData {
  type: string;
  query: string;
  filter?: string;
}

const extractAnimeSearchData = (
  messageContent: string
): AnimeSearchData | null => {
  const searchRegex = /\[ANIME_SEARCH\]([\s\S]*?)\[\/ANIME_SEARCH\]/;
  const match = messageContent.match(searchRegex);

  if (!match) return null;

  const searchContent = match[1];
  const type = searchContent
    .match(/TYPE:\s*(.*)/)?.[1]
    ?.trim()
    .toLowerCase();
  const query = searchContent.match(/QUERY:\s*(.*)/)?.[1]?.trim();
  const filterMatch = searchContent.match(/FILTER:\s*(.*)/)?.[1]?.trim();

  if (!type || !query) return null;
  if (
    type !== "anime" &&
    type !== "manga" &&
    type !== "season" &&
    type !== "schedule"
  )
    return null;

  return {
    type,
    query,
    filter: filterMatch,
  };
};

// Hàm tạo kết quả tìm kiếm trong cặp thẻ ANIME_SEARCH_RESULT
const createSearchResultBlock = (
  data: any[],
  searchData: AnimeSearchData
): string => {
  const resultBlock = `[ANIME_SEARCH_RESULT]
TYPE: ${searchData.type}
QUERY: ${searchData.query}
DATA: ${JSON.stringify(data)}
[/ANIME_SEARCH_RESULT]`;

  return resultBlock;
};

const fetchAnimeData = async (searchData: AnimeSearchData) => {
  console.log("Đang tìm kiếm anime/manga:", searchData);
  const searchLimit = getLocalStorage("tool:anime_search:limit", "5");
  let apiUrl = "";

  // Tạo API URL tùy theo loại tìm kiếm
  if (searchData.type === "season") {
    // Xử lý tìm kiếm theo mùa (season)
    const seasonParts = searchData.query.split(" ");
    let season = "winter";
    let year = new Date().getFullYear();

    if (searchData.query.toLowerCase() === "current") {
      // Dùng mùa hiện tại
      apiUrl = `https://api.jikan.moe/v4/seasons/now?limit=${searchLimit}`;
    } else if (seasonParts.length >= 2) {
      // Format: [season] [year]
      season = seasonParts[0].toLowerCase();
      year = parseInt(seasonParts[1], 10) || year;

      // Kiểm tra mùa hợp lệ
      if (!["winter", "spring", "summer", "fall"].includes(season)) {
        season = "winter"; // Mặc định
      }

      apiUrl = `https://api.jikan.moe/v4/seasons/${year}/${season}?limit=${searchLimit}`;
    } else {
      // Nếu không có đủ thông tin, sử dụng mùa hiện tại
      apiUrl = `https://api.jikan.moe/v4/seasons/now?limit=${searchLimit}`;
    }
  } else if (searchData.type === "schedule") {
    // Xử lý tìm kiếm lịch chiếu (schedule)
    let day = searchData.query.toLowerCase().trim();

    // Xử lý từ khóa đặc biệt
    if (day === "today") {
      const today = new Date();
      const weekdays = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ];
      day = weekdays[today.getDay()];
    }

    // Kiểm tra ngày hợp lệ
    const validDays = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
      "other",
    ];
    if (!validDays.includes(day)) {
      day = "unknown"; // Sẽ trả về lỗi từ API
    }

    apiUrl = `https://api.jikan.moe/v4/schedules?filter=${day}&limit=${searchLimit}`;
  } else {
    // Tìm kiếm thông thường (anime/manga)
    apiUrl = `https://api.jikan.moe/v4/${
      searchData.type
    }?q=${encodeURIComponent(searchData.query)}&limit=${searchLimit}`;

    // Xử lý filter nếu có
    if (searchData.filter) {
      const filterParts = searchData.filter
        .split(",")
        .map((part) => part.trim());

      for (const part of filterParts) {
        if (part.includes(":")) {
          const [key, value] = part.split(":").map((p) => p.trim());

          // Xử lý các loại filter phổ biến
          if (key === "genres") {
            apiUrl += `&genres=${encodeURIComponent(value)}`;
          } else if (key === "year") {
            apiUrl += `&start_date=${value}`;
          } else if (key === "status") {
            apiUrl += `&status=${encodeURIComponent(value)}`;
          } else if (key === "rating") {
            apiUrl += `&rating=${encodeURIComponent(value)}`;
          } else {
            apiUrl += `&${key}=${encodeURIComponent(value)}`;
          }
        }
      }
    }
  }

  console.log("URL API:", apiUrl);

  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      console.error("Lỗi API response:", response.status, response.statusText);
      throw new Error(`Lỗi API: ${response.status}`);
    }

    const data = await response.json();
    console.log("Kết quả tìm kiếm:", data.data ? data.data.length : 0, "items");

    if (!data.data || data.data.length === 0) {
      return `Không tìm thấy kết quả nào cho "${searchData.query}"`;
    }

    // Thay đổi ở đây: Đưa dữ liệu JSON vào cặp thẻ ANIME_SEARCH_RESULT
    return createSearchResultBlock(data.data || [], searchData);
  } catch (error) {
    console.error("Lỗi khi tìm kiếm anime:", error);
    let errorMessage = "Không thể tìm kiếm thông tin";

    if (error instanceof Error) {
      errorMessage += ": " + (error.message || "Lỗi không xác định");
    } else if (typeof error === "object" && error !== null) {
      errorMessage += ": " + JSON.stringify(error);
    } else {
      errorMessage += ": Lỗi không xác định";
    }

    throw new Error(errorMessage);
  }
};

export function useAnimeSearchProcessor() {
  const animeSearchDataRef = useRef<AnimeSearchData | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const processAnimeSearchTag = async (
    content: string,
    messageId: string,
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
    saveChat: (messages: Message[], chatId?: string, model?: string) => void,
    chatId?: string,
    model?: string,
    setIsSearching?: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    if (
      content.includes("[ANIME_SEARCH]") &&
      content.includes("[/ANIME_SEARCH]")
    ) {
      const searchData = extractAnimeSearchData(content);
      console.log("Dữ liệu tìm kiếm anime được tìm thấy:", searchData);

      if (
        searchData &&
        JSON.stringify(searchData) !==
          JSON.stringify(animeSearchDataRef.current)
      ) {
        animeSearchDataRef.current = searchData;

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(async () => {
          try {
            if (setIsSearching) setIsSearching(true);
            console.log("Bắt đầu tìm kiếm anime/manga...");

            const searchResults = await fetchAnimeData(searchData);
            console.log("Nhận được kết quả tìm kiếm, cập nhật UI");

            // Cập nhật tin nhắn với kết quả trong cặp thẻ ANIME_SEARCH_RESULT
            setMessages((prev) => {
              const newMessages = [...prev];
              const targetIndex = newMessages.findIndex(
                (msg) => msg.id === messageId
              );

              if (targetIndex !== -1) {
                const cleanContent = content.replace(
                  /\[ANIME_SEARCH\]([\s\S]*?)\[\/ANIME_SEARCH\]/g,
                  ""
                );

                newMessages[targetIndex] = {
                  ...newMessages[targetIndex],
                  content: cleanContent + "\n\n" + searchResults,
                };
                saveChat(newMessages, chatId, model);
              }
              return newMessages;
            });
          } catch (error) {
            console.error("Lỗi trong quá trình tìm kiếm:", error);
            setMessages((prev) => {
              const newMessages = [...prev];
              const targetIndex = newMessages.findIndex(
                (msg) => msg.id === messageId
              );

              if (targetIndex !== -1) {
                const errorMessage =
                  error instanceof Error ? error.message : "Lỗi không xác định";
                newMessages[targetIndex] = {
                  ...newMessages[targetIndex],
                  content: content + `\n\n❌ *${errorMessage}*`,
                };
                saveChat(newMessages, chatId, model);
              }
              return newMessages;
            });
          } finally {
            if (setIsSearching) setIsSearching(false);
            animeSearchDataRef.current = null;
            console.log("Hoàn thành quá trình tìm kiếm");
          }
        }, 1000);
      }
    }
  };

  return { processAnimeSearchTag };
}
