import React, { useState, useEffect } from "react";
import {
  IconX,
  IconCode,
  IconArrowLeft,
  IconEdit,
  IconTrash,
  IconFolder,
} from "@tabler/icons-react";
import { nanoid } from "nanoid";
import { chatDB } from "../../../../utils/db";
import type { CodeFile } from "../../../../types";
import { FileModal } from "./Modals/FileModal";
import CodeEditor from "./CodeEditor";

interface CodeAssistantProps {
  onClose: () => void;
}

export default function CodeAssistant({ onClose }: CodeAssistantProps) {
  const [files, setFiles] = useState<CodeFile[]>([]);
  const [isNewFileModalOpen, setIsNewFileModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newFileName, setNewFileName] = useState("Untitled.js");
  const [selectedFile, setSelectedFile] = useState<CodeFile | null>(null);
  const [activeFile, setActiveFile] = useState<CodeFile | null>(null);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    const allFiles = await chatDB.getAllCodeFiles();
    // Sắp xếp files theo thời gian cập nhật mới nhất
    const sortedFiles = allFiles.sort((a, b) => {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
    setFiles(sortedFiles);
  };

  const createNewFile = async () => {
    if (!newFileName.trim()) return;

    const newFile: CodeFile = {
      id: nanoid(),
      name: newFileName,
      content: "",
      createdAt: new Date(),
      updatedAt: new Date(),
      language: newFileName.split(".").pop() || "javascript",
    };

    await chatDB.saveCodeFile(newFile);
    await loadFiles();
    setIsNewFileModalOpen(false);
    setNewFileName("Untitled.js");
  };

  const handleEditFile = async () => {
    if (!selectedFile || !newFileName.trim()) return;

    const updatedFile: CodeFile = {
      ...selectedFile,
      name: newFileName,
      updatedAt: new Date(),
      language: newFileName.split(".").pop() || "javascript",
    };

    await chatDB.saveCodeFile(updatedFile);
    await loadFiles();
    setIsEditModalOpen(false);
    setNewFileName("Untitled.js");
    setSelectedFile(null);
  };

  const handleDeleteFile = async () => {
    if (!selectedFile) return;

    await chatDB.deleteCodeFile(selectedFile.id);
    await loadFiles();
    setIsDeleteModalOpen(false);
    setSelectedFile(null);
  };

  const openEditModal = (file: CodeFile) => {
    setSelectedFile(file);
    setNewFileName(file.name);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (file: CodeFile) => {
    setSelectedFile(file);
    setIsDeleteModalOpen(true);
  };

  const handleFileOpen = (file: CodeFile) => {
    setActiveFile(file);
  };

  const handleEditorBack = async () => {
    await loadFiles();
    setActiveFile(null);
  };

  return (
    <div className="flex flex-col h-full">
      {activeFile ? (
        <CodeEditor
          file={activeFile}
          onClose={onClose}
          onBack={handleEditorBack}
        />
      ) : (
        <>
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors cursor-pointer"
                >
                  <IconArrowLeft size={24} />
                </button>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-transparent bg-clip-text">
                  Quản Lý Mã Nguồn
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors cursor-pointer"
              >
                <IconX size={24} />
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Tệp của tôi</h2>
              <button
                onClick={() => setIsNewFileModalOpen(true)}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors cursor-pointer"
              >
                Tạo tệp mới
              </button>
            </div>

            <div className="space-y-2">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 group cursor-pointer"
                  onClick={() => handleFileOpen(file)}
                >
                  <div className="flex-1 flex items-center gap-3">
                    <IconCode size={20} className="text-purple-500" />
                    <span className="flex-1">{file.name}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(file.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(file)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded cursor-pointer"
                      title="Chỉnh sửa"
                    >
                      <IconEdit size={18} />
                    </button>
                    <button
                      onClick={() => openDeleteModal(file)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-red-500 cursor-pointer"
                      title="Xóa"
                    >
                      <IconTrash size={18} />
                    </button>
                  </div>
                </div>
              ))}

              {files.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <IconFolder size={48} className="mx-auto mb-2 opacity-50" />
                  <p>Chưa có tệp nào. Hãy tạo tệp mới!</p>
                </div>
              )}
            </div>
          </div>

          {/* Unified Modal */}
          <FileModal
            type={
              isNewFileModalOpen ? "new" : isEditModalOpen ? "edit" : "delete"
            }
            isOpen={isNewFileModalOpen || isEditModalOpen || isDeleteModalOpen}
            onClose={() => {
              setIsNewFileModalOpen(false);
              setIsEditModalOpen(false);
              setIsDeleteModalOpen(false);
              setNewFileName("Untitled.js");
              setSelectedFile(null);
            }}
            fileName={newFileName}
            onFileNameChange={setNewFileName}
            onSubmit={() => {
              if (isNewFileModalOpen) {
                createNewFile();
              } else if (isEditModalOpen) {
                handleEditFile();
              } else if (isDeleteModalOpen) {
                handleDeleteFile();
              }
            }}
            selectedFile={selectedFile || undefined}
          />
        </>
      )}
    </div>
  );
}
