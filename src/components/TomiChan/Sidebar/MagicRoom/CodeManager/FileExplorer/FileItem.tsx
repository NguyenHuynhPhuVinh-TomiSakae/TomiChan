/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import {
  IconDots,
  IconEdit,
  IconTrash,
  IconCheck,
  IconX,
  IconDownload,
} from "@tabler/icons-react";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { saveAs } from "file-saver";
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
  const [isEditing, setIsEditing] = useState(false);
  const [editingFileName, setEditingFileName] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);

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

  const handleConfirmDelete = () => {
    onDelete();
    setShowDeleteModal(false);
  };

  const downloadFile = () => {
    const blob = new Blob([file.content], { type: "text/plain;charset=utf-8" });
    saveAs(blob, file.name);
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
        <Menu as="div" className="relative inline-block text-left">
          <div>
            <Menu.Button
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
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
            <Menu.Items className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="py-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadFile();
                      }}
                      className={`${
                        active ? "bg-gray-100 dark:bg-gray-700" : ""
                      } flex w-full items-center px-4 py-2 text-sm`}
                    >
                      <IconDownload size={16} className="mr-2" />
                      Tải xuống
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleStartEdit}
                      className={`${
                        active ? "bg-gray-100 dark:bg-gray-700" : ""
                      } flex w-full items-center px-4 py-2 text-sm`}
                    >
                      <IconEdit size={16} className="mr-2" />
                      Đổi tên
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteModal(true);
                      }}
                      className={`${
                        active ? "bg-gray-100 dark:bg-gray-700" : ""
                      } flex w-full items-center px-4 py-2 text-sm text-red-500`}
                    >
                      <IconTrash size={16} className="mr-2" />
                      Xóa
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
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
