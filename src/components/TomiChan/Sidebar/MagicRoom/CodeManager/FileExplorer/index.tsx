import React, { useState, useEffect } from "react";
import { IconFolderPlus, IconFilePlus, IconDots } from "@tabler/icons-react";
import { chatDB } from "../../../../../../utils/db";
import type { CodeFile, CodeFolder } from "../../../../../../types";
import FolderNode from "./FolderNode";
import FileItem from "./FileItem";
import NewItemInput from "./NewItemInput";
import { Menu, MenuItem } from "./Menu";
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
      className={`overflow-auto h-full min-w-[250px] bg-white dark:bg-gray-900 ${className}`}
    >
      <div className="p-2">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-gray-700 dark:text-gray-300">
            EXPLORER
          </h3>
          <Menu
            trigger={
              <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                <IconDots size={16} />
              </button>
            }
          >
            <MenuItem
              icon={<IconFolderPlus size={16} />}
              label="Tạo thư mục mới"
              onClick={() => handleCreateFolder("")}
            />
            <MenuItem
              icon={<IconFilePlus size={16} />}
              label="Tạo file mới"
              onClick={() => handleCreateFile("")}
            />
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
