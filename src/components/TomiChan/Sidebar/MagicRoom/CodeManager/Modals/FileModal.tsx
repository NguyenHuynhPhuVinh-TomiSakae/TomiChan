import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { CodeFile, CodeFolder } from "../../../../../../types";

interface FileModalProps {
  type: "new" | "edit" | "delete" | "newFolder";
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  onFileNameChange: (name: string) => void;
  onSubmit: () => void;
  selectedFile?: CodeFile;
  folders?: CodeFolder[];
  selectedParentFolder?: string | null;
  onParentFolderChange?: (folderId: string | null) => void;
  selectedFolder?: CodeFolder | null;
}

export function FileModal({
  type,
  isOpen,
  onClose,
  fileName,
  onFileNameChange,
  onSubmit,
  selectedFile,
  selectedFolder,
}: FileModalProps) {
  if (!isOpen) return null;

  const modalConfig = {
    new: {
      title: "Tạo tệp mới",
      submitText: "Tạo",
      submitClass: "bg-purple-500 hover:bg-purple-600",
    },
    newFolder: {
      title: "Tạo thư mục mới",
      submitText: "Tạo",
      submitClass: "bg-purple-500 hover:bg-purple-600",
    },
    edit: {
      title: "Đổi tên tệp",
      submitText: "Lưu",
      submitClass: "bg-purple-500 hover:bg-purple-600",
    },
    delete: {
      title: "Xác nhận xóa",
      submitText: "Xóa",
      submitClass: "bg-red-500 hover:bg-red-600",
    },
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[9999]" onClose={onClose}>
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
              <Dialog.Panel className="w-full max-w-md transform bg-white dark:bg-gray-800 rounded-lg p-6 text-left align-middle shadow-xl transition-all flex flex-col">
                <Dialog.Title className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                  {modalConfig[type].title}
                </Dialog.Title>

                <div className="overflow-y-auto grow">
                  {type !== "delete" && (
                    <input
                      type="text"
                      value={fileName}
                      onChange={(e) => onFileNameChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                      placeholder="Nhập tên..."
                      autoFocus
                    />
                  )}

                  {type === "delete" && (
                    <p className="mb-4 text-gray-700 dark:text-gray-300">
                      Bạn có chắc chắn muốn xóa{" "}
                      {selectedFolder
                        ? `thư mục "${selectedFolder.name}" và tất cả nội dung bên trong`
                        : selectedFile
                        ? `tệp "${selectedFile.name}"`
                        : "mục này"}{" "}
                      không?
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200 cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={onSubmit}
                    className={`px-4 py-2 text-white rounded-lg transition-colors duration-200 cursor-pointer ${modalConfig[type].submitClass}`}
                  >
                    {modalConfig[type].submitText}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
