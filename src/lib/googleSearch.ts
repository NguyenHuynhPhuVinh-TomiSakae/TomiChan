/* eslint-disable @typescript-eslint/no-explicit-any */
export async function searchGoogle(
  query: string,
  startIndex?: number
): Promise<any[]> {
  try {
    // Đọc cấu hình local trước
    const searchConfig = JSON.parse(
      localStorage.getItem("search_config") || "{}"
    );

    // Sau đó mới gọi API để lấy keys
    const response = await fetch("/api/keys");
    const keys = await response.json();

    // Ưu tiên sử dụng cấu hình local trước, nếu không có thì mới dùng từ API
    const apiKey = searchConfig.googleApiKey || keys.googleSearch.apiKey;
    const cseId = searchConfig.googleCseId || keys.googleSearch.cseId;
    const numResults = searchConfig.numResults || 3; // Sử dụng giá trị từ cấu hình, mặc định là 5

    if (!apiKey || !cseId) {
      throw new Error("Thiếu Google API Key hoặc Custom Search Engine ID");
    }

    // Thêm tham số start nếu có startIndex
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${encodeURIComponent(
      query
    )}&num=${numResults}${startIndex ? `&start=${startIndex}` : ""}`;

    const responseFetch = await fetch(url);

    if (!responseFetch.ok) {
      throw new Error(
        `Lỗi tìm kiếm: ${responseFetch.status} ${responseFetch.statusText}`
      );
    }

    const data = await responseFetch.json();

    if (!data.items || data.items.length === 0) {
      return [];
    }

    return data.items.map((item: any) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet,
      displayLink: item.displayLink,
      source: item.displayLink,
      pagemap: item.pagemap,
      htmlSnippet: item.htmlSnippet,
      htmlTitle: item.htmlTitle,
      kind: item.kind,
      htmlFormattedUrl: item.htmlFormattedUrl,
      formattedUrl: item.formattedUrl,
      cacheId: item.cacheId,
    }));
  } catch (error) {
    console.error("Lỗi khi tìm kiếm Google:", error);
    throw error;
  }
}

export function extractSearchQuery(content: string): string | null {
  const regex = /\[SEARCH_QUERY\](.*?)\[\/SEARCH_QUERY\]/;
  const match = content.match(regex);
  return match ? match[1].trim() : null;
}
