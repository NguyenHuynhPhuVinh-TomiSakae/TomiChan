import mitt, { Emitter } from "mitt";

// Định nghĩa type cho tất cả events
type Events = {
  "magic:openCodeAssistant": void;
  "fileExplorer:reload": void;
  "media:openFile": { fileName: string };
  "media:closeFile": void;
  "code:openFile": { filePath: string };
  "code:closeFile": void;
};

// Tạo instance của emitter
export const emitter: Emitter<Events> = mitt<Events>();

// Constants để tránh magic strings
export const MAGIC_EVENTS = {
  OPEN_CODE_ASSISTANT: "magic:openCodeAssistant",
  OPEN_MEDIA: "media:openFile",
  CLOSE_MEDIA: "media:closeFile",
  OPEN_CODE_FILE: "code:openFile",
  CLOSE_CODE_FILE: "code:closeFile",
} as const;

export const FILE_EXPLORER_EVENTS = {
  RELOAD: "fileExplorer:reload",
} as const;
