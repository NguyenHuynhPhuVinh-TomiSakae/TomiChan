import { CodeFile } from "../../../../../types";
import Portal from "../../../../Portal";

interface FileModalProps {
  type: "new" | "edit" | "delete";
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  onFileNameChange: (name: string) => void;
  onSubmit: () => void;
  selectedFile?: CodeFile;
}

export function FileModal({
  type,
  isOpen,
  onClose,
  fileName,
  onFileNameChange,
  onSubmit,
  selectedFile,
}: FileModalProps) {
  if (!isOpen) return null;

  const modalConfig = {
    new: {
      title: "Tạo tệp mới",
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
    <Portal>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-102 shadow-xl">
          <h3 className="text-xl font-semibold mb-4">
            {modalConfig[type].title}
          </h3>

          {type !== "delete" ? (
            <input
              type="text"
              value={fileName}
              onChange={(e) => onFileNameChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-4 bg-transparent cursor-text"
              placeholder="Nhập tên tệp..."
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onSubmit();
                }
              }}
            />
          ) : (
            <p className="mb-4">
              Bạn có chắc chắn muốn xóa tệp &quot;{selectedFile?.name}&quot;
              không?
            </p>
          )}

          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={onSubmit}
              className={`px-4 py-2 text-white rounded-lg cursor-pointer transition-colors ${modalConfig[type].submitClass}`}
            >
              {modalConfig[type].submitText}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
