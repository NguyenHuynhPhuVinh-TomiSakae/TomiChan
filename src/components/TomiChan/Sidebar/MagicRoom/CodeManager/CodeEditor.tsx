import React, { useState, useEffect, useRef } from "react";
import {
  IconArrowLeft,
  IconX,
  IconDeviceFloppy,
  IconSettings,
  IconPlayerPlay,
  IconFolders,
} from "@tabler/icons-react";
import type { CodeFile } from "../../../../../types";
import { chatDB } from "../../../../../utils/db";
import { toast } from "sonner";
import Editor from "@monaco-editor/react";
import {
  getLocalStorage,
  setLocalStorage,
} from "../../../../../utils/localStorage";
import Portal from "../../../../Portal";
import FileExplorer from "./FileExplorer";
import { useCodeAssistant } from "../../../../../hooks/useCodeAssistant";

interface EditorSettings {
  fontSize: number;
  minimap: boolean;
  wordWrap: "on" | "off";
  theme: "vs-dark" | "light";
  tabSize: number;
  autoSave: boolean;
}

interface CodeEditorProps {
  file: CodeFile;
  onClose: () => void;
  onBack: () => void;
  onFileOpen?: (file: CodeFile) => void;
}

// Hàm để xác định ngôn ngữ dựa vào phần mở rộng của file
const getLanguageFromFileName = (filename: string): string => {
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

export default function CodeEditor({
  file,
  onClose,
  onBack,
  onFileOpen,
}: CodeEditorProps) {
  const [content, setContent] = useState(file.content);
  const [originalContent, setOriginalContent] = useState(file.content);
  const [isSaving, setIsSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [showFileExplorer, setShowFileExplorer] = useState(false);
  const [settings, setSettings] = useState<EditorSettings>(() => {
    const savedSettings = getLocalStorage("codeEditorSettings");
    return savedSettings
      ? JSON.parse(savedSettings)
      : {
          fontSize: 14,
          minimap: true,
          wordWrap: "on",
          theme: "vs-dark",
          tabSize: 2,
          autoSave: false,
        };
  });
  const language = getLanguageFromFileName(file.name);
  const settingsRef = useRef<HTMLDivElement>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const contentRef = useRef(file.content);
  const originalContentRef = useRef(file.content);

  // Lấy hàm loadFiles từ useCodeAssistant để cập nhật danh sách file
  const { loadFiles } = useCodeAssistant();

  useEffect(() => {
    setContent(file.content);
    setOriginalContent(file.content);
    contentRef.current = file.content;
    originalContentRef.current = file.content;
  }, [file]);

  // Lưu cài đặt vào localStorage khi thay đổi
  useEffect(() => {
    setLocalStorage("codeEditorSettings", JSON.stringify(settings));
  }, [settings]);

  // Kiểm tra thay đổi chưa lưu
  useEffect(() => {
    setHasUnsavedChanges(content !== originalContent);
    contentRef.current = content;
  }, [content, originalContent]);

  useEffect(() => {
    originalContentRef.current = originalContent;
  }, [originalContent]);

  // Xử lý click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(event.target as Node)
      ) {
        setShowSettings(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Xử lý khi người dùng cố gắng đóng editor khi có thay đổi chưa lưu
  const handleCloseAttempt = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedModal(true);
    } else {
      onClose();
    }
  };

  const handleBackAttempt = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedModal(true);
    } else {
      onBack();
    }
  };

  const handleSave = async (isAutoSave = false) => {
    setIsSaving(true);
    try {
      const updatedFile: CodeFile = {
        ...file,
        content: contentRef.current,
        updatedAt: new Date(),
      };
      await chatDB.saveCodeFile(updatedFile);
      setOriginalContent(contentRef.current);
      originalContentRef.current = contentRef.current;
      setHasUnsavedChanges(false);

      // Thêm dòng này để sử dụng loadFiles
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

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setContent(value);
      contentRef.current = value;

      // Xử lý tự động lưu
      if (settings.autoSave) {
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current);
        }

        autoSaveTimeoutRef.current = setTimeout(() => {
          // Sử dụng ref để có giá trị mới nhất
          if (contentRef.current !== originalContentRef.current) {
            handleSave(true);
          }
        }, 2000);
      }
    }
  };

  const updateSettings = (newSettings: Partial<EditorSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...newSettings,
    }));
  };

  // Hàm xử lý chạy file HTML trong tab mới
  const handleRunHtml = () => {
    // Tạo một Blob từ nội dung HTML
    const blob = new Blob([content], { type: "text/html" });
    // Tạo URL từ blob
    const url = URL.createObjectURL(blob);
    // Mở URL trong tab mới
    window.open(url, "_blank");
    // Giải phóng URL sau khi đã mở
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  // Kiểm tra xem file có phải là HTML không
  const isHtmlFile = file.name.toLowerCase().endsWith(".html");

  // Xử lý khi chọn file từ FileExplorer
  const handleFileSelect = async (selectedFile: CodeFile) => {
    // Kiểm tra nếu có thay đổi chưa lưu
    if (hasUnsavedChanges) {
      // Lưu file hiện tại và ID của file được chọn để mở sau khi xử lý
      setShowUnsavedModal(true);
      // Lưu file được chọn vào localStorage để mở sau khi xử lý
      setLocalStorage("pendingFileToOpen", JSON.stringify(selectedFile));
    } else if (onFileOpen) {
      // Nếu không có thay đổi, mở file ngay lập tức
      onFileOpen(selectedFile);
    }
  };

  // Xử lý mở file sau khi xử lý thay đổi chưa lưu
  const handleOpenPendingFile = () => {
    const pendingFile = getLocalStorage("pendingFileToOpen");
    if (pendingFile && onFileOpen) {
      try {
        const fileToOpen = JSON.parse(pendingFile);
        onFileOpen(fileToOpen);
        // Xóa file đang chờ sau khi đã mở
        localStorage.removeItem("pendingFileToOpen");
      } catch (error) {
        console.error("Lỗi khi mở file:", error);
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBackAttempt}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors cursor-pointer"
            >
              <IconArrowLeft size={24} />
            </button>
            <button
              onClick={() => setShowFileExplorer(!showFileExplorer)}
              className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors cursor-pointer ${
                showFileExplorer ? "bg-gray-100 dark:bg-gray-900" : ""
              }`}
              title="Hiển thị cây thư mục"
            >
              <IconFolders size={24} />
            </button>
            <h2 className="text-2xl font-bold">{file.name}</h2>
            {hasUnsavedChanges && (
              <span className="text-xs bg-yellow-500 text-white px-2 py-1 rounded-full">
                Chưa lưu
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Thêm nút chạy file HTML */}
            {isHtmlFile && (
              <button
                onClick={handleRunHtml}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 cursor-pointer"
                title="Chạy file HTML trong tab mới"
              >
                <IconPlayerPlay size={20} />
                Chạy
              </button>
            )}

            <div className="relative" ref={settingsRef}>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors cursor-pointer"
              >
                <IconSettings size={24} />
              </button>

              {/* Settings Dropdown */}
              {showSettings && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                  <div className="p-4 space-y-4">
                    {/* Font Size */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Font Size: {settings.fontSize}px
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="30"
                        value={settings.fontSize}
                        onChange={(e) =>
                          updateSettings({ fontSize: Number(e.target.value) })
                        }
                        className="w-full"
                      />
                    </div>

                    {/* Tab Size */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tab Size</label>
                      <select
                        value={settings.tabSize}
                        onChange={(e) =>
                          updateSettings({ tabSize: Number(e.target.value) })
                        }
                        className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
                      >
                        <option value={2}>2 spaces</option>
                        <option value={4}>4 spaces</option>
                        <option value={8}>8 spaces</option>
                      </select>
                    </div>

                    {/* Theme */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Theme</label>
                      <select
                        value={settings.theme}
                        onChange={(e) =>
                          updateSettings({
                            theme: e.target.value as "vs-dark" | "light",
                          })
                        }
                        className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
                      >
                        <option value="vs-dark">Dark</option>
                        <option value="light">Light</option>
                      </select>
                    </div>

                    {/* Minimap */}
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">
                        Hiện Minimap
                      </label>
                      <input
                        type="checkbox"
                        checked={settings.minimap}
                        onChange={(e) =>
                          updateSettings({ minimap: e.target.checked })
                        }
                        className="rounded"
                      />
                    </div>

                    {/* Word Wrap */}
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Word Wrap</label>
                      <input
                        type="checkbox"
                        checked={settings.wordWrap === "on"}
                        onChange={(e) =>
                          updateSettings({
                            wordWrap: e.target.checked ? "on" : "off",
                          })
                        }
                        className="rounded"
                      />
                    </div>

                    {/* Auto Save */}
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Tự động lưu</label>
                      <input
                        type="checkbox"
                        checked={settings.autoSave}
                        onChange={(e) =>
                          updateSettings({ autoSave: e.target.checked })
                        }
                        className="rounded"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => handleSave()}
              disabled={isSaving || !hasUnsavedChanges}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <IconDeviceFloppy size={20} />
              {isSaving ? "Đang lưu..." : "Lưu"}
            </button>
            <button
              onClick={handleCloseAttempt}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors cursor-pointer"
            >
              <IconX size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Editor Area with File Explorer */}
      <div className="flex-1 flex">
        {showFileExplorer && (
          <div className="w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0">
            <FileExplorer
              onFileSelect={handleFileSelect}
              activeFileId={file.id}
              className="h-full"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <Editor
            height="100%"
            defaultLanguage={language}
            value={content}
            onChange={handleEditorChange}
            theme={settings.theme}
            options={{
              fontSize: settings.fontSize,
              minimap: { enabled: settings.minimap },
              wordWrap: settings.wordWrap,
              lineNumbers: "on",
              folding: true,
              autoIndent: "full",
              formatOnPaste: true,
              formatOnType: true,
              suggestOnTriggerCharacters: true,
              acceptSuggestionOnEnter: "on",
              tabSize: settings.tabSize,
              automaticLayout: true,
              scrollBeyondLastLine: true,
              smoothScrolling: true,
              cursorBlinking: "smooth",
              cursorSmoothCaretAnimation: "on",
              bracketPairColorization: {
                enabled: true,
              },
              padding: {
                top: 16,
                bottom: 16,
              },
            }}
          />
        </div>
      </div>

      {/* Modal xác nhận khi có thay đổi chưa lưu */}
      {showUnsavedModal && (
        <Portal>
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg shadow-xl">
              <h3 className="text-xl font-semibold mb-4">
                Thay đổi chưa được lưu
              </h3>
              <p className="mb-6">
                Bạn có thay đổi chưa được lưu. Bạn muốn làm gì?
              </p>
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={() => {
                    setShowUnsavedModal(false);
                    // Nếu có file đang chờ mở, mở nó
                    if (getLocalStorage("pendingFileToOpen")) {
                      handleOpenPendingFile();
                    } else if (onBack) {
                      onBack();
                    } else {
                      onClose();
                    }
                  }}
                  className="px-5 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer"
                >
                  Bỏ thay đổi
                </button>
                <button
                  onClick={async () => {
                    await handleSave();
                    setShowUnsavedModal(false);
                    // Nếu có file đang chờ mở, mở nó
                    if (getLocalStorage("pendingFileToOpen")) {
                      handleOpenPendingFile();
                    } else if (onBack) {
                      onBack();
                    } else {
                      onClose();
                    }
                  }}
                  className="px-5 py-2.5 text-white bg-purple-500 hover:bg-purple-600 rounded-lg cursor-pointer"
                >
                  Lưu và đóng
                </button>
                <button
                  onClick={() => {
                    setShowUnsavedModal(false);
                    // Xóa file đang chờ nếu người dùng chọn tiếp tục chỉnh sửa
                    localStorage.removeItem("pendingFileToOpen");
                  }}
                  className="px-5 py-2.5 text-white bg-gray-500 hover:bg-gray-600 rounded-lg cursor-pointer"
                >
                  Tiếp tục chỉnh sửa
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
