/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import {
  IconDots,
  IconEdit,
  IconTrash,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import type { CodeFile } from "../../../../../../types";
import FileIcon from "../FileIcon";

interface FileItemProps {
  file: CodeFile;
  onClick: () => void;
  isActive: boolean;
  paddingLeft: number;
  onEdit: (file: CodeFile) => void;
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
  const [isEditing, setIsEditing] = useState(false);
  const [editingFileName, setEditingFileName] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);

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

  // Thêm useEffect để focus vào input khi bắt đầu chỉnh sửa
  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingFileName(file.name);
    setIsEditing(true);
    setShowMenu(false);
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(false);
  };

  const handleSaveEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editingFileName.trim()) {
      const editedFile = { ...file, name: editingFileName.trim() };
      onEdit(editedFile);
    }
    setIsEditing(false);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteModal(true);
    setShowMenu(false);
  };

  const handleConfirmDelete = () => {
    onDelete();
    setShowDeleteModal(false);
  };

  return (
    <div
      className={`flex items-center py-1 px-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer rounded-md group ${
        isActive ? "bg-purple-100 dark:bg-purple-900" : ""
      }`}
      style={{ paddingLeft: `${paddingLeft}px` }}
      onClick={isEditing ? undefined : onClick}
    >
      <FileIcon fileName={file.name} size={18} className="mr-2" />

      {isEditing ? (
        <div
          className="flex-1 flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            ref={editInputRef}
            type="text"
            value={editingFileName}
            onChange={(e) => setEditingFileName(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveEdit(e as any);
              if (e.key === "Escape") handleCancelEdit(e as any);
              e.stopPropagation();
            }}
            className="flex-1 bg-transparent border-b border-gray-300 dark:border-gray-700 focus:outline-none focus:border-purple-500 py-1"
          />
          <div className="flex justify-end mt-1 gap-1">
            <button
              onClick={handleSaveEdit}
              className="px-2 py-1 bg-green-500 text-white rounded text-xs"
              title="Lưu"
            >
              <IconCheck size={14} className="mr-1 inline" /> Lưu
            </button>
            <button
              onClick={handleCancelEdit}
              className="px-2 py-1 bg-gray-500 text-white rounded text-xs"
              title="Hủy"
            >
              <IconX size={14} className="mr-1 inline" /> Hủy
            </button>
          </div>
        </div>
      ) : (
        <span className="truncate flex-1">{file.name}</span>
      )}

      {!isEditing && (
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
                  onClick={handleStartEdit}
                >
                  <IconEdit size={16} className="mr-2" />
                  Đổi tên
                </div>

                <div
                  className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500"
                  onClick={handleDeleteClick}
                >
                  <IconTrash size={16} className="mr-2" />
                  Xóa
                </div>
              </div>,
              document.body
            )}
        </div>
      )}

      {showDeleteModal &&
        ReactDOM.createPortal(
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Xác nhận xóa</h3>
              <p className="mb-6">
                Bạn có chắc muốn xóa file &quot;{file.name}&quot; không?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default FileItem;
