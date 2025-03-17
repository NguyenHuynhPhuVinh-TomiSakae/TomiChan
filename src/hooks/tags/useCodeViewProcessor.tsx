import { setLocalStorage } from "../../utils/localStorage";

export function useCodeViewProcessor() {
  const processCodeViewTag = async (content: string) => {
    // Xử lý OpenCode tag
    const openCodeRegex = /\[OpenCode\]([\s\S]*?)\[\/OpenCode\]/g;
    const codeMatches = content.matchAll(openCodeRegex);

    for (const match of codeMatches) {
      const codeContent = match[1];
      const path = codeContent.match(/path:\s*(.*)/)?.[1]?.trim();

      if (path) {
        // Chuyển trạng thái sang code_view và lưu đường dẫn file
        setLocalStorage("ui_state_magic", "code_view");
        setLocalStorage("code_file_path", path);
      }
    }
  };

  return { processCodeViewTag };
}
