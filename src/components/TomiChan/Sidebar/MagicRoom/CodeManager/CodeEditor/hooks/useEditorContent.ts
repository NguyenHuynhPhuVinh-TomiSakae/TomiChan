/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { chatDB } from "../../../../../../../utils/db";
import type { CodeFile } from "../../../../../../../types";
import { useCodeAssistant } from "../../hooks/useCodeAssistant";
import { useOpenedFiles } from "../../hooks/useOpenedFiles";

export function useEditorContent(file: CodeFile) {
  const [content, setContent] = useState(file.content);
  const [originalContent, setOriginalContent] = useState(file.content);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const contentRef = useRef(file.content);
  const originalContentRef = useRef(file.content);
  const isUpdatingFromEditorRef = useRef(false);

  // Lấy hàm loadFiles từ useCodeAssistant để cập nhật danh sách file
  const { loadFiles } = useCodeAssistant();

  // Sử dụng hook useOpenedFiles để quản lý các file đã mở
  const {
    openedFiles,
    activeFileId,
    openFile,
    closeFile,
    setActiveFileId,
    updateFileContent,
    updateOpenedFile,
    removeOpenedFile,
  } = useOpenedFiles();

  // Chỉ mở file ban đầu và file mới một lần
  const initializedRef = useRef(false);
  useEffect(() => {
    // Kiểm tra xem component mới mount hay file mới được truyền vào
    if (!initializedRef.current) {
      // Lần đầu mount, chỉ mở file ban đầu
      openFile(file);
      initializedRef.current = true;
    } else if (file && file.id && !openedFiles.some((f) => f.id === file.id)) {
      // Nếu nhận file mới và chưa có trong danh sách, mở file đó
      openFile(file);
    } else if (file && file.id) {
      // Nếu file đã có trong danh sách, chỉ active nó
      setActiveFileId(file.id);
    }
  }, [file.id]);

  useEffect(() => {
    if (activeFileId) {
      // Nếu đang cập nhật từ editor, bỏ qua việc tải lại nội dung
      if (isUpdatingFromEditorRef.current) {
        return;
      }

      // Tìm file trong danh sách đã mở
      const openedFile = openedFiles.find((f) => f.id === activeFileId);

      if (openedFile) {
        // Nếu đã có nội dung trong danh sách đã mở, sử dụng ngay
        setContent(openedFile.content);
        setOriginalContent(openedFile.content);
        contentRef.current = openedFile.content;
        originalContentRef.current = openedFile.content;
      } else {
        // Nếu không có, tải từ database
        const loadFileContent = async () => {
          try {
            const loadedFile = await chatDB.getCodeFile(activeFileId);
            if (loadedFile) {
              setContent(loadedFile.content);
              setOriginalContent(loadedFile.content);
              contentRef.current = loadedFile.content;
              originalContentRef.current = loadedFile.content;
            }
          } catch (error) {
            console.error("Lỗi khi tải nội dung file:", error);
            toast.error("Không thể tải nội dung file!");
          }
        };
        loadFileContent();
      }
    }
  }, [activeFileId, openedFiles]);

  // Kiểm tra thay đổi chưa lưu - chỉ khi không đang cập nhật từ editor
  useEffect(() => {
    if (isUpdatingFromEditorRef.current) {
      return;
    }

    // So sánh nội dung hiện tại với nội dung gốc để xác định có thay đổi chưa lưu không
    const hasChanges = content !== originalContent;
    setHasUnsavedChanges(hasChanges);
    contentRef.current = content;
  }, [content, originalContent]);

  useEffect(() => {
    originalContentRef.current = originalContent;
  }, [originalContent]);

  const handleSave = async (isAutoSave = false) => {
    setIsSaving(true);
    try {
      // Lấy file hiện tại từ activeFileId
      const currentFileId = activeFileId || file.id;
      let fileToUpdate = file;

      // Nếu activeFileId khác với file.id, tìm file đúng để cập nhật
      if (currentFileId !== file.id) {
        const currentFile = await chatDB.getCodeFile(currentFileId);
        if (currentFile) {
          fileToUpdate = currentFile;
        }
      }

      const updatedFile: CodeFile = {
        ...fileToUpdate,
        content: contentRef.current,
        updatedAt: new Date(),
      };

      await chatDB.saveCodeFile(updatedFile);

      // Cập nhật nội dung gốc sau khi lưu
      setOriginalContent(contentRef.current);
      originalContentRef.current = contentRef.current;

      // Đặt trạng thái không có thay đổi chưa lưu
      setHasUnsavedChanges(false);

      // Cập nhật danh sách file
      await loadFiles();

      if (!isAutoSave) {
        toast.success("Đã lưu file thành công!");
      }
    } catch (error) {
      console.error("Lỗi khi lưu file:", error);
      if (!isAutoSave) {
        toast.error("Lỗi khi lưu file!");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditorChange = (value: string | undefined, settings: any) => {
    const newContent = value || "";

    // Đánh dấu đang cập nhật từ editor để tránh tải lại nội dung
    isUpdatingFromEditorRef.current = true;

    // Cập nhật nội dung và kiểm tra thay đổi
    setContent(newContent);
    contentRef.current = newContent;

    // Cập nhật trạng thái hasUnsavedChanges trực tiếp
    const hasChanges = newContent !== originalContentRef.current;
    setHasUnsavedChanges(hasChanges);

    // Cập nhật nội dung trong danh sách file đã mở
    if (activeFileId) {
      updateFileContent(activeFileId, newContent);

      // Phát event để thông báo nội dung file đã thay đổi
      const event = new CustomEvent("file_content_changed", {
        detail: {
          fileId: activeFileId,
          content: newContent,
        },
      });
      window.dispatchEvent(event);
    }

    // Xử lý tự động lưu
    if (settings && settings.autoSave) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      autoSaveTimeoutRef.current = setTimeout(() => {
        // Kiểm tra lại một lần nữa trước khi lưu
        if (contentRef.current !== originalContentRef.current) {
          handleSave(true);
        }
      }, 2000);
    }

    // Đặt lại cờ sau một khoảng thời gian ngắn
    setTimeout(() => {
      isUpdatingFromEditorRef.current = false;
    }, 100);
  };

  // Thêm useEffect để lắng nghe sự kiện file_content_updated
  useEffect(() => {
    const handleFileContentUpdated = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { fileId, fileName, content: updatedContent } = customEvent.detail;

      // Nếu file đang mở là file được cập nhật
      if (activeFileId === fileId) {
        // Đánh dấu đang cập nhật từ editor để tránh tải lại nội dung
        isUpdatingFromEditorRef.current = true;

        // Cập nhật nội dung
        setContent(updatedContent);
        setOriginalContent(updatedContent);
        contentRef.current = updatedContent;
        originalContentRef.current = updatedContent;

        // Đặt trạng thái không có thay đổi chưa lưu
        setHasUnsavedChanges(false);

        // Cập nhật nội dung trong danh sách file đã mở
        updateFileContent(fileId, updatedContent);

        toast.success(`Đã cập nhật nội dung file: ${fileName || fileId}`);

        // Đặt lại cờ sau một khoảng thời gian ngắn
        setTimeout(() => {
          isUpdatingFromEditorRef.current = false;
        }, 100);
      } else {
        // Hiển thị thông báo ngay cả khi file không được mở
        toast.success(`Đã cập nhật nội dung file: ${fileName || fileId}`);

        // Cập nhật nội dung trong danh sách file đã mở nếu file đó đã được mở trước đó
        const openedFileIndex = openedFiles.findIndex((f) => f.id === fileId);
        if (openedFileIndex !== -1) {
          updateFileContent(fileId, updatedContent);
        }
      }
    };

    // Đăng ký lắng nghe sự kiện
    window.addEventListener(
      "file_content_updated",
      handleFileContentUpdated as EventListener
    );

    // Cleanup
    return () => {
      window.removeEventListener(
        "file_content_updated",
        handleFileContentUpdated as EventListener
      );
    };
  }, [activeFileId, updateFileContent, openedFiles]);

  return {
    content,
    setContent,
    originalContent,
    setOriginalContent,
    isSaving,
    hasUnsavedChanges,
    showUnsavedModal,
    setShowUnsavedModal,
    handleSave,
    handleEditorChange,
    openedFiles,
    activeFileId,
    openFile,
    closeFile,
    setActiveFileId,
    updateOpenedFile,
    removeOpenedFile,
  };
}
