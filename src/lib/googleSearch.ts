/* eslint-disable @typescript-eslint/no-explicit-any */
export async function searchGoogle(query: string): Promise<any[]> {
  try {
    const response = await fetch("/api/keys");
    const keys = await response.json();
    const searchConfig = JSON.parse(
      localStorage.getItem("search_config") || "{}"
    );

    const apiKey = keys.googleSearch.apiKey || searchConfig.googleApiKey;
    const cseId = keys.googleSearch.cseId || searchConfig.googleCseId;
    const numResults = searchConfig.numResults || 3; // Sử dụng giá trị từ cấu hình, mặc định là 5

    if (!apiKey || !cseId) {
      throw new Error("Thiếu Google API Key hoặc Custom Search Engine ID");
    }

    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${encodeURIComponent(
      query
    )}&num=${numResults}`;

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
