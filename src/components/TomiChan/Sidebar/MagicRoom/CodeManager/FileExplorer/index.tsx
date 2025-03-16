import React, { useState, useEffect } from "react";
import { IconFolderPlus, IconFilePlus, IconDots } from "@tabler/icons-react";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { chatDB } from "../../../../../../utils/db";
import type { CodeFile, CodeFolder } from "../../../../../../types";
import FolderNode from "./FolderNode";
import FileItem from "./FileItem";
import NewItemInput from "./NewItemInput";
import { toast } from "sonner";

interface FileExplorerProps {
  onFileSelect: (file: CodeFile) => void;
  activeFileId?: string;
  className?: string;
}

export default function FileExplorer({
  onFileSelect,
  activeFileId,
  className = "",
}: FileExplorerProps) {
  const [folders, setFolders] = useState<CodeFolder[]>([]);
  const [files, setFiles] = useState<CodeFile[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );
  const [creatingFolderId, setCreatingFolderId] = useState<string | null>(null);
  const [creatingFileId, setCreatingFileId] = useState<string | null>(null);
  const [creatingRootFolder, setCreatingRootFolder] = useState(false);
  const [creatingRootFile, setCreatingRootFile] = useState(false);

  const loadData = async () => {
    const allFolders = await chatDB.getAllFolders();
    const allFiles = await chatDB.getAllCodeFiles();

    // Sắp xếp thư mục và file theo bảng chữ cái
    const sortedFolders = allFolders.sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    const sortedFiles = allFiles.sort((a, b) => a.name.localeCompare(b.name));

    setFolders(sortedFolders);
    setFiles(sortedFiles);

    // Mặc định mở thư mục gốc
    const rootFolders = sortedFolders.filter((f) => !f.parentId);
    setExpandedFolders(new Set(rootFolders.map((f) => f.id)));
  };

  useEffect(() => {
    loadData();

    // Lắng nghe sự kiện reload
    const handleReload = () => {
      loadData();
    };
    window.addEventListener("fileExplorer:reload", handleReload);

    return () => {
      window.removeEventListener("fileExplorer:reload", handleReload);
    };
  }, []);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const handleCreateFolder = (parentId: string | null) => {
    // Nếu parentId là null, hủy việc tạo
    if (parentId === null) {
      setCreatingFolderId(null);
      setCreatingRootFolder(false);
      return;
    }

    // Reset các trạng thái tạo khác
    setCreatingFileId(null);
    setCreatingRootFile(false);

    // Mở thư mục cha nếu đang tạo thư mục con
    if (parentId !== "") {
      setExpandedFolders((prev) => {
        const newSet = new Set(prev);
        newSet.add(parentId);
        return newSet;
      });

      // Đặt ID thư mục đang tạo
      setCreatingFolderId(parentId);
      setCreatingRootFolder(false);
    } else {
      // Tạo thư mục gốc
      setCreatingFolderId(null);
      setCreatingRootFolder(true);
    }
  };

  const handleCancelCreateFolder = () => {
    setCreatingFolderId(null);
    setCreatingRootFolder(false);
  };

  const handleCreateFile = (folderId: string | null) => {
    // Nếu folderId là null, hủy việc tạo
    if (folderId === null) {
      setCreatingFileId(null);
      setCreatingRootFile(false);
      return;
    }

    // Reset các trạng thái tạo khác
    setCreatingFolderId(null);
    setCreatingRootFolder(false);

    // Mở thư mục cha nếu đang tạo file trong thư mục
    if (folderId !== "") {
      setExpandedFolders((prev) => {
        const newSet = new Set(prev);
        newSet.add(folderId);
        return newSet;
      });

      // Đặt ID thư mục chứa file đang tạo
      setCreatingFileId(folderId);
      setCreatingRootFile(false);
    } else {
      // Tạo file gốc
      setCreatingFileId(null);
      setCreatingRootFile(true);
    }
  };

  const handleCancelCreateFile = () => {
    setCreatingFileId(null);
    setCreatingRootFile(false);
  };

  const handleEditFolder = (folder: CodeFolder) => {
    chatDB
      .saveFolder({
        ...folder,
        updatedAt: new Date(),
      })
      .then(() => {
        loadData();
        toast.success("Đã đổi tên thư mục thành công!");
      })
      .catch((error) => {
        console.error("Lỗi khi lưu thư mục:", error);
        toast.error("Có lỗi khi đổi tên thư mục!");
      });
  };

  const handleDeleteFolder = (folder: CodeFolder) => {
    chatDB.deleteFolder(folder.id).then(() => {
      loadData();
      toast.success("Đã xóa thư mục thành công!");
    });
  };

  const handleEditFile = (file: CodeFile) => {
    // Sử dụng trực tiếp file được truyền vào thay vì tham chiếu đến biến bên ngoài
    const updatedFile = {
      ...file,
      language: file.name.split(".").pop() || "javascript",
      updatedAt: new Date(),
    };

    chatDB
      .saveCodeFile(updatedFile)
      .then(() => {
        loadData();
        toast.success("Đã đổi tên file thành công!");
      })
      .catch((error) => {
        console.error("Lỗi khi lưu file:", error);
        toast.error("Có lỗi khi đổi tên file!");
      });
  };

  const handleDeleteFile = (file: CodeFile) => {
    chatDB.deleteCodeFile(file.id).then(() => {
      loadData();
      toast.success("Đã xóa file thành công!");
    });
  };

  // Lấy thư mục gốc (không có parentId)
  const rootFolders = folders.filter((folder) => !folder.parentId);

  // Lấy file không thuộc thư mục nào
  const rootFiles = files.filter((file) => !file.folderId);

  return (
    <div
      className={`h-full min-w-[250px] bg-white dark:bg-gray-900 ${className}`}
    >
      <div className="p-2">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-gray-700 dark:text-gray-300">
            EXPLORER
          </h3>
          <Menu as="div" className="relative inline-block text-left">
            <div>
              <Menu.Button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                <IconDots size={16} />
              </Menu.Button>
            </div>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => handleCreateFolder("")}
                        className={`${
                          active ? "bg-gray-100 dark:bg-gray-700" : ""
                        } flex w-full items-center px-4 py-2 text-sm`}
                      >
                        <IconFolderPlus size={16} className="mr-2" />
                        Tạo thư mục mới
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => handleCreateFile("")}
                        className={`${
                          active ? "bg-gray-100 dark:bg-gray-700" : ""
                        } flex w-full items-center px-4 py-2 text-sm`}
                      >
                        <IconFilePlus size={16} className="mr-2" />
                        Tạo file mới
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>

        <div className="overflow-y-auto max-h-[calc(100vh-100px)]">
          <div className="pb-32">
            {rootFolders.length === 0 &&
              rootFiles.length === 0 &&
              !creatingRootFolder &&
              !creatingRootFile && (
                <div className="text-gray-500 text-sm p-2">
                  Không có file hoặc thư mục nào. Hãy tạo file mới.
                </div>
              )}

            {rootFolders.map((folder) => (
              <FolderNode
                key={folder.id}
                folder={folder}
                level={0}
                folders={folders}
                files={files}
                onFileSelect={onFileSelect}
                activeFileId={activeFileId}
                expandedFolders={expandedFolders}
                toggleFolder={toggleFolder}
                onCreateFolder={handleCreateFolder}
                onCreateFile={handleCreateFile}
                creatingFolderId={creatingFolderId}
                creatingFileId={creatingFileId}
                onEditFolder={handleEditFolder}
                onDeleteFolder={handleDeleteFolder}
                onEditFile={handleEditFile}
                onDeleteFile={handleDeleteFile}
              />
            ))}

            {creatingRootFolder && (
              <NewItemInput
                type="folder"
                level={0}
                parentId=""
                onCancel={handleCancelCreateFolder}
              />
            )}

            {rootFiles.map((file) => (
              <FileItem
                key={file.id}
                file={file}
                onClick={() => onFileSelect(file)}
                isActive={activeFileId === file.id}
                paddingLeft={0}
                onEdit={(updatedFile) => handleEditFile(updatedFile)}
                onDelete={() => handleDeleteFile(file)}
              />
            ))}

            {creatingRootFile && (
              <NewItemInput
                type="file"
                level={0}
                parentId=""
                onCancel={handleCancelCreateFile}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
