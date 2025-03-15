/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { HTMLAttributes } from "react";
import {
  IconX,
  IconCode,
  IconArrowLeft,
  IconEdit,
  IconTrash,
  IconFolder,
  IconFolderPlus,
  IconFilePlus,
  IconLayoutGrid,
  IconLayoutList,
  IconUpload,
  IconFolderUp,
} from "@tabler/icons-react";
import { FileModal } from "./Modals/FileModal";
import CodeEditor from "./CodeEditor";
import { useCodeAssistant } from "../../../../hooks/useCodeAssistant";
import { CodeFile } from "@/types";
import MediaViewer from "./MediaViewer";

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
              <IconCode size={20} className="mr-2 text-purple-500" />
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();

    if (isMediaFile(file.name)) {
      // Đọc file dưới dạng base64 cho các file đa phương tiện
      reader.readAsDataURL(file);
    } else {
      // Đọc file dưới dạng text cho các file code
      reader.readAsText(file);
    }

    reader.onload = (e) => {
      if (e.target?.result) {
        const content = e.target.result.toString();
        const newFile: Partial<CodeFile> = {
          name: file.name,
          content: content,
          folderId: currentFolder || undefined,
          updatedAt: new Date(),
        };
        createNewFile(newFile);
      }
    };

    // Reset input value để có thể tải lại cùng một file
    event.target.value = "";
  };

  const handleFolderUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Tạo map để lưu trữ đường dẫn thư mục và ID tương ứng
    const folderPathMap = new Map<string, string>();

    // Thêm thư mục gốc hiện tại vào map
    if (currentFolder) {
      folderPathMap.set("", currentFolder);
    } else {
      folderPathMap.set("", "root");
    }

    // Xử lý từng file trong thư mục được tải lên
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const relativePath = file.webkitRelativePath;
      const pathParts = relativePath.split("/");
      const fileName = pathParts.pop() || "";
      const folderPath = pathParts.join("/");

      // Tạo các thư mục cần thiết
      let parentId = currentFolder;
      let currentPath = "";

      for (let j = 0; j < pathParts.length; j++) {
        const folderName = pathParts[j];
        const previousPath = currentPath;
        currentPath = currentPath ? `${currentPath}/${folderName}` : folderName;

        // Kiểm tra xem thư mục đã được tạo chưa
        if (!folderPathMap.has(currentPath)) {
          // Lấy ID thư mục cha
          parentId =
            folderPathMap.get(previousPath) === "root"
              ? null
              : folderPathMap.get(previousPath) || null;

          // Tạo thư mục mới
          const newFolder = await createNewFolder({
            name: folderName,
            parentId: parentId || undefined,
          });

          // Lưu ID thư mục mới vào map
          folderPathMap.set(currentPath, newFolder?.id || "");
          parentId = newFolder?.id || null;
        } else {
          parentId =
            folderPathMap.get(currentPath) === "root"
              ? null
              : folderPathMap.get(currentPath) || null;
        }
      }

      // Đọc và lưu file
      const reader = new FileReader();

      if (isMediaFile(fileName)) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }

      reader.onload = async (e) => {
        if (e.target?.result) {
          const content = e.target.result.toString();
          const folderId =
            folderPathMap.get(folderPath) === "root"
              ? null
              : folderPathMap.get(folderPath);

          const newFile: Partial<CodeFile> = {
            name: fileName,
            content: content,
            folderId: folderId || undefined,
            updatedAt: new Date(),
          };

          await createNewFile(newFile);
        }
      };
    }

    // Reset input value
    event.target.value = "";
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
                <label className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer">
                  <IconUpload className="inline-block mr-2" />
                  Tải file lên
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept=".txt,.js,.jsx,.ts,.tsx,.html,.css,.json,.md,.py,.java,.cpp,.c,.cs,.php,.rb,.rs,.sql,.swift,.go,.yml,.yaml,.jpg,.jpeg,.png,.gif,.webp,.svg,.mp3,.wav,.ogg,.aac,.mp4,.webm,.ogv,.mov,.pdf"
                  />
                </label>
                <label className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors cursor-pointer">
                  <IconFolderUp className="inline-block mr-2" />
                  Tải thư mục lên
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFolderUpload}
                    webkitdirectory=""
                    directory=""
                    multiple
                  />
                </label>
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
          <div className="flex-1 overflow-y-auto p-4">
            <div
              className={`${
                isGridView
                  ? "grid grid-cols-2 md:grid-cols-3 gap-4"
                  : "space-y-2"
              }`}
            >
              {renderFolderContents(currentFolder)}
            </div>
          </div>

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
