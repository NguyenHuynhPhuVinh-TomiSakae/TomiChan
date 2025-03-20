/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo } from "react";
import {
  IconSearch,
  IconMovie,
  IconBook,
  IconExternalLink,
  IconLoader2,
} from "@tabler/icons-react";

interface AnimeSearchBlockProps {
  children: React.ReactNode;
}

export const AnimeSearchBlock: React.FC<AnimeSearchBlockProps> = ({
  children,
}) => {
  // Chuyển đổi children thành string một cách an toàn
  const rawContent = React.Children.toArray(children)
    .map((child) => {
      if (typeof child === "string") return child;
      if (child && typeof child === "object" && "props" in child) {
        return (child as any).props.children;
      }
      return "";
    })
    .join("");

  // Tách nội dung tìm kiếm bằng regex
  const type = rawContent
    .match(/TYPE:\s*(.*?)(?=\n|$)/)?.[1]
    ?.trim()
    .toLowerCase();
  const query = rawContent.match(/QUERY:\s*(.*?)(?=\n|$)/)?.[1]?.trim();
  const filter = rawContent.match(/FILTER:\s*(.*?)(?=\n|$)/)?.[1]?.trim();

  return (
    <div className="my-4 p-4 rounded-lg border-2 border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 to-blue-500/10">
      <div className="flex items-center gap-2 mb-3">
        {type === "anime" ? (
          <IconMovie className="text-indigo-500" size={20} />
        ) : (
          <IconBook className="text-indigo-500" size={20} />
        )}
        <span className="font-semibold bg-gradient-to-r from-indigo-400 via-blue-500 to-indigo-500 text-transparent bg-clip-text">
          Tìm kiếm {type === "anime" ? "Anime" : "Manga"}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <span className="font-medium text-sm text-gray-700 dark:text-gray-300 w-20">
            Từ khóa:
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400 flex-1">
            {query}
          </span>
        </div>

        {filter && (
          <div className="flex items-start gap-2">
            <span className="font-medium text-sm text-gray-700 dark:text-gray-300 w-20">
              Bộ lọc:
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400 flex-1">
              {filter}
            </span>
          </div>
        )}
      </div>

      <div className="mt-3 flex justify-end">
        <div className="text-xs text-gray-500 dark:text-gray-400 italic flex items-center gap-1">
          <div className="animate-spin">
            <IconLoader2 size={12} className="text-indigo-500" />
          </div>
          Đang tìm kiếm...
        </div>
      </div>
    </div>
  );
};

export const AnimeSearchResult: React.FC<AnimeSearchBlockProps> = ({
  children,
}) => {
  // Trích xuất TYPE và QUERY từ nội dung để hiển thị header
  const rawContent = React.Children.toArray(children)
    .map((child) => {
      if (typeof child === "string") return child;
      if (child && typeof child === "object" && "props" in child) {
        return (child as any).props.children;
      }
      return "";
    })
    .join("");

  // Lấy thông tin về TYPE, QUERY, và DATA
  const type = rawContent
    .match(/TYPE:\s*(.*?)(?=\n|$)/)?.[1]
    ?.trim()
    .toLowerCase();
  const query = rawContent.match(/QUERY:\s*(.*?)(?=\n|$)/)?.[1]?.trim();

  // Lấy toàn bộ phần DATA từ nội dung (cải thiện regex)
  const dataMatch = rawContent.match(
    /DATA:\s*([\s\S]*?)(?=\n\[\/ANIME_SEARCH_RESULT\]|$)/
  );
  const dataJsonString = dataMatch?.[1]?.trim();

  // Parse dữ liệu JSON từ chuỗi với xử lý lỗi tốt hơn
  const animeData = useMemo(() => {
    if (!dataJsonString) return null;

    try {
      // Xử lý JSON string trước khi parse
      const cleanJsonString = dataJsonString
        .replace(/\\n/g, "\\n")
        .replace(/\\'/g, "\\'")
        .replace(/\\"/g, '\\"')
        .replace(/\\&/g, "\\&")
        .replace(/\\r/g, "\\r")
        .replace(/\\t/g, "\\t")
        .replace(/\\b/g, "\\b")
        .replace(/\\f/g, "\\f");

      const parsedData = JSON.parse(cleanJsonString);
      // Kiểm tra xem có pagination info không
      if (parsedData.pagination) {
        return {
          data: parsedData.data,
          pagination: parsedData.pagination,
        };
      }
      return { data: parsedData, pagination: null };
    } catch (error) {
      console.error("Lỗi khi parse JSON từ kết quả anime:", error);
      console.log("JSON string gây lỗi:", dataJsonString);
      return null;
    }
  }, [dataJsonString]);

  if (!animeData) {
    return (
      <div className="my-4 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-gray-800">
        <div className="flex items-center gap-2 mb-5">
          <IconSearch className="text-indigo-500" size={20} />
          <span className="font-semibold text-lg text-indigo-600 dark:text-indigo-400">
            Kết quả tìm kiếm: {query}
          </span>
        </div>
        <div className="text-gray-500 italic">
          Không tìm thấy kết quả hoặc có lỗi khi hiển thị dữ liệu
        </div>
      </div>
    );
  }

  // Render UI thực tế với dữ liệu JSON đã parsed
  return (
    <div className="my-6 rounded-lg overflow-hidden border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-gray-800 shadow-lg">
      {/* Header có gradient và icon anime */}
      <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {type === "anime" ? (
              <IconMovie className="text-white" size={24} />
            ) : (
              <IconBook className="text-white" size={24} />
            )}
            <span className="font-bold text-xl">Kết quả tìm kiếm: {query}</span>
          </div>
          {/* Hiển thị trang hiện tại từ pagination info */}
          {animeData?.pagination && (
            <div className="text-sm bg-white/20 px-3 py-1 rounded-full">
              Trang {animeData.pagination.current_page || 1}
            </div>
          )}
        </div>
        <div className="text-xs text-white/70 mt-1">
          {animeData?.data && Array.isArray(animeData.data)
            ? `Tìm thấy ${animeData.data.length} kết quả`
            : ""}
        </div>
      </div>

      {/* Container cho nội dung kết quả */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {animeData?.data &&
        Array.isArray(animeData.data) &&
        animeData.data.length > 0 ? (
          animeData.data.map((item, index) => (
            <div
              key={item.mal_id}
              className="p-5 hover:bg-indigo-50 dark:hover:bg-gray-700/60 transition-colors duration-200"
            >
              <div className="flex flex-col md:flex-row gap-5">
                {/* Poster với hiệu ứng shadow và hover */}
                <div className="w-full md:w-1/4 flex-shrink-0">
                  {item.images?.jpg?.image_url ? (
                    <div className="relative group">
                      <img
                        src={item.images.jpg.image_url}
                        alt={item.title}
                        className="w-full rounded-lg shadow-md transform group-hover:scale-[1.02] transition-transform duration-300"
                        style={{ maxWidth: "200px" }}
                      />
                      <div className="absolute inset-0 rounded-lg shadow-inner group-hover:shadow-indigo-500/30 dark:group-hover:shadow-indigo-400/20 pointer-events-none"></div>
                    </div>
                  ) : (
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-[280px] flex items-center justify-center">
                      <span className="text-gray-500 dark:text-gray-400">
                        Không có hình ảnh
                      </span>
                    </div>
                  )}
                </div>

                {/* Thông tin anime */}
                <div className="flex-1">
                  {/* Tiêu đề với ranking badge */}
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center bg-indigo-600 text-white h-7 w-7 rounded-full text-sm font-bold shadow-sm">
                      {index + 1}
                    </span>
                    <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                      {item.title}
                    </h3>
                  </div>

                  {item.title_english && item.title_english !== item.title && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      🇬🇧 {item.title_english}
                    </div>
                  )}

                  {item.title_japanese && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      🇯🇵 {item.title_japanese}
                    </div>
                  )}

                  {/* Thẻ thông tin chi tiết */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        Loại
                      </span>
                      <span className="text-sm">{item.type || "N/A"}</span>
                    </div>

                    {/* Hiển thị điểm đánh giá với progress bar */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        Điểm
                      </span>
                      {item.score ? (
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-16 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600"
                              style={{ width: `${(item.score / 10) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">
                            {item.score}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm">Chưa có đánh giá</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        Phát hành
                      </span>
                      <span className="text-sm">
                        {item.aired?.string || item.published?.string || "N/A"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        Trạng thái
                      </span>
                      <span className="text-sm">{item.status || "N/A"}</span>
                    </div>

                    {/* Thêm thông tin số tập nếu có */}
                    {item.episodes && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          Số tập
                        </span>
                        <span className="text-sm">{item.episodes} tập</span>
                      </div>
                    )}
                  </div>

                  {/* Thể loại với badges */}
                  {item.genres && item.genres.length > 0 && (
                    <div className="mt-4">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded mr-2">
                        Thể loại
                      </span>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {item.genres.map((g: any) => (
                          <span
                            key={g.mal_id}
                            className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full"
                          >
                            {g.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tóm tắt với styling tốt hơn */}
                  {item.synopsis && (
                    <div className="mt-4 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md border-l-2 border-indigo-400">
                      <div className="font-medium text-indigo-600 dark:text-indigo-400 text-sm mb-1">
                        Tóm tắt
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        {item.synopsis.substring(0, 200)}
                        {item.synopsis.length > 200 ? "..." : ""}
                      </div>
                    </div>
                  )}

                  {/* Link đến MAL với styling tốt hơn */}
                  {item.url && (
                    <div className="mt-4">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-2 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-md text-sm font-medium hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
                      >
                        <span>Xem trên MyAnimeList</span>
                        <IconExternalLink size={16} className="ml-1" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-10 text-center">
            <IconSearch
              size={40}
              className="mx-auto text-gray-300 dark:text-gray-600 mb-3"
            />
            <div className="text-gray-500 italic">
              Không tìm thấy kết quả nào cho &quot;{query}&quot;
            </div>
          </div>
        )}
      </div>

      {/* Footer với branding nhẹ */}
      <div className="p-3 text-center text-xs text-gray-500 bg-gray-50 dark:bg-gray-700/30">
        Dữ liệu được cung cấp bởi MyAnimeList API
      </div>
    </div>
  );
};
