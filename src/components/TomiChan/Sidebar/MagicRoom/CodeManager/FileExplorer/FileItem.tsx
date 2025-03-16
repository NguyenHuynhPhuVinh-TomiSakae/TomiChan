import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { IconDots, IconEdit, IconTrash } from "@tabler/icons-react";
import type { CodeFile } from "../../../../../../types";
import FileIcon from "../FileIcon";

interface FileItemProps {
  file: CodeFile;
  onClick: () => void;
  isActive: boolean;
  paddingLeft: number;
  onEdit: () => void;
  onDelete: () => void;
}

const FileItem: React.FC<FileItemProps> = ({
  file,
  onClick,
  isActive,
  paddingLeft,
  onEdit,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu((prev) => !prev);
    console.log("Menu button clicked for file:", file.name);
  };

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
        !(event.target as Element).closest(".file-menu-content")
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

  return (
    <div
      className={`flex items-center py-1 px-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer rounded-md group ${
        isActive ? "bg-purple-100 dark:bg-purple-900" : ""
      }`}
      style={{ paddingLeft: `${paddingLeft}px` }}
      onClick={onClick}
    >
      <FileIcon fileName={file.name} size={18} className="mr-2" />
      <span className="truncate flex-1">{file.name}</span>

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
              className="fixed py-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-[9999] border border-gray-200 dark:border-gray-700 file-menu-content"
              style={{
                top: `${menuPosition.top}px`,
                left: `${menuPosition.left}px`,
              }}
            >
              <div
                className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log("Edit file clicked:", file.name);
                  onEdit();
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
                  console.log("Delete file clicked:", file.name);
                  onDelete();
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
  );
};

export default FileItem;
