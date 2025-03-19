import mitt, { Emitter } from "mitt";

// Định nghĩa type cho tất cả events
type Events = {
  "magic:openCodeAssistant": void;
  "fileExplorer:reload": void;
  "media:openFile": { fileName: string };
  "media:closeFile": void;
  "code:openFile": {
    filePath: string;
    projectId?: string;
  };
  "code:closeFile": void;
  "magic:backToRoom": void;
  "code:accept": {
    filePath: string;
    newContent: string;
    projectId?: string;
  };
  "file:contentUpdated": {
    fileId: string;
    fileName: string;
    content: string;
  };
  "file:sentToAI": {
    fileName: string;
    fileContent: string;
  };
  "file:removedFromAI": {
    fileName: string;
  };
  "file:allRemovedFromAI": void;
  "file:changed": {
    fileId: string;
    fileName: string;
  };
  "file:contentChanged": {
    fileId: string;
    content: string;
  };
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
  BACK_TO_MAGIC_ROOM: "magic:backToRoom",
  ACCEPT_CODE: "code:accept",
  FILE_CONTENT_UPDATED: "file:contentUpdated",
  FILE_SENT_TO_AI: "file:sentToAI",
  FILE_REMOVED_FROM_AI: "file:removedFromAI",
  ALL_FILES_REMOVED_FROM_AI: "file:allRemovedFromAI",
  FILE_CHANGED: "file:changed",
  FILE_CONTENT_CHANGED: "file:contentChanged",
} as const;

export const FILE_EXPLORER_EVENTS = {
  RELOAD: "fileExplorer:reload",
} as const;
