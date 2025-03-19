import React, { useState, useEffect } from "react";
import ModalWrapper from "@/components/ProviderSettings/ModalWrapper";
import { IconMovie, IconInfoCircle } from "@tabler/icons-react";
import { getLocalStorage, setLocalStorage } from "@/utils/localStorage";

interface AnimeSearchToolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnable: () => void;
  onDisable: () => void;
  isEnabled: boolean;
}

export default function AnimeSearchToolModal({
  isOpen,
  onClose,
  onEnable,
  onDisable,
  isEnabled,
}: AnimeSearchToolModalProps) {
  const [preferredLanguage, setPreferredLanguage] = useState("vi");
  const [showAdultContent, setShowAdultContent] = useState(false);

  // Load cấu hình từ localStorage khi mở modal
  useEffect(() => {
    const savedLanguage = getLocalStorage("tool:anime_search:language", "vi");
    const savedAdultContent = getLocalStorage(
      "tool:anime_search:adult_content",
      "false"
    );
    setPreferredLanguage(savedLanguage);
    setShowAdultContent(savedAdultContent === "true");
  }, []);

  // Tự động lưu cấu hình khi người dùng thay đổi
  useEffect(() => {
    setLocalStorage("tool:anime_search:language", preferredLanguage);
  }, [preferredLanguage]);

  useEffect(() => {
    setLocalStorage(
      "tool:anime_search:adult_content",
      showAdultContent.toString()
    );
  }, [showAdultContent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Bật công cụ
    onEnable();
    onClose();
  };

  const handleDisable = () => {
    onDisable();
    onClose();
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Cấu hình Tra cứu Anime"
      maxWidth="xl"
    >
      <div className="flex flex-col gap-6">
        {/* Phần header */}
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
            <IconMovie
              size={32}
              className="text-blue-600 dark:text-blue-400"
              stroke={1.5}
            />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-black dark:text-white">
              Tra cứu Anime
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Tìm kiếm thông tin anime, manga và các bộ phim hoạt hình Nhật Bản
            </p>
          </div>
        </div>

        {/* Phần mô tả */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
          <h3 className="font-medium text-black dark:text-white mb-2">
            Mô tả chi tiết
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Công cụ Tra cứu Anime cung cấp thông tin chi tiết về các bộ anime,
            manga và phim hoạt hình Nhật Bản. Bạn có thể tìm kiếm theo tên, thể
            loại, năm phát hành và nhiều tiêu chí khác. Công cụ này cũng cho
            phép bạn tùy chỉnh ngôn ngữ hiển thị và lọc nội dung phù hợp với lứa
            tuổi.
          </p>
        </div>

        {/* Phần hướng dẫn */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
          <h3 className="font-medium text-black dark:text-white mb-2">
            Hướng dẫn sử dụng
          </h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p>1. Chọn ngôn ngữ hiển thị ưu tiên</p>
            <p>2. Tùy chỉnh cài đặt hiển thị nội dung</p>
            <p>3. Nhấn nút bật để kích hoạt công cụ</p>
          </div>
        </div>

        {/* Phần cấu hình */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="font-medium text-black dark:text-white">Cấu hình</h3>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Ngôn ngữ ưu tiên
            </label>
            <select
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
              <option value="ja">日本語</option>
            </select>
            <div className="flex items-start gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
              <IconInfoCircle size={16} className="mt-0.5 flex-shrink-0" />
              <p>
                Ngôn ngữ ưu tiên sẽ được sử dụng để hiển thị thông tin anime khi
                có sẵn. Nếu không có thông tin bằng ngôn ngữ đã chọn, hệ thống
                sẽ hiển thị bằng tiếng Anh.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="showAdultContent"
                checked={showAdultContent}
                onChange={(e) => setShowAdultContent(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="showAdultContent"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Hiển thị nội dung người lớn
              </label>
            </div>
            <div className="flex items-start gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
              <IconInfoCircle size={16} className="mt-0.5 flex-shrink-0" />
              <p>
                Khi bật tùy chọn này, kết quả tìm kiếm sẽ bao gồm cả nội dung
                dành cho người lớn. Vui lòng cân nhắc kỹ trước khi bật tùy chọn
                này.
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            * Cấu hình sẽ được tự động lưu khi bạn thay đổi
          </p>

          <div className="flex justify-between items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors"
            >
              Đóng
            </button>
            {isEnabled ? (
              <button
                type="button"
                onClick={handleDisable}
                className="px-6 py-2 rounded-lg text-sm font-medium transition-colors bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800"
              >
                Tắt công cụ
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-2 rounded-lg text-sm font-medium transition-colors bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800"
              >
                Bật công cụ
              </button>
            )}
          </div>
        </form>
      </div>
    </ModalWrapper>
  );
}
