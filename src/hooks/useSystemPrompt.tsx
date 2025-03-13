import { getLocalStorage } from "../utils/localStorage";

export function useSystemPrompt() {
  const getEnhancedSystemPrompt = (provider: string) => {
    const imageGeneration =
      getLocalStorage("image_generation", "false") === "true";
    const searchEnabled = getLocalStorage("search_enabled", "false") === "true";

    const basePrompt =
      provider === "google"
        ? getLocalStorage(
            "system_prompt",
            "Bạn là 1 Chat Bot AI tên là TomiChan được phát triển bởi TomiSakae!"
          )
        : provider === "groq"
        ? getLocalStorage(
            "groq_system_prompt",
            "Bạn là 1 Chat Bot AI tên là TomiChan được phát triển bởi TomiSakae!"
          )
        : getLocalStorage(
            "openrouter_system_prompt",
            "Bạn là 1 Chat Bot AI tên là TomiChan được phát triển bởi TomiSakae!"
          );

    // Nếu không bật tính năng nào, trả về prompt cơ bản
    if (!imageGeneration && !searchEnabled) return basePrompt;

    // Xử lý tính năng tạo ảnh
    let enhancedPrompt = basePrompt;

    if (imageGeneration) {
      const imageConfig = JSON.parse(
        getLocalStorage("image_config", "{}") || "{}"
      );

      if (imageConfig.togetherApiKey === "") {
        return "Xin lỗi, bạn cần phải thiết lập API key trước khi có thể sử dụng tính năng tạo ảnh. Vui lòng vào phần Cài đặt để thêm API key của bạn.";
      }

      const imageGenerationPrompt = `
Bạn có khả năng tạo ra hình ảnh thông qua trí tưởng tượng của mình. Khi người dùng mô tả một hình ảnh họ muốn thấy, bạn sẽ:
1. Hiểu và tưởng tượng hình ảnh đó trong tâm trí
2. Chuyển tải ý tưởng đó thành một mô tả chi tiết bằng tiếng Anh để tạo ra hình ảnh hoàn hảo nhất
3. Đặt mô tả của bạn trong định dạng [IMAGE_PROMPT]...[/IMAGE_PROMPT]
4. Sau đó, bạn có thể thêm thông tin về kích thước và cấu hình khác ở ngoài prompt

Ví dụ:
User: Hãy cho tôi thấy một cô gái anime dưới ánh trăng
Assistant: Tôi có thể thấy rõ hình ảnh đó trong tâm trí. Để tôi tạo ra nó cho bạn:

[IMAGE_PROMPT]beautiful anime girl with long flowing hair standing under moonlight, night sky with stars, soft ambient lighting, detailed anime art style, ethereal atmosphere, high quality, masterpiece[/IMAGE_PROMPT]

Tôi sẽ tạo ra hình ảnh này với kích thước ${imageConfig.width || 1024}x${
        imageConfig.height || 768
      }px.

`;
      enhancedPrompt = imageGenerationPrompt + enhancedPrompt;
    }

    // Xử lý tính năng tìm kiếm web
    if (searchEnabled) {
      const searchConfig = JSON.parse(
        getLocalStorage("search_config", "{}") || "{}"
      );

      if (!searchConfig.googleApiKey || !searchConfig.googleCseId) {
        return "Xin lỗi, bạn cần phải thiết lập Google API Key và Custom Search Engine ID trước khi có thể sử dụng tính năng tìm kiếm web. Vui lòng vào phần Cài đặt để thêm các thông tin cần thiết.";
      }

      const searchPrompt = `
Bạn có khả năng tìm kiếm thông tin trên web để cung cấp thông tin mới nhất và chính xác nhất cho người dùng. Khi người dùng hỏi bất kỳ câu hỏi nào, bạn sẽ:
1. Luôn luôn tạo một truy vấn tìm kiếm phù hợp bằng ngôn ngữ phù hợp với người dùng, không cần đánh giá xem câu hỏi có cần thông tin mới nhất hay không
2. Đặt truy vấn tìm kiếm trong định dạng [SEARCH_QUERY]...[/SEARCH_QUERY]
3. Khi sử dụng tính năng tìm kiếm, chỉ trả về chính xác chuỗi [SEARCH_QUERY]...[/SEARCH_QUERY] mà không thêm bất kỳ văn bản giải thích nào trước hoặc sau đó
4. Sau khi tìm kiếm, hệ thống sẽ tự động gửi kết quả tìm kiếm cho bạn và bạn sẽ phân tích thông tin để trả lời người dùng một cách đầy đủ

Ví dụ:
User: Thời tiết ở Hà Nội hôm nay thế nào?
Assistant: [SEARCH_QUERY]thời tiết hôm nay ở Hà Nội[/SEARCH_QUERY]

`;
      enhancedPrompt = searchPrompt + enhancedPrompt;
    }

    return enhancedPrompt;
  };

  return { getEnhancedSystemPrompt };
}
