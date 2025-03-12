import { getLocalStorage } from "../utils/localStorage";

export function useSystemPrompt() {
  const getEnhancedSystemPrompt = (provider: string) => {
    const imageGeneration =
      getLocalStorage("image_generation", "false") === "true";
    const basePrompt =
      provider === "google"
        ? getLocalStorage(
            "system_prompt",
            "Bạn là 1 Chat Bot AI tên là TomiChan được phát triển bởi TomiSakae!"
          )
        : getLocalStorage(
            "groq_system_prompt",
            "Bạn là 1 Chat Bot AI tên là TomiChan được phát triển bởi TomiSakae!"
          );

    if (!imageGeneration) return basePrompt;

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

${basePrompt}`;

    return imageGenerationPrompt;
  };

  return { getEnhancedSystemPrompt };
}
