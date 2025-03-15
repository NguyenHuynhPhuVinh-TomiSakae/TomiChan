import React, { useState, useEffect, useRef } from "react";
import {
  IconArrowLeft,
  IconX,
  IconDeviceFloppy,
  IconSettings,
} from "@tabler/icons-react";
import type { CodeFile } from "../../../../../types";
import { chatDB } from "../../../../../utils/db";
import { toast } from "sonner";
import Editor from "@monaco-editor/react";

interface EditorSettings {
  fontSize: number;
  minimap: boolean;
  wordWrap: "on" | "off";
  theme: "vs-dark" | "light";
  tabSize: number;
}

interface CodeEditorProps {
  file: CodeFile;
  onClose: () => void;
  onBack: () => void;
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

export default function CodeEditor({ file, onClose, onBack }: CodeEditorProps) {
  const [content, setContent] = useState(file.content);
  const [isSaving, setIsSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<EditorSettings>({
    fontSize: 14,
    minimap: true,
    wordWrap: "on",
    theme: "vs-dark",
    tabSize: 2,
  });
  const language = getLanguageFromFileName(file.name);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setContent(file.content);
  }, [file]);

  // Thêm useEffect để xử lý click outside
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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedFile: CodeFile = {
        ...file,
        content: content,
        updatedAt: new Date(),
      };
      await chatDB.saveCodeFile(updatedFile);
      toast.success("Đã lưu file thành công!");
      if (onBack) {
        onBack();
      }
    } catch (error) {
      console.error("Lỗi khi lưu file:", error);
      toast.error("Lỗi khi lưu file!");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setContent(value);
    }
  };

  const updateSettings = (newSettings: Partial<EditorSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...newSettings,
    }));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors cursor-pointer"
            >
              <IconArrowLeft size={24} />
            </button>
            <h2 className="text-2xl font-bold">{file.name}</h2>
          </div>
          <div className="flex items-center gap-2">
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
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <IconDeviceFloppy size={20} />
              {isSaving ? "Đang lưu..." : "Lưu"}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors cursor-pointer"
            >
              <IconX size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1">
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
  );
}
