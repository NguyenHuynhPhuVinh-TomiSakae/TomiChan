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
  const [searchLimit, setSearchLimit] = useState(10);

  // Load cấu hình từ localStorage khi mở modal
  useEffect(() => {
    const savedSearchLimit = getLocalStorage("tool:anime_search:limit", "10");
    setSearchLimit(Number(savedSearchLimit));
  }, []);

  // Tự động lưu cấu hình khi người dùng thay đổi
  useEffect(() => {
    setLocalStorage("tool:anime_search:limit", searchLimit.toString());
  }, [searchLimit]);

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
            loại, năm phát hành và nhiều tiêu chí khác. Sử dụng Jikan API v4 để
            kết nối với MyAnimeList và cung cấp dữ liệu chính xác nhất.
          </p>
        </div>

        {/* Phần hướng dẫn */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
          <h3 className="font-medium text-black dark:text-white mb-2">
            Hướng dẫn sử dụng
          </h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p>1. Điều chỉnh số lượng kết quả tìm kiếm</p>
            <p>2. Nhấn nút bật để kích hoạt công cụ</p>
            <p>3. Hỏi AI về bất kỳ anime hoặc manga nào bạn quan tâm</p>
          </div>
        </div>

        {/* Phần cấu hình */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="font-medium text-black dark:text-white">Cấu hình</h3>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Số lượng kết quả tìm kiếm
            </label>
            <input
              type="range"
              min="5"
              max="25"
              step="5"
              value={searchLimit}
              onChange={(e) => setSearchLimit(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>5</span>
              <span>10</span>
              <span>15</span>
              <span>20</span>
              <span>25</span>
            </div>
            <div className="text-center text-sm font-medium text-blue-600 dark:text-blue-400 mt-2">
              {searchLimit} kết quả
            </div>
            <div className="flex items-start gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
              <IconInfoCircle size={16} className="mt-0.5 flex-shrink-0" />
              <p>
                Số lượng kết quả tìm kiếm tối đa sẽ được hiển thị trong mỗi lần
                tìm kiếm. Jikan API có giới hạn kết quả tìm kiếm và tần suất yêu
                cầu.
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/30 rounded-lg p-4 mt-4">
            <div className="flex items-start gap-2">
              <IconInfoCircle
                size={18}
                className="text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0"
              />
              <div>
                <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                  Lưu ý về nội dung
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                  Công cụ này chỉ hiển thị nội dung phù hợp với mọi lứa tuổi
                  (SFW). Kết quả tìm kiếm đã được lọc để đảm bảo an toàn và phù
                  hợp cho tất cả người dùng.
                </p>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            * Cấu hình sẽ được tự động lưu khi bạn thay đổi
          </p>

          <div className="flex justify-between items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors cursor-pointer"
            >
              Đóng
            </button>
            {isEnabled ? (
              <button
                type="button"
                onClick={handleDisable}
                className="px-6 py-2 rounded-lg text-sm font-medium transition-colors bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 cursor-pointer"
              >
                Tắt công cụ
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-2 rounded-lg text-sm font-medium transition-colors bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 cursor-pointer"
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
