import React from "react";
import Portal from "../../../../../../components/Portal";

interface UnsavedChangesModalProps {
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
}

export default function UnsavedChangesModal({
  onSave,
  onDiscard,
  onCancel,
}: UnsavedChangesModalProps) {
  return (
    <Portal>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Thay đổi chưa được lưu
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Bạn có thay đổi chưa được lưu. Bạn muốn lưu thay đổi trước khi đóng
            file này không?
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Hủy
            </button>
            <button
              onClick={onDiscard}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Bỏ thay đổi
            </button>
            <button
              onClick={onSave}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Lưu
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
