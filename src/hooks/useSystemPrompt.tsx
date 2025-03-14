import { getLocalStorage } from "../utils/localStorage";

export function useSystemPrompt() {
  const getEnhancedSystemPrompt = (provider: string) => {
    const imageGeneration =
      getLocalStorage("image_generation", "false") === "true";
    const searchEnabled = getLocalStorage("search_enabled", "false") === "true";

    const systemTagInstruction = `
Khi bạn nhận được tin nhắn có chứa thẻ [SYSTEM]...[/SYSTEM], đây là chỉ thị hệ thống và bạn PHẢI TUÂN THỦ TUYỆT ĐỐI những yêu cầu trong thẻ này. Không được phép bỏ qua hoặc vi phạm bất kỳ chỉ thị nào trong thẻ [SYSTEM].

Ví dụ:
[SYSTEM]Dừng tìm kiếm và tổng hợp kết quả[/SYSTEM]
-> Bạn phải dừng ngay việc tìm kiếm và tổng hợp các kết quả đã có.

LUÔN LUÔN SỬ DỤNG ĐỊNH DẠNG ĐẸP VỚI LaTeX CHO CÁC CÔNG THỨC TOÁN HỌC!
`;

    const basePrompt =
      provider === "google"
        ? getLocalStorage(
            "system_prompt",
            `Bạn là 1 Chat Bot AI tên là TomiChan được phát triển bởi TomiSakae!`
          )
        : provider === "groq"
        ? getLocalStorage(
            "groq_system_prompt",
            `Bạn là 1 Chat Bot AI tên là TomiChan được phát triển bởi TomiSakae!`
          )
        : getLocalStorage(
            "openrouter_system_prompt",
            `Bạn là 1 Chat Bot AI tên là TomiChan được phát triển bởi TomiSakae!`
          );

    // Bắt đầu với basePrompt
    let enhancedPrompt = basePrompt;

    // Thêm các tính năng tùy chọn nếu được bật
    if (imageGeneration) {
      const imageConfig = JSON.parse(
        getLocalStorage("image_config", "{}") || "{}"
      );

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

    if (searchEnabled) {
      const searchPrompt = `
Bạn có khả năng tìm kiếm thông tin trên web để cung cấp thông tin mới nhất và chính xác nhất cho người dùng. Khi người dùng hỏi bất kỳ câu hỏi nào, bạn sẽ:
1. Luôn luôn tạo một truy vấn tìm kiếm phù hợp bằng tiếng anh, không cần đánh giá xem câu hỏi có cần thông tin mới nhất hay không
2. Đặt truy vấn tìm kiếm trong định dạng [SEARCH_QUERY]...[/SEARCH_QUERY]
3. Khi sử dụng tính năng tìm kiếm, chỉ trả về chính xác chuỗi [SEARCH_QUERY]...[/SEARCH_QUERY] mà không thêm bất kỳ văn bản giải thích nào trước hoặc sau đó
4. Sau khi tìm kiếm, hệ thống sẽ tự động gửi kết quả tìm kiếm cho bạn và bạn sẽ phân tích thông tin để trả lời người dùng một cách đầy đủ và chi tiết nhất!

Ví dụ:
User: Thời tiết ở Hà Nội hôm nay thế nào?
Assistant: [SEARCH_QUERY]weather in Hanoi today[/SEARCH_QUERY]

`;
      enhancedPrompt = searchPrompt + enhancedPrompt;
    }

    // Luôn luôn thêm systemTagInstruction vào cuối
    return enhancedPrompt + "\n\n" + systemTagInstruction;
  };

  return { getEnhancedSystemPrompt };
}
