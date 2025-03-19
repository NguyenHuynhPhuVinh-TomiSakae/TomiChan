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

      // Luôn tải lại tất cả các file từ database
      const allFilesFromDB = await chatDB.getAllCodeFiles();

      const filesWithContent = await Promise.all(
        fileNames.map(async (fileName: string) => {
          const isCurrentlyOpenFile = fileName === currentFile;

          // Nếu là file đang mở, trả về file với nội dung mới nhất
          if (isCurrentlyOpenFile) {
            // Lấy nội dung mới nhất của file đang mở từ CSDL
            const currentFileFromDB = allFilesFromDB.find(
              (f) => f.name === fileName
            );
            return {
              name: fileName,
              content: currentFileFromDB ? currentFileFromDB.content || "" : "",
            };
          }

          // Tìm file trong danh sách từ CSDL trước
          const fileFromDB = allFilesFromDB.find((f) => f.name === fileName);
          if (fileFromDB) {
            return {
              name: fileName,
              content: fileFromDB.content || "",
            };
          }

          // Nếu không tìm thấy trong CSDL, kiểm tra trong files đã tải
          const fileObj = files.find((f) => f.name === fileName);
          return {
            name: fileName,
            content: fileObj ? fileObj.content || "" : "",
          };
        })
      );
      setSentFiles(filesWithContent);
      return filesWithContent;
    } catch (error) {
      console.error("Lỗi khi tải danh sách file đã gửi cho AI:", error);
      setSentFiles([]);
      return [];
    }
  };

  return {
    sentFiles,
    setSentFiles,
    loadSentFiles,
  };
}
