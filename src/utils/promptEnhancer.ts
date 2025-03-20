import { getGeminiResponse } from "@/lib/gemini";
import { getGroqResponse } from "@/lib/groq";
import { getOpenRouterResponse } from "@/lib/openrouter";
import { getLocalStorage } from "./localStorage";

const ENHANCEMENT_PROMPT = `Bạn là một chuyên gia về prompt engineering. Nhiệm vụ của bạn là cải thiện và làm rõ ràng hơn prompt được cung cấp. Hãy:
1. Thêm chi tiết và ngữ cảnh cần thiết
2. Làm rõ yêu cầu
3. Thêm các ràng buộc hoặc tiêu chí cụ thể
4. Giữ nguyên ý định gốc của prompt
5. Trả về prompt đã được cải thiện, KHÔNG kèm theo giải thích

Ví dụ:
Input: "Viết code cho website bán hàng"
Output: "Tạo một trang web bán hàng sử dụng React và TypeScript với các tính năng: danh sách sản phẩm, giỏ hàng, thanh toán, quản lý tài khoản người dùng. Trang web cần responsive, có giao diện thân thiện với người dùng và tuân thủ các nguyên tắc UX/UI cơ bản. Đảm bảo code sạch, có comment đầy đủ và dễ bảo trì."

Hãy cải thiện prompt sau:`;

export async function enhancePrompt(originalPrompt: string): Promise<string> {
  try {
    let enhancedPrompt = "";
    // Lấy provider từ cài đặt của người dùng, mặc định là provider AI hiện tại
    const selectedProvider = getLocalStorage(
      "prompt_enhancement_provider",
      getLocalStorage("selected_provider", "google")
    );

    const handleChunk = (chunk: string) => {
      enhancedPrompt += chunk;
    };

    switch (selectedProvider) {
      case "google":
        await getGeminiResponse(
          `${ENHANCEMENT_PROMPT}\n${originalPrompt}`,
          [],
          handleChunk
        );
        break;
      case "groq":
        await getGroqResponse(
          `${ENHANCEMENT_PROMPT}\n${originalPrompt}`,
          [],
          handleChunk
        );
        break;
      case "openrouter":
        await getOpenRouterResponse(
          `${ENHANCEMENT_PROMPT}\n${originalPrompt}`,
          [],
          handleChunk
        );
        break;
      default:
        await getGeminiResponse(
          `${ENHANCEMENT_PROMPT}\n${originalPrompt}`,
          [],
          handleChunk
        );
    }

    return enhancedPrompt.trim();
  } catch (error) {
    console.error("Lỗi khi cường hóa prompt:", error);
    return originalPrompt; // Trả về prompt gốc nếu có lỗi
  }
}
