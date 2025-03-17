import { emitter, MAGIC_EVENTS } from "../../lib/events";

export function useMagicModeProcessor() {
  const processMagicModeTag = (content: string) => {
    // Kiểm tra xem tin nhắn có chứa thẻ MagicMode không
    const magicModeRegex = /\[MagicMode\](.*?)\[\/MagicMode\]/;
    const match = content.match(magicModeRegex);

    if (match) {
      const modeNumber = match[1];

      // Nếu là mode 1 (Quản lý mã nguồn), phát sự kiện để mở CodeAssistant
      if (modeNumber === "1") {
        emitter.emit(MAGIC_EVENTS.OPEN_CODE_ASSISTANT);
      }
    }
  };

  return { processMagicModeTag };
}
