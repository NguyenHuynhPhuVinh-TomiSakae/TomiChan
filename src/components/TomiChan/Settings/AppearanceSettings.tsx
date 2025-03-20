import React, { useState } from "react";
import {
  IconSun,
  IconMoon,
  IconWorld,
  IconAlertTriangle,
} from "@tabler/icons-react";
import ModalWrapper from "../../ProviderSettings/ModalWrapper";

interface AppearanceSettingsProps {
  theme: "light" | "dark" | "system";
  onThemeChange: (theme: "light" | "dark" | "system") => void;
  onClearAllData?: () => void;
}

export default function AppearanceSettings({
  theme,
  onThemeChange,
  onClearAllData,
}: AppearanceSettingsProps) {
  const [showClearDataConfirm, setShowClearDataConfirm] = useState(false);

  const handleClearAllData = () => {
    if (onClearAllData) {
      onClearAllData();
      setShowClearDataConfirm(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Giao diện
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => onThemeChange("light")}
              className={`flex flex-col items-center p-3 rounded-lg border cursor-pointer ${
                theme === "light"
                  ? "border-black dark:border-white bg-white dark:bg-black"
                  : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
              }`}
            >
              <IconSun size={24} />
              <span className="mt-1 text-sm">Sáng</span>
            </button>
            <button
              onClick={() => onThemeChange("dark")}
              className={`flex flex-col items-center p-3 rounded-lg border cursor-pointer ${
                theme === "dark"
                  ? "border-black dark:border-white bg-white dark:bg-black"
                  : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
              }`}
            >
              <IconMoon size={24} />
              <span className="mt-1 text-sm">Tối</span>
            </button>
            <button
              onClick={() => onThemeChange("system")}
              className={`flex flex-col items-center p-3 rounded-lg border cursor-pointer ${
                theme === "system"
                  ? "border-black dark:border-white bg-white dark:bg-black"
                  : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
              }`}
            >
              <IconWorld size={24} />
              <span className="mt-1 text-sm">Hệ thống</span>
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Dữ liệu ứng dụng
          </h3>

          <button
            onClick={() => setShowClearDataConfirm(true)}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
          >
            Xóa toàn bộ dữ liệu
          </button>
        </div>
      </div>

      {/* Modal xác nhận xóa dữ liệu */}
      <ModalWrapper
        isOpen={showClearDataConfirm}
        onClose={() => setShowClearDataConfirm(false)}
        title="Xóa dữ liệu"
        maxWidth="sm"
        showFooter={false}
      >
        <div className="flex items-center mb-4">
          <IconAlertTriangle size={24} className="text-red-600 mr-2" />
          <h3 className="text-lg font-semibold">Xác nhận xóa dữ liệu</h3>
        </div>

        <p className="mb-6 text-gray-700 dark:text-gray-300">
          Bạn có chắc chắn muốn xóa toàn bộ dữ liệu? Hành động này không thể
          hoàn tác và sẽ xóa tất cả cuộc trò chuyện, tệp và thư mục.
        </p>

        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setShowClearDataConfirm(false)}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            onClick={handleClearAllData}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
          >
            Xác nhận xóa
          </button>
        </div>
      </ModalWrapper>
    </>
  );
}
