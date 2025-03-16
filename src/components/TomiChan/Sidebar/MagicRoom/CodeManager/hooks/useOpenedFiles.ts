import { useState, useRef } from "react";
import type { CodeFile } from "../../../../../../types";
import { chatDB } from "../../../../../../utils/db";

export function useOpenedFiles() {
  // Không khởi tạo với file ban đầu
  const [openedFiles, setOpenedFiles] = useState<CodeFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const isOpeningFileRef = useRef(false);

  const openFile = async (file: CodeFile) => {
    // Nếu đang trong quá trình mở file, bỏ qua
    if (isOpeningFileRef.current) {
      return;
    }

    isOpeningFileRef.current = true;

    try {
      // Kiểm tra xem file đã tồn tại trong danh sách chưa
      const fileExists = openedFiles.some((f) => f.id === file.id);

      if (fileExists) {
        // Nếu file đã tồn tại, chỉ active nó
        setActiveFileId(file.id);
      } else {
        try {
          // Lấy phiên bản mới nhất từ database
          const latestFile = await chatDB.getCodeFile(file.id);

          if (latestFile) {
            // Sử dụng phiên bản mới nhất từ database
            setOpenedFiles((prev) => [...prev, latestFile]);
            setActiveFileId(latestFile.id);
          } else {
            // Nếu không tìm thấy trong database, sử dụng file được truyền vào
            setOpenedFiles((prev) => [...prev, file]);
            setActiveFileId(file.id);
          }
        } catch (error) {
          console.error("Lỗi khi tải file từ database:", error);
          // Nếu có lỗi, sử dụng file được truyền vào
          setOpenedFiles((prev) => [...prev, file]);
          setActiveFileId(file.id);
        }
      }
    } finally {
      // Đảm bảo luôn đặt lại cờ khi hoàn thành
      setTimeout(() => {
        isOpeningFileRef.current = false;
      }, 100);
    }
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

  // Thêm hàm để cập nhật file trong danh sách đã mở
  const updateOpenedFile = (updatedFile: CodeFile) => {
    setOpenedFiles((prev) =>
      prev.map((f) => (f.id === updatedFile.id ? updatedFile : f))
    );
  };

  // Thêm hàm để xóa file khỏi danh sách đã mở
  const removeOpenedFile = (fileId: string) => {
    setOpenedFiles((prev) => prev.filter((f) => f.id !== fileId));
    // Nếu file đang active bị xóa, chuyển sang file khác
    if (activeFileId === fileId) {
      const remainingFiles = openedFiles.filter((f) => f.id !== fileId);
      setActiveFileId(remainingFiles.length > 0 ? remainingFiles[0].id : null);
    }
  };

  return {
    openedFiles,
    activeFileId,
    openFile,
    closeFile,
    setActiveFileId,
    updateFileContent,
    updateOpenedFile,
    removeOpenedFile,
  };
}
