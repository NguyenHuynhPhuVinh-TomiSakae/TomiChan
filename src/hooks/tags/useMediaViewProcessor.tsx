import { getLocalStorage, setLocalStorage } from "../../utils/localStorage";

export function useMediaViewProcessor() {
  const processMediaViewTag = async (content: string) => {
    const mediaViewRegex = /\[MediaView\]0\[\/MediaView\]/g;
    const matches = content.match(mediaViewRegex);

    if (matches) {
      const currentState = getLocalStorage("ui_state_magic", "none");
      // Chỉ chuyển về code_manager khi đang ở media_view
      if (currentState === "media_view") {
        setLocalStorage("ui_state_magic", "code_manager");
        setLocalStorage("media_file_name", "");
      }
    }
  };

  return { processMediaViewTag };
}
