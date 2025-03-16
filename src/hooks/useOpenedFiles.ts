import { useState } from "react";
import type { CodeFile } from "../types";

export function useOpenedFiles() {
  // Không khởi tạo với file ban đầu
  const [openedFiles, setOpenedFiles] = useState<CodeFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);

  const openFile = (file: CodeFile) => {
    setOpenedFiles((prev) => {
      // Nếu file đã tồn tại, không thêm vào lại
      if (prev.some((f) => f.id === file.id)) {
        return prev;
      }
      // Thêm file mới vào danh sách
      return [...prev, file];
    });
    setActiveFileId(file.id);
  };

  const closeFile = (fileId: string) => {
    setOpenedFiles((prev) => prev.filter((f) => f.id !== fileId));
    if (activeFileId === fileId) {
      const remainingFiles = openedFiles.filter((f) => f.id !== fileId);
      setActiveFileId(remainingFiles.length > 0 ? remainingFiles[0].id : null);
    }
  };

  // Cập nhật nội dung của file
  const updateFileContent = (fileId: string, content: string) => {
    setOpenedFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, content } : f))
    );
  };

  return {
    openedFiles,
    activeFileId,
    openFile,
    closeFile,
    setActiveFileId,
    updateFileContent,
  };
}
