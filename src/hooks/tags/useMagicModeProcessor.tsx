import { setLocalStorage } from "../../utils/localStorage";

export function useMagicModeProcessor() {
  const processMagicModeTag = (content: string) => {
    // Kiểm tra xem tin nhắn có chứa thẻ MagicMode không
    const magicModeRegex = /\[MagicMode\](.*?)\[\/MagicMode\]/;
    const match = content.match(magicModeRegex);

    if (match) {
      console.log("match", match);
      const modeNumber = match[1];

      // Nếu là mode 1 (Quản lý mã nguồn), hiển thị UI quản lý code
      if (modeNumber === "1") {
        // Lưu trạng thái vào localStorage
        setLocalStorage("ui_state_magic", "code_manager");
      }
    }
  };

  return { processMagicModeTag };
}
