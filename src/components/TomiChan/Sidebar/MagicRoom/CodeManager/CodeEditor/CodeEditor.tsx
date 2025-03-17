/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";
import Editor, { Monaco } from "@monaco-editor/react";
import {
  IconArrowLeft,
  IconDeviceFloppy,
  IconFolders,
  IconDownload,
  IconX,
  IconPlayerPlay,
  IconTerminal2,
} from "@tabler/icons-react";
import type { CodeFile } from "../../../../../../types";
import { isMediaFile, getLanguageFromFileName } from "./utils";
import { useEditorSettings } from "./hooks/useEditorSettings";
import { useEditorContent } from "./hooks/useEditorContent";
import { useMediaViewer } from "./hooks/useMediaViewer";
import EditorTabs from "./EditorTabs";
import EditorSettings from "./EditorSettings";
import MediaViewer from "./MediaViewer";
import UnsavedChangesModal from "./UnsavedChangesModal";
import FileExplorer from "../FileExplorer/FileExplorer";
import { useE2B } from "./hooks/useE2B";
import {
  setLocalStorage,
  getLocalStorage,
} from "../../../../../../utils/localStorage";
import { setSessionStorage } from "../../../../../../utils/sessionStorage";
import { emitter, MAGIC_EVENTS } from "../../../../../../lib/events";

interface CodeEditorProps {
  file: CodeFile;
  onClose: () => void;
  onBack?: () => void;
  onFileOpen?: (file: CodeFile) => void;
}

export default function CodeEditor({
  file,
  onBack,
  onFileOpen,
  onClose,
}: CodeEditorProps) {
  // Thêm state cho File Explorer
  const [showFileExplorer, setShowFileExplorer] = useState(false);

  // Sử dụng các custom hooks
  const {
    settings,
    showSettings,
    setShowSettings,
    updateSettings,
    settingsRef,
    settingButtonRef,
  } = useEditorSettings();

  const {
    content,
    hasUnsavedChanges,
    showUnsavedModal,
    setShowUnsavedModal,
    handleSave,
    handleEditorChange,
    openedFiles,
    activeFileId,
    closeFile,
    setActiveFileId,
    updateOpenedFile,
    removeOpenedFile,
  } = useEditorContent(file);

  const {
    showMediaViewer,
    mediaFile,
    mediaFileUrl,
    isMediaLoading,
    mediaError,
    openMediaViewer,
    closeMediaViewer,
    handleDownloadMedia,
  } = useMediaViewer();

  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);

  // Sử dụng hook E2B
  const {
    runCode,
    isRunning,
    output,
    error,
    clearOutput,
    showOutput,
    setShowOutput,
    isTerminalMode,
    runCommand,
    setIsTerminalMode,
  } = useE2B();

  // Cập nhật useEffect để sử dụng sessionStorage và events
  useEffect(() => {
    // Đặt trạng thái UI thành code_view sau khi component mount
    setSessionStorage("ui_state_magic", "code_view");

    // Lắng nghe event để quay về code_manager
    const handleBackToManager = () => {
      onBack?.();
    };

    emitter.on(MAGIC_EVENTS.CLOSE_CODE_FILE, handleBackToManager);

    return () => {
      emitter.off(MAGIC_EVENTS.CLOSE_CODE_FILE, handleBackToManager);
    };
  }, [onBack]);

  // Thêm hàm để chạy mã
  const handleRunCode = async (language: string) => {
    clearOutput();
    setShowOutput(true);

    await runCode(content, language);
  };

  // Xử lý khi component unmount
  useEffect(() => {
    return () => {
      // Cleanup nếu cần
    };
  }, []);

  // Xử lý khi file thay đổi
  useEffect(() => {
    if (isMediaFile(file.name)) {
      openMediaViewer(file);
    }
  }, [file]);

  // Xử lý khi editor được mount
  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Thiết lập các tùy chọn editor
    editor.updateOptions({
      fontSize: settings.fontSize,
      minimap: {
        enabled: settings.minimap,
      },
      wordWrap: settings.wordWrap,
      tabSize: settings.tabSize,
    });
  };

  // Xử lý khi tab được click
  const handleTabClick = (fileId: string) => {
    if (hasUnsavedChanges && activeFileId !== fileId) {
      setShowUnsavedModal(true);
      return;
    }
    setActiveFileId(fileId);
  };

  // Xử lý khi tab được đóng
  const handleTabClose = (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (hasUnsavedChanges && activeFileId === fileId) {
      setShowUnsavedModal(true);
      // Lưu fileId để đóng sau khi xử lý
      localStorage.setItem("pendingFileToClose", fileId);
      return;
    }

    closeFile(fileId);

    // Nếu đóng tab cuối cùng, quay lại màn hình trước
    if (openedFiles.length === 1 && onBack) {
      onBack();
    }
  };

  // Xử lý khi người dùng nhấn nút back
  const handleBack = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedModal(true);
    } else {
      setSessionStorage("ui_state_magic", "code_manager");
      onBack?.();
    }
  };

  // Xử lý khi người dùng chọn lưu trong modal
  const handleSaveInModal = async () => {
    await handleSave();
    setShowUnsavedModal(false);
    setSessionStorage("ui_state_magic", "code_manager");
    onBack?.();
  };

  // Xử lý khi người dùng chọn bỏ thay đổi trong modal
  const handleDiscardInModal = () => {
    setShowUnsavedModal(false);
    setSessionStorage("ui_state_magic", "code_manager");
    onBack?.();
  };

  // Xử lý khi người dùng chọn hủy trong modal
  const handleCancelInModal = () => {
    setShowUnsavedModal(false);
  };

  // Thêm hàm xử lý chọn file
  const handleFileSelect = (selectedFile: CodeFile) => {
    if (hasUnsavedChanges) {
      setShowUnsavedModal(true);
      // Lưu file được chọn vào localStorage để mở sau khi xử lý
      localStorage.setItem("pendingFileToOpen", JSON.stringify(selectedFile));
    } else if (onFileOpen) {
      if (isMediaFile(selectedFile.name)) {
        openMediaViewer(selectedFile);
      } else {
        onFileOpen(selectedFile);
      }
    }
  };

  // Thêm hàm kiểm tra ngôn ngữ được hỗ trợ
  const SUPPORTED_EXTENSIONS: Record<string, string> = {
    html: "html",
    py: "python",
    js: "js",
    r: "r",
    java: "java",
    sh: "bash",
  };

  const getLanguageFromFile = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    return ext ? SUPPORTED_EXTENSIONS[ext] : null;
  };

  // Thêm hàm để lấy file đang active
  const getActiveFile = () => {
    if (!activeFileId) return file;
    const activeFile = openedFiles.find((f) => f.id === activeFileId);
    return activeFile || file;
  };

  // Lấy file đang active
  const activeFile = getActiveFile();

  // Thêm useEffect để lưu thông tin file đang mở vào localStorage
  useEffect(() => {
    if (activeFile) {
      // Lưu thông tin file đang mở vào localStorage
      setLocalStorage("current_open_file", activeFile.name);

      // Phát event để thông báo file đã thay đổi
      const event = new CustomEvent("file_changed", {
        detail: { fileName: activeFile.name, fileId: activeFile.id },
      });
      window.dispatchEvent(event);
    }

    // Cleanup khi component unmount
    return () => {
      setLocalStorage("current_open_file", "");
    };
  }, [activeFile]);

  // Thay thế các tham chiếu đến file bằng activeFile
  const language = getLanguageFromFile(activeFile.name);
  const canRun = !!language;

  // Thêm hàm xử lý cập nhật file
  const handleFileUpdate = (updatedFile: CodeFile) => {
    updateOpenedFile(updatedFile);
  };

  // Thêm hàm xử lý xóa file
  const handleFileDelete = (fileId: string) => {
    removeOpenedFile(fileId);
    // Nếu không còn file nào mở, quay lại màn hình trước
    if (openedFiles.length <= 1 && onBack) {
      onBack();
    }
  };

  // Hiển thị media viewer nếu đang xem file media
  if (showMediaViewer && mediaFile) {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors cursor-pointer"
            >
              <IconArrowLeft size={20} />
            </button>
            {/* Nút File Explorer */}
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
            <h2 className="text-lg font-semibold">Media Viewer</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadMedia}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors cursor-pointer"
              title="Tải xuống"
            >
              <IconDownload size={20} />
            </button>
            <button
              onClick={closeMediaViewer}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors cursor-pointer"
              title="Đóng"
            >
              <IconX size={20} />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex h-[calc(100%-64px)]">
          {/* File Explorer */}
          {showFileExplorer && (
            <div className="w-64 flex-shrink-0 border-r border-gray-200 dark:border-gray-700">
              <FileExplorer
                onFileSelect={handleFileSelect}
                activeFileId={activeFileId || undefined}
                onFileUpdate={handleFileUpdate}
                onFileDelete={handleFileDelete}
              />
            </div>
          )}

          {/* Media Viewer Content */}
          <div className="flex-1">
            <MediaViewer
              mediaFile={mediaFile}
              mediaFileUrl={mediaFileUrl}
              isMediaLoading={isMediaLoading}
              mediaError={mediaError}
              onClose={closeMediaViewer}
              onDownload={handleDownloadMedia}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors cursor-pointer"
          >
            <IconArrowLeft size={20} />
          </button>
          {/* Nút File Explorer */}
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
          <h2 className="text-lg font-semibold">Code Editor</h2>
        </div>
        <div className="flex items-center gap-2">
          {/* Nút Run Code */}
          {canRun && (
            <button
              onClick={() => handleRunCode(language)}
              className={`p-2 rounded transition-colors cursor-pointer ${
                isRunning
                  ? "bg-gray-200 dark:bg-gray-700"
                  : "bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800"
              }`}
              disabled={isRunning}
              title={`Chạy mã ${language.toUpperCase()}`}
            >
              <IconPlayerPlay
                size={20}
                className={
                  isRunning
                    ? "animate-pulse"
                    : "text-green-600 dark:text-green-400"
                }
              />
            </button>
          )}
          <button
            onClick={() => handleSave()}
            className={`p-2 rounded transition-colors cursor-pointer ${
              hasUnsavedChanges
                ? "bg-yellow-100 dark:bg-yellow-900 hover:bg-yellow-200 dark:hover:bg-yellow-800"
                : "hover:bg-gray-100 dark:hover:bg-gray-900"
            }`}
            disabled={!hasUnsavedChanges}
            title="Lưu"
          >
            <IconDeviceFloppy
              size={20}
              className={
                hasUnsavedChanges ? "text-yellow-600 dark:text-yellow-400" : ""
              }
            />
          </button>
          <EditorSettings settings={settings} updateSettings={updateSettings} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100%-64px)]">
        {/* File Explorer */}
        {showFileExplorer && (
          <div className="w-64 flex-shrink-0 border-r border-gray-200 dark:border-gray-700">
            <FileExplorer
              onFileSelect={handleFileSelect}
              activeFileId={activeFileId || undefined}
              onFileUpdate={handleFileUpdate}
              onFileDelete={handleFileDelete}
            />
          </div>
        )}

        {/* Editor Content */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Tabs */}
          <EditorTabs
            openedFiles={openedFiles}
            activeFileId={activeFileId}
            onTabClick={handleTabClick}
            onTabClose={handleTabClose}
            activeFile={activeFile}
          />

          {/* Editor và Output */}
          <div className="relative flex-1 overflow-hidden">
            <div
              className={`absolute inset-0 ${showOutput ? "h-2/3" : "h-full"}`}
            >
              <Editor
                height="100%"
                language={getLanguageFromFileName(activeFile.name)}
                value={content}
                theme={settings.theme}
                onChange={(value) => handleEditorChange(value, settings)}
                onMount={handleEditorDidMount}
                options={{
                  fontSize: settings.fontSize,
                  minimap: {
                    enabled: settings.minimap,
                  },
                  wordWrap: settings.wordWrap,
                  tabSize: settings.tabSize,
                  automaticLayout: true,
                }}
              />
            </div>

            {/* Output Panel - Terminal Style */}
            {showOutput && (
              <div className="absolute bottom-0 left-0 right-0 h-1/3 border-t border-gray-700 flex flex-col bg-black z-10 font-mono">
                <div className="flex justify-between items-center p-2 bg-gray-900 border-b border-gray-700 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <IconTerminal2 size={16} className="text-gray-400" />
                    <h3 className="text-sm text-gray-300">Terminal</h3>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsTerminalMode(!isTerminalMode)}
                      className="text-xs px-2 py-1 rounded text-gray-300 hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      {isTerminalMode ? "Code Mode" : "Terminal Mode"}
                    </button>
                    <button
                      onClick={clearOutput}
                      className="text-xs px-2 py-1 rounded text-gray-300 hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      Xóa
                    </button>
                    <button
                      onClick={() => setShowOutput(false)}
                      className="text-xs px-2 py-1 rounded text-gray-300 hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      Ẩn
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-auto p-3 text-sm bg-black text-gray-100">
                  {isRunning ? (
                    <div className="flex items-center gap-2 text-gray-400">
                      <div className="animate-spin h-4 w-4 border-2 border-gray-500 border-t-gray-300 rounded-full"></div>
                      Đang thực thi...
                    </div>
                  ) : error ? (
                    <div className="text-red-400">
                      <span className="text-red-500">Lỗi: </span>
                      <span className="whitespace-pre-wrap">{error}</span>
                    </div>
                  ) : output ? (
                    <div className="whitespace-pre-wrap font-mono">
                      <span className="text-green-400">$ </span>
                      <span className="text-gray-300">{output}</span>
                    </div>
                  ) : (
                    <div className="text-gray-500">Sẵn sàng</div>
                  )}
                  {isTerminalMode && (
                    <div className="mt-2 flex items-center">
                      <span className="text-green-400">$ </span>
                      <input
                        type="text"
                        className="flex-1 ml-2 bg-transparent border-none outline-none text-gray-300"
                        placeholder="Nhập lệnh..."
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const command = e.currentTarget.value;
                            if (command) {
                              runCommand(command);
                              e.currentTarget.value = "";
                            }
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Unsaved Changes Modal */}
      {showUnsavedModal && (
        <UnsavedChangesModal
          isOpen={showUnsavedModal}
          onSave={handleSaveInModal}
          onDiscard={handleDiscardInModal}
          onCancel={handleCancelInModal}
        />
      )}
    </div>
  );
}
