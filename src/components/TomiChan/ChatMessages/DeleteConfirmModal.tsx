import React from "react";
import { IconX } from "@tabler/icons-react";
import Portal from "../../Portal";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
        <div className="bg-white dark:bg-black sm:rounded-lg w-full max-w-md p-6 relative text-black dark:text-white dark:border dark:border-white">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Xác nhận xóa</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors cursor-pointer"
            >
              <IconX size={20} />
            </button>
          </div>

          <p className="mb-6">Bạn có chắc chắn muốn xóa tin nhắn này?</p>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors cursor-pointer"
            >
              Xóa
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
