/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import {
  IconFolder,
  IconFolderOpen,
  IconChevronRight,
  IconChevronDown,
  IconFolderPlus,
  IconFilePlus,
  IconDots,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react";
import type { CodeFile, CodeFolder } from "../../../../../../types";
import FileItem from "./FileItem";
import NewItemInput from "./NewItemInput";

interface FolderNodeProps {
  folder: CodeFolder;
  level: number;
  folders: CodeFolder[];
  files: CodeFile[];
  onFileSelect: (file: CodeFile) => void;
  activeFileId?: string;
  expandedFolders: Set<string>;
  toggleFolder: (folderId: string) => void;
  onCreateFolder: (parentId: string | null) => void;
  onCreateFile: (folderId: string | null) => void;
  creatingFolderId: string | null;
  creatingFileId: string | null;
  onEditFolder: (folder: CodeFolder) => void;
  onDeleteFolder: (folder: CodeFolder) => void;
  onEditFile: (file: CodeFile) => void;
  onDeleteFile: (file: CodeFile) => void;
}

const FolderNode: React.FC<FolderNodeProps> = ({
  folder,
  level,
  folders,
  files,
  onFileSelect,
  activeFileId,
  expandedFolders,
  toggleFolder,
  onCreateFolder,
  onCreateFile,
  creatingFolderId,
  creatingFileId,
  onEditFolder,
  onDeleteFolder,
  onEditFile,
  onDeleteFile,
}) => {
  const isExpanded = expandedFolders.has(folder.id);
  const childFolders = folders.filter((f) => f.parentId === folder.id);
  const childFiles = files.filter((f) => f.folderId === folder.id);
  const [showMenu, setShowMenu] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const paddingLeft = level * 16;
  const isCreatingFolder = creatingFolderId === folder.id;
  const isCreatingFile = creatingFileId === folder.id;

  // Tính toán vị trí menu khi hiển thị
  useEffect(() => {
    if (showMenu && menuButtonRef.current) {
      const rect = menuButtonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY,
        left: rect.right - 150 + window.scrollX, // 150 là chiều rộng xấp xỉ của menu
      });
    }
  }, [showMenu]);

  // Thêm sự kiện đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Kiểm tra xem click có phải vào nút menu không
      if (
        menuButtonRef.current &&
        menuButtonRef.current.contains(event.target as Node)
      ) {
        return;
      }

      // Nếu click không phải vào menu content và không phải vào nút menu
      if (
        showMenu &&
        !(event.target as Element).closest(".folder-menu-content")
      ) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      // Cần delay một chút để tránh xung đột với sự kiện click hiện tại
      setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 0);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  // Hàm xử lý khi nhấn vào tên thư mục
  const handleFolderNameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFolder(folder.id);
  };

  // Hàm xử lý khi nhấn vào biểu tượng mũi tên
  const handleArrowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFolder(folder.id);
  };

  // Hàm xử lý khi nhấn vào nút menu
  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu((prev) => !prev);
    console.log("Menu button clicked for folder:", folder.name);
  };

  // Hàm xử lý khi hủy tạo thư mục con
  const handleCancelCreateFolder = () => {
    onCreateFolder(null);
  };

  // Hàm xử lý khi hủy tạo file con
  const handleCancelCreateFile = () => {
    onCreateFile(null);
  };

  return (
    <div>
      <div
        className="flex items-center py-1 px-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer rounded-md group"
        style={{ paddingLeft: `${paddingLeft}px` }}
      >
        <span className="mr-1" onClick={handleArrowClick}>
          {isExpanded ? (
            <IconChevronDown size={16} />
          ) : (
            <IconChevronRight size={16} />
          )}
        </span>
        {isExpanded ? (
          <IconFolderOpen size={18} className="mr-2 text-yellow-500" />
        ) : (
          <IconFolder size={18} className="mr-2 text-yellow-500" />
        )}
        <span className="truncate flex-1" onClick={handleFolderNameClick}>
          {folder.name}
        </span>

        <div className="relative">
          <button
            ref={menuButtonRef}
            onClick={handleMenuClick}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <IconDots size={16} />
          </button>

          {showMenu &&
            ReactDOM.createPortal(
              <div
                className="fixed py-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-[9999] border border-gray-200 dark:border-gray-700 folder-menu-content"
                style={{
                  top: `${menuPosition.top}px`,
                  left: `${menuPosition.left}px`,
                }}
              >
                <div
                  className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log(
                      "Create folder clicked for parent:",
                      folder.name
                    );
                    onCreateFolder(folder.id);
                    setShowMenu(false);
                  }}
                >
                  <IconFolderPlus size={16} className="mr-2" />
                  Tạo thư mục mới
                </div>

                <div
                  className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log("Create file clicked for folder:", folder.name);
                    onCreateFile(folder.id);
                    setShowMenu(false);
                  }}
                >
                  <IconFilePlus size={16} className="mr-2" />
                  Tạo file mới
                </div>

                <div
                  className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log("Edit folder clicked:", folder.name);
                    onEditFolder(folder);
                    setShowMenu(false);
                  }}
                >
                  <IconEdit size={16} className="mr-2" />
                  Đổi tên
                </div>

                <div
                  className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log("Delete folder clicked:", folder.name);
                    onDeleteFolder(folder);
                    setShowMenu(false);
                  }}
                >
                  <IconTrash size={16} className="mr-2" />
                  Xóa
                </div>
              </div>,
              document.body
            )}
        </div>
      </div>

      {isExpanded && (
        <div>
          {childFolders.map((childFolder) => (
            <FolderNode
              key={childFolder.id}
              folder={childFolder}
              level={level + 1}
              folders={folders}
              files={files}
              onFileSelect={onFileSelect}
              activeFileId={activeFileId}
              expandedFolders={expandedFolders}
              toggleFolder={toggleFolder}
              onCreateFolder={onCreateFolder}
              onCreateFile={onCreateFile}
              creatingFolderId={creatingFolderId}
              creatingFileId={creatingFileId}
              onEditFolder={onEditFolder}
              onDeleteFolder={onDeleteFolder}
              onEditFile={onEditFile}
              onDeleteFile={onDeleteFile}
            />
          ))}

          {isCreatingFolder && (
            <NewItemInput
              type="folder"
              level={level + 1}
              parentId={folder.id}
              onCancel={handleCancelCreateFolder}
            />
          )}

          {childFiles.map((file) => (
            <FileItem
              key={file.id}
              file={file}
              onClick={() => onFileSelect(file)}
              isActive={activeFileId === file.id}
              paddingLeft={paddingLeft + 20}
              onEdit={() => onEditFile(file)}
              onDelete={() => onDeleteFile(file)}
            />
          ))}

          {isCreatingFile && (
            <NewItemInput
              type="file"
              level={level + 1}
              parentId={folder.id}
              onCancel={handleCancelCreateFile}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default FolderNode;
