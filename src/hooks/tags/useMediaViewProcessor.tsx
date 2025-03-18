import { setSessionStorage } from "@/utils/sessionStorage";
import { emitter, MAGIC_EVENTS } from "../../lib/events";

export function useMediaViewProcessor() {
  const processMediaViewTag = async (content: string) => {
    const mediaViewRegex = /\[MediaView\]0\[\/MediaView\]/g;
    const matches = content.match(mediaViewRegex);

    if (matches) {
      // Phát event để đóng media view
      setSessionStorage("ui_state_magic", "code_manager");
      emitter.emit(MAGIC_EVENTS.CLOSE_MEDIA);
    }
  };

  return { processMediaViewTag };
}
