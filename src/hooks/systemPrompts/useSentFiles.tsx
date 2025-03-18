/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { getSessionStorage } from "../../utils/sessionStorage";
import { chatDB } from "../../utils/db";

export function useSentFiles(files: any[], currentFile: string) {
  const [sentFiles, setSentFiles] = useState<
    { name: string; content: string }[]
  >([]);

  // Tải danh sách file đã gửi cho AI và nội dung của chúng
  const loadSentFiles = async () => {
    const sentFilesStr = getSessionStorage("files_sent_to_ai", "[]");
    try {
      const fileNames = JSON.parse(sentFilesStr);
      const filesWithContent = await Promise.all(
        fileNames.map(async (fileName: string) => {
          const isCurrentlyOpenFile = fileName === currentFile;
          if (isCurrentlyOpenFile) {
            return {
              name: fileName,
              content: "",
            };
          }
          let fileObj = files.find((f) => f.name === fileName);
          if (!fileObj) {
            const allFiles = await chatDB.getAllCodeFiles();
            fileObj = allFiles.find((f) => f.name === fileName);
          }
          return {
            name: fileName,
            content: fileObj ? fileObj.content || "" : "",
          };
        })
      );
      setSentFiles(filesWithContent);
    } catch (error) {
      console.error("Lỗi khi tải danh sách file đã gửi cho AI:", error);
      setSentFiles([]);
    }
  };

  return {
    sentFiles,
    setSentFiles,
    loadSentFiles,
  };
}
