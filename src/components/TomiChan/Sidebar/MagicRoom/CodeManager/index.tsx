/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { HTMLAttributes } from "react";
import {
  IconX,
  IconArrowLeft,
  IconEdit,
  IconTrash,
  IconFolder,
  IconFolderPlus,
  IconFilePlus,
  IconLayoutGrid,
  IconLayoutList,
} from "@tabler/icons-react";
import { FileModal } from "./Modals/FileModal";
import CodeEditor from "./CodeEditor";
import { useCodeAssistant } from "../../../../../hooks/useCodeAssistant";
import MediaViewer from "./MediaViewer";
import FileUploadZone from "./FileUploadZone";
import FileIcon from "./FileIcon";

declare module "react" {
  interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    directory?: string;
    webkitdirectory?: string;
  }
}

interface CodeAssistantProps {
  onClose: () => void;
}

export default function CodeAssistant({ onClose }: CodeAssistantProps) {
  const [isGridView, setIsGridView] = React.useState(false);

  const {
    files,
    folders,
    isNewFileModalOpen,
    isEditModalOpen,
    isDeleteModalOpen,
    isNewFolderModalOpen,
    setIsNewFolderModalOpen,
    newFileName,
    selectedFile,
    activeFile,
    selectedFolder,
    selectedParentFolder,
    currentFolder,
    setIsNewFileModalOpen,
    setIsEditModalOpen,
    setIsDeleteModalOpen,
    setNewFileName,
    setSelectedFile,
    setSelectedFolder,
    setSelectedParentFolder,
    createNewFile,
    createNewFolder,
    handleEditFile,
    handleDeleteFile,
    handleEditFolder,
    handleDeleteFolder,
    handleFileOpen,
    handleEditorBack,
    handleFolderClick,
    handlePathClick,
    openEditFolderModal,
    openDeleteFolderModal,
    getCurrentPath,
  } = useCodeAssistant();

  const renderFolderContents = (folderId: string | null) => {
    const foldersInCurrent = folders.filter((folder) => {
      if (folderId === null) {
        return folder.parentId === undefined || folder.parentId === null;
      }
      return folder.parentId === folderId;
    });

    const filesInCurrent = files.filter((file) => {
      if (folderId === null) {
        return file.folderId === undefined || file.folderId === null;
      }
      return file.folderId === folderId;
    });

    return (
      <>
        {foldersInCurrent.map((folder) => (
          <div
            key={folder.id}
            className={`${
              isGridView
                ? "p-4 border rounded-lg border-gray-200 dark:border-gray-800"
                : "p-2"
            } hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer group`}
            onClick={() => handleFolderClick(folder.id)}
          >
            <div className="flex items-center flex-1">
              <IconFolder size={20} className="mr-2 text-yellow-500" />
              <span className="flex-1 truncate">{folder.name}</span>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100">
                <button
                  onClick={(e) => openEditFolderModal(folder, e)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded cursor-pointer"
                  title="Đổi tên"
                >
                  <IconEdit size={18} />
                </button>
                <button
                  onClick={(e) => openDeleteFolderModal(folder, e)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-red-500 cursor-pointer"
                  title="Xóa"
                >
                  <IconTrash size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filesInCurrent.map((file) => (
          <div
            key={file.id}
            className={`${
              isGridView
                ? "p-4 border rounded-lg border-gray-200 dark:border-gray-800"
                : "p-3 flex items-center"
            } hover:bg-gray-50 dark:hover:bg-gray-900 group cursor-pointer`}
            onClick={() => handleFileOpen(file)}
          >
            <div className={`${isGridView ? "" : "flex-1"} flex items-center`}>
              <FileIcon fileName={file.name} />
              <span className="flex-1 truncate">{file.name}</span>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(file);
                    setNewFileName(file.name);
                    setIsEditModalOpen(true);
                  }}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded cursor-pointer"
                  title="Chỉnh sửa"
                >
                  <IconEdit size={18} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(file);
                    setIsDeleteModalOpen(true);
                  }}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-red-500 cursor-pointer"
                  title="Xóa"
                >
                  <IconTrash size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </>
    );
  };

  const isMediaFile = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    return [
      "jpg",
      "jpeg",
      "png",
      "gif",
      "webp",
      "svg",
      "mp3",
      "wav",
      "ogg",
      "aac",
      "mp4",
      "webm",
      "ogv",
      "mov",
      "pdf",
    ].includes(extension || "");
  };

  return (
    <div className="flex flex-col h-full">
      {activeFile ? (
        isMediaFile(activeFile.name) ? (
          <MediaViewer
            file={activeFile}
            onClose={onClose}
            onBack={handleEditorBack}
          />
        ) : (
          <CodeEditor
            file={activeFile}
            onClose={onClose}
            onBack={handleEditorBack}
            onFileOpen={handleFileOpen}
          />
        )
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

          {/* Action buttons */}
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-800">
            <div className="flex justify-between items-center">
              <button
                onClick={() => setIsGridView(!isGridView)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded transition-colors"
                title={isGridView ? "Chế độ danh sách" : "Chế độ lưới"}
              >
                {isGridView ? (
                  <IconLayoutList size={20} />
                ) : (
                  <IconLayoutGrid size={20} />
                )}
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedParentFolder(currentFolder);
                    setIsNewFolderModalOpen(true);
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors cursor-pointer"
                >
                  <IconFolderPlus className="inline-block mr-2" />
                  Tạo thư mục
                </button>
                <FileUploadZone
                  currentFolder={currentFolder}
                  createNewFile={createNewFile}
                  createNewFolder={createNewFolder}
                  isMediaFile={isMediaFile}
                />
                <button
                  onClick={() => {
                    setSelectedParentFolder(currentFolder);
                    setIsNewFileModalOpen(true);
                  }}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors cursor-pointer"
                >
                  <IconFilePlus className="inline-block mr-2" />
                  Tạo tệp mới
                </button>
              </div>
            </div>
          </div>

          {/* Navigation path */}
          <div className="flex items-center p-4 gap-2 text-sm text-gray-500 border-b border-gray-200 dark:border-gray-800">
            <button
              onClick={() => handlePathClick(null)}
              className="hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer"
            >
              Thư mục gốc
            </button>
            {currentFolder && folders.find((f) => f.id === currentFolder) && (
              <>
                {getCurrentPath()
                  .split(" / ")
                  .map((name, index, array) => {
                    const folder = folders.find((f) => f.name === name);
                    return (
                      <React.Fragment key={folder?.id || index}>
                        <span className="text-gray-400">\</span>
                        <button
                          onClick={() => handlePathClick(folder?.id || null)}
                          className="hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer"
                        >
                          {name}
                        </button>
                      </React.Fragment>
                    );
                  })}
              </>
            )}
          </div>

          {/* Main Content */}
          <FileUploadZone
            currentFolder={currentFolder}
            createNewFile={createNewFile}
            createNewFolder={createNewFolder}
            isMediaFile={isMediaFile}
            className="flex-1 overflow-y-auto p-4 relative"
          >
            <div
              className={`${
                isGridView
                  ? "grid grid-cols-2 md:grid-cols-3 gap-4"
                  : "space-y-2"
              }`}
            >
              {renderFolderContents(currentFolder)}
            </div>
          </FileUploadZone>

          {/* Modal */}
          <FileModal
            type={
              isNewFolderModalOpen
                ? "newFolder"
                : isNewFileModalOpen
                ? "new"
                : isEditModalOpen
                ? "edit"
                : "delete"
            }
            isOpen={
              isNewFileModalOpen ||
              isEditModalOpen ||
              isDeleteModalOpen ||
              isNewFolderModalOpen
            }
            onClose={() => {
              setIsNewFileModalOpen(false);
              setIsEditModalOpen(false);
              setIsDeleteModalOpen(false);
              setIsNewFolderModalOpen(false);
              setNewFileName("");
              setSelectedFile(null);
              setSelectedFolder(null);
            }}
            fileName={newFileName}
            onFileNameChange={setNewFileName}
            onSubmit={() => {
              if (isNewFileModalOpen) {
                createNewFile();
              } else if (isNewFolderModalOpen) {
                createNewFolder();
              } else if (isEditModalOpen) {
                if (selectedFolder) {
                  handleEditFolder();
                } else {
                  handleEditFile();
                }
              } else if (isDeleteModalOpen) {
                if (selectedFolder) {
                  handleDeleteFolder();
                } else {
                  handleDeleteFile();
                }
              }
            }}
            selectedFile={selectedFile || undefined}
            selectedFolder={selectedFolder}
            folders={folders}
            selectedParentFolder={selectedParentFolder}
            onParentFolderChange={setSelectedParentFolder}
          />
        </>
      )}
    </div>
  );
}
