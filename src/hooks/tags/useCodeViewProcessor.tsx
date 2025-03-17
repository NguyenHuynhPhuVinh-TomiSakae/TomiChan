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

    // Xử lý CodeEditor tag để quay về
    const codeEditorRegex = /\[CodeEditor\]([\s\S]*?)\[\/CodeEditor\]/g;
    const editorMatches = content.matchAll(codeEditorRegex);

    for (const match of editorMatches) {
      const value = match[1].trim();
      if (value === "0") {
        // Quay về code_manager
        setLocalStorage("ui_state_magic", "code_manager");
        setLocalStorage("code_file_path", "");
      }
    }
  };

  return { processCodeViewTag };
}
