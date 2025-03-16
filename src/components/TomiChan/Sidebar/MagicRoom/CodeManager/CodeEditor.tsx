/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { useOpenedFiles } from "../../../../../hooks/useOpenedFiles";
import FileIcon from "./FileIcon";

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
  const settingsRef = useRef<HTMLDivElement>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const contentRef = useRef(file.content);
  const originalContentRef = useRef(file.content);

  // Lấy hàm loadFiles từ useCodeAssistant để cập nhật danh sách file
  const { loadFiles } = useCodeAssistant();

  // Sử dụng hook useOpenedFiles để quản lý các file đã mở
  const { openedFiles, activeFileId, openFile, closeFile, setActiveFileId } =
    useOpenedFiles();

  // Lấy file hiện tại từ activeFileId
  const currentFile = openedFiles.find((f) => f.id === activeFileId) || file;
  const language = getLanguageFromFileName(currentFile.name);

  useEffect(() => {
    // Khởi tạo state ban đầu với một file duy nhất
    if (openedFiles.length === 0) {
      openFile(file);
    } else if (file.id !== activeFileId) {
      // Nếu nhận được một file mới khác với file hiện tại
      if (!openedFiles.some((f) => f.id === file.id)) {
        openFile(file);
      } else {
        // Nếu file đã có trong danh sách, chỉ cần active nó
        setActiveFileId(file.id);

        // Cập nhật content ngay lập tức cho file này
        setContent(file.content);
        setOriginalContent(file.content);
        contentRef.current = file.content;
        originalContentRef.current = file.content;
      }
    }
  }, [file.id]); // Chỉ chạy khi file.id thay đổi

  useEffect(() => {
    if (activeFileId) {
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

  const handleCloseFile = (fileId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();

    const targetFile = openedFiles.find((f) => f.id === fileId);
    if (!targetFile) return;

    const isContentChanged =
      targetFile.id === activeFileId ? content !== originalContent : false;

    if (isContentChanged) {
      // Lưu file hiện tại trước khi đóng
      setShowUnsavedModal(true);
      // Lưu fileId để đóng sau khi xử lý
      setLocalStorage("pendingFileToClose", fileId);
    } else {
      closeFile(fileId);
      if (openedFiles.length <= 1) {
        onBack();
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
              className={`p-2 rounded transition-colors ${
                showFileExplorer
                  ? "bg-gray-200 dark:bg-gray-700"
                  : "hover:bg-gray-100 dark:hover:bg-gray-900"
              }`}
              title="File Explorer"
            >
              <IconFolders size={20} />
            </button>
            <h2 className="text-xl font-bold">Code Editor</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSave()}
              className={`p-2 rounded transition-colors ${
                hasUnsavedChanges
                  ? "bg-yellow-100 dark:bg-yellow-900 hover:bg-yellow-200 dark:hover:bg-yellow-800"
                  : "hover:bg-gray-100 dark:hover:bg-gray-900"
              }`}
              disabled={isSaving || !hasUnsavedChanges}
              title="Lưu file"
            >
              <IconDeviceFloppy size={20} />
            </button>
            {isHtmlFile && (
              <button
                onClick={handleRunHtml}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded transition-colors"
                title="Chạy HTML"
              >
                <IconPlayerPlay size={20} />
              </button>
            )}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded transition-colors ${
                showSettings
                  ? "bg-gray-200 dark:bg-gray-700"
                  : "hover:bg-gray-100 dark:hover:bg-gray-900"
              }`}
              title="Cài đặt"
            >
              <IconSettings size={20} />
            </button>
            <button
              onClick={handleCloseAttempt}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors"
            >
              <IconX size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs for opened files */}
      <div className="flex items-center border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 overflow-x-auto">
        {openedFiles.map((openedFile) => (
          <div
            key={openedFile.id}
            onClick={() => setActiveFileId(openedFile.id)}
            className={`
              flex items-center gap-2 px-4 py-2 cursor-pointer border-r border-gray-200 dark:border-gray-700
              ${
                openedFile.id === activeFileId
                  ? "bg-white dark:bg-gray-800"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }
            `}
          >
            <FileIcon fileName={openedFile.name} size={16} />
            <span className="truncate max-w-[120px]">{openedFile.name}</span>
            <button
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
              onClick={(e) => handleCloseFile(openedFile.id, e)}
            >
              <IconX size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {showFileExplorer && (
          <div className="w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0">
            <FileExplorer
              onFileSelect={handleFileSelect}
              activeFileId={activeFileId || file.id}
              className="h-full"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <Editor
            height="100%"
            defaultLanguage={language}
            language={language}
            value={content}
            onChange={handleEditorChange}
            theme={settings.theme}
            options={{
              fontSize: settings.fontSize,
              minimap: {
                enabled: settings.minimap,
              },
              wordWrap: settings.wordWrap,
              tabSize: settings.tabSize,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              lineNumbers: "on",
              glyphMargin: true,
              folding: true,
              contextmenu: true,
              scrollbar: {
                verticalScrollbarSize: 12,
                horizontalScrollbarSize: 12,
              },
            }}
          />
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div
          ref={settingsRef}
          className="absolute right-4 top-20 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 p-4 w-80 z-10"
        >
          <h3 className="font-bold mb-4 text-gray-900 dark:text-gray-100">
            Cài đặt Editor
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Font Size: {settings.fontSize}px
              </label>
              <input
                type="range"
                min="12"
                max="24"
                value={settings.fontSize}
                onChange={(e) =>
                  updateSettings({ fontSize: Number(e.target.value) })
                }
                className="w-full"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Minimap
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.minimap}
                  onChange={(e) =>
                    updateSettings({ minimap: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Word Wrap
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.wordWrap === "on"}
                  onChange={(e) =>
                    updateSettings({
                      wordWrap: e.target.checked ? "on" : "off",
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Auto Save
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoSave}
                  onChange={(e) =>
                    updateSettings({ autoSave: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
              </label>
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Tab Size: {settings.tabSize}
              </label>
              <input
                type="range"
                min="2"
                max="8"
                step="2"
                value={settings.tabSize}
                onChange={(e) =>
                  updateSettings({ tabSize: Number(e.target.value) })
                }
                className="w-full"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Theme
              </label>
              <select
                value={settings.theme}
                onChange={(e) =>
                  updateSettings({
                    theme: e.target.value as "vs-dark" | "light",
                  })
                }
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-purple-500 dark:focus:border-purple-500"
              >
                <option value="vs-dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Unsaved changes modal */}
      {showUnsavedModal && (
        <Portal>
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                Lưu thay đổi?
              </h3>
              <p className="mb-6 text-gray-700 dark:text-gray-300">
                File có nội dung đã được thay đổi nhưng chưa được lưu. Bạn có
                muốn lưu trước khi đóng?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowUnsavedModal(false);
                    // Nếu đang có file chờ đóng
                    const pendingFileId = getLocalStorage("pendingFileToClose");
                    if (pendingFileId) {
                      closeFile(pendingFileId);
                      localStorage.removeItem("pendingFileToClose");
                      if (openedFiles.length <= 1) {
                        onBack();
                      }
                    } else {
                      // Xử lý đóng editor
                      onBack();
                    }
                  }}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Không lưu
                </button>
                <button
                  onClick={() => {
                    setShowUnsavedModal(false);
                  }}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-gray-100 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
                >
                  Hủy
                </button>
                <button
                  onClick={async () => {
                    await handleSave();
                    setShowUnsavedModal(false);

                    // Xử lý file đang chờ đóng
                    const pendingFileId = getLocalStorage("pendingFileToClose");
                    if (pendingFileId) {
                      closeFile(pendingFileId);
                      localStorage.removeItem("pendingFileToClose");
                      if (openedFiles.length <= 1) {
                        onBack();
                      }
                    } else {
                      // Xử lý mở file đang chờ
                      handleOpenPendingFile();
                      // Nếu không có file đang chờ, đóng editor
                      if (!getLocalStorage("pendingFileToOpen")) {
                        onBack();
                      }
                    }
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
