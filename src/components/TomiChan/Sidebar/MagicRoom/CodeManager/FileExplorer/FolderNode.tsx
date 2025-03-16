/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useEffect } from "react";
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
  IconCheck,
  IconX,
  IconDownload,
} from "@tabler/icons-react";
import { Menu, Transition, Dialog } from "@headlessui/react";
import { Fragment } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
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
  const [editingFolderName, setEditingFolderName] = useState("");
  const [isEditingFolder, setIsEditingFolder] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);

  const paddingLeft = level * 16;
  const isCreatingFolder = creatingFolderId === folder.id;
  const isCreatingFile = creatingFileId === folder.id;

  // Thêm useEffect để focus vào input khi bắt đầu chỉnh sửa
  useEffect(() => {
    if (isEditingFolder && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditingFolder]);

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

  // Hàm xử lý khi hủy tạo thư mục con
  const handleCancelCreateFolder = () => {
    onCreateFolder(null);
  };

  // Hàm xử lý khi hủy tạo file con
  const handleCancelCreateFile = () => {
    onCreateFile(null);
  };

  // Hàm xử lý khi bắt đầu chỉnh sửa tên thư mục
  const handleStartEditFolder = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingFolderName(folder.name);
    setIsEditingFolder(true);
  };

  // Hàm xử lý khi hủy chỉnh sửa tên thư mục
  const handleCancelEditFolder = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingFolder(false);
  };

  // Hàm xử lý khi lưu tên thư mục mới
  const handleSaveEditFolder = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editingFolderName.trim()) {
      onEditFolder({ ...folder, name: editingFolderName.trim() });
    }
    setIsEditingFolder(false);
  };

  // Hàm xử lý khi xác nhận xóa thư mục
  const handleConfirmDelete = () => {
    onDeleteFolder(folder);
    setShowDeleteModal(false);
  };

  // Hàm tải xuống thư mục
  const downloadFolder = async () => {
    const zip = new JSZip();

    // Hàm đệ quy để thêm files và folders vào zip
    const addToZip = async (currentFolderId: string, path: string = "") => {
      // Thêm files trong folder hiện tại
      const filesInFolder = files.filter(
        (file) => file.folderId === currentFolderId
      );
      filesInFolder.forEach((file) => {
        zip.file(`${path}${file.name}`, file.content);
      });

      // Thêm subfolders và files của chúng
      const subFolders = folders.filter(
        (folder) => folder.parentId === currentFolderId
      );
      for (const subFolder of subFolders) {
        await addToZip(subFolder.id, `${path}${subFolder.name}/`);
      }
    };

    await addToZip(folder.id);

    // Tạo và tải xuống file zip
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `${folder.name}.zip`);
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

        {isEditingFolder ? (
          <div className="flex-1 flex flex-col">
            <input
              ref={editInputRef}
              type="text"
              value={editingFolderName}
              onChange={(e) => setEditingFolderName(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveEditFolder(e as any);
                if (e.key === "Escape") handleCancelEditFolder(e as any);
                e.stopPropagation();
              }}
              className="flex-1 bg-transparent border-b border-gray-300 dark:border-gray-700 focus:outline-none focus:border-purple-500 py-1"
            />
            <div className="flex justify-end mt-1 gap-1">
              <button
                onClick={handleSaveEditFolder}
                className="px-2 py-1 bg-green-500 text-white rounded text-xs cursor-pointer"
                title="Lưu"
              >
                <IconCheck size={14} className="mr-1 inline" /> Lưu
              </button>
              <button
                onClick={handleCancelEditFolder}
                className="px-2 py-1 bg-gray-500 text-white rounded text-xs cursor-pointer"
                title="Hủy"
              >
                <IconX size={14} className="mr-1 inline" /> Hủy
              </button>
            </div>
          </div>
        ) : (
          <span className="truncate flex-1" onClick={handleFolderNameClick}>
            {folder.name}
          </span>
        )}

        {!isEditingFolder && (
          <Menu as="div" className="relative inline-block text-left">
            <div>
              <Menu.Button
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
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
              <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onCreateFolder(folder.id);
                        }}
                        className={`${
                          active ? "bg-gray-100 dark:bg-gray-700" : ""
                        } flex w-full items-center px-4 py-2 text-sm cursor-pointer`}
                      >
                        <IconFolderPlus size={16} className="mr-2" />
                        Tạo thư mục mới
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onCreateFile(folder.id);
                        }}
                        className={`${
                          active ? "bg-gray-100 dark:bg-gray-700" : ""
                        } flex w-full items-center px-4 py-2 text-sm cursor-pointer`}
                      >
                        <IconFilePlus size={16} className="mr-2" />
                        Tạo file mới
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadFolder();
                        }}
                        className={`${
                          active ? "bg-gray-100 dark:bg-gray-700" : ""
                        } flex w-full items-center px-4 py-2 text-sm cursor-pointer`}
                      >
                        <IconDownload size={16} className="mr-2" />
                        Tải xuống
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleStartEditFolder}
                        className={`${
                          active ? "bg-gray-100 dark:bg-gray-700" : ""
                        } flex w-full items-center px-4 py-2 text-sm cursor-pointer`}
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
                        } flex w-full items-center px-4 py-2 text-sm text-red-500 cursor-pointer`}
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
              onEdit={(editedFile) => onEditFile(editedFile)}
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

      {showDeleteModal && (
        <Transition appear show={showDeleteModal} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-[9999]"
            onClose={() => setShowDeleteModal(false)}
          >
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/50" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-md transform bg-white dark:bg-gray-800 rounded-lg p-6 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title as="h3" className="text-xl font-bold mb-4">
                      Xác nhận xóa
                    </Dialog.Title>
                    <p className="mb-6">
                      Bạn có chắc muốn xóa thư mục &quot;{folder.name}&quot; và
                      tất cả nội dung bên trong không?
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
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      )}
    </div>
  );
};

export default FolderNode;
