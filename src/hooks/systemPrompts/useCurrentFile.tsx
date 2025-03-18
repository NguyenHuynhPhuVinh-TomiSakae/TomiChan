/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { getSessionStorage } from "../../utils/sessionStorage";
import { MAGIC_EVENTS } from "@/lib/events";
import { emitter } from "@/lib/events";
import { chatDB } from "../../utils/db";
import { useSentFiles } from "./useSentFiles";

export function useCurrentFile(files: any[]) {
  const [currentFile, setCurrentFile] = useState(
    getSessionStorage("current_open_file", "")
  );
  const [currentFileContent, setCurrentFileContent] = useState("");
  const { loadSentFiles } = useSentFiles(files, currentFile);
  // Thêm hàm để lấy nội dung file đang mở
  const loadCurrentFileContent = async () => {
    if (!currentFile) return;

    try {
      // Tìm file trong danh sách files đã tải
      const fileObj = files.find((f) => f.name === currentFile);

      if (fileObj) {
        setCurrentFileContent(fileObj.content || "");
      } else {
        // Nếu không tìm thấy trong danh sách đã tải, tìm trong database
        const allFiles = await chatDB.getAllCodeFiles();
        const fileFromDB = allFiles.find((f) => f.name === currentFile);

        if (fileFromDB) {
          setCurrentFileContent(fileFromDB.content || "");
        } else {
          setCurrentFileContent("");
        }
      }
    } catch (error) {
      console.error("Lỗi khi tải nội dung file:", error);
      setCurrentFileContent("");
    }
  };

  useEffect(() => {
    const handleFileChanged = (event: { fileName: string }) => {
      if (event.fileName) {
        setCurrentFile(event.fileName);
      }
    };

    emitter.on(MAGIC_EVENTS.FILE_CHANGED, handleFileChanged);

    return () => {
      emitter.off(MAGIC_EVENTS.FILE_CHANGED, handleFileChanged);
    };
  }, []);

  // Thêm useEffect để tải nội dung file khi currentFile thay đổi
  useEffect(() => {
    if (currentFile) {
      loadCurrentFileContent();
    } else {
      setCurrentFileContent("");
    }
  }, [currentFile]);

  // Lắng nghe sự kiện thay đổi nội dung file
  useEffect(() => {
    const handleFileContentChanged = (event: {
      fileId: string;
      content: string;
    }) => {
      if (event.content) {
        // Cập nhật nội dung file nếu file đang mở là file được thay đổi
        const fileId = event.fileId;
        const content = event.content;

        // Tìm file trong danh sách files
        const file = files.find((f) => f.id === fileId);
        if (file && file.name === currentFile) {
          setCurrentFileContent(content);
        }

        // Tải lại danh sách file đã gửi cho AI để cập nhật nội dung
        loadSentFiles();
      }
    };

    // Đăng ký lắng nghe sự kiện
    emitter.on(MAGIC_EVENTS.FILE_CONTENT_CHANGED, handleFileContentChanged);

    // Cleanup khi component unmount
    return () => {
      emitter.off(MAGIC_EVENTS.FILE_CONTENT_CHANGED, handleFileContentChanged);
    };
  }, [currentFile, files]);

  return {
    currentFile,
    currentFileContent,
    loadCurrentFileContent,
  };
}
