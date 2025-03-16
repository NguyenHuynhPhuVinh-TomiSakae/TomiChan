/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CodeFile } from "../../../../../../types";

// Hàm để xác định ngôn ngữ dựa vào phần mở rộng của file
export const getLanguageFromFileName = (filename: string): string => {
  const ext = filename.split(".").pop()?.toLowerCase();
  const languageMap: { [key: string]: string } = {
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    py: "python",
    java: "java",
    cpp: "cpp",
    c: "c",
    cs: "csharp",
    html: "html",
    css: "css",
    json: "json",
    md: "markdown",
    php: "php",
    rb: "ruby",
    rs: "rust",
    sql: "sql",
    swift: "swift",
    go: "go",
    yml: "yaml",
    yaml: "yaml",
  };
  return languageMap[ext || ""] || "plaintext";
};

// Hàm để xác định xem file có phải là media hay không
export const isMediaFile = (fileName: string): boolean => {
  const extension = fileName.split(".").pop()?.toLowerCase();
  return [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "webp",
    "svg",
    "mp3",
    "wav",
    "ogg",
    "aac",
    "mp4",
    "webm",
    "ogv",
    "mov",
    "pdf",
  ].includes(extension || "");
};

// Hàm để xác định loại media
export const getMediaFileType = (fileName: string): string => {
  const extension = fileName.split(".").pop()?.toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(extension || "")) {
    return "image";
  } else if (["mp3", "wav", "ogg", "aac"].includes(extension || "")) {
    return "audio";
  } else if (["mp4", "webm", "ogv", "mov"].includes(extension || "")) {
    return "video";
  } else if (["pdf"].includes(extension || "")) {
    return "pdf";
  }
  return "unknown";
};

// Tạo data URL cho file media
export const createMediaUrl = (file: CodeFile): string => {
  const extension = file.name.split(".").pop()?.toLowerCase();
  let mimeType = "";

  if (getMediaFileType(file.name) === "image") {
    mimeType = `image/${extension === "svg" ? "svg+xml" : extension}`;
  } else if (getMediaFileType(file.name) === "audio") {
    mimeType = `audio/${extension}`;
  } else if (getMediaFileType(file.name) === "video") {
    mimeType = `video/${extension}`;
  } else if (getMediaFileType(file.name) === "pdf") {
    mimeType = "application/pdf";
  }

  // Kiểm tra nếu nội dung đã là data URL
  if (file.content.startsWith("data:")) {
    return file.content;
  }

  // Tạo data URL
  return `data:${mimeType};base64,${file.content}`;
};
