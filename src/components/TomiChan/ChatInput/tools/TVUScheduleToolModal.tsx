import React, { useState, useEffect } from "react";
import ModalWrapper from "@/components/ProviderSettings/ModalWrapper";
import { IconCalendar, IconInfoCircle } from "@tabler/icons-react";
import { getLocalStorage, setLocalStorage } from "@/utils/localStorage";

interface TVUScheduleToolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnable: () => void;
  onDisable: () => void;
  isEnabled: boolean;
}

export default function TVUScheduleToolModal({
  isOpen,
  onClose,
  onEnable,
  onDisable,
  isEnabled,
}: TVUScheduleToolModalProps) {
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");

  // Load cấu hình từ localStorage khi mở modal
  useEffect(() => {
    const savedStudentId = getLocalStorage("tool:tvu_schedule:student_id", "");
    const savedPassword = getLocalStorage("tool:tvu_schedule:password", "");
    setStudentId(savedStudentId);
    setPassword(savedPassword);
  }, []);

  // Tự động lưu cấu hình khi người dùng nhập
  useEffect(() => {
    if (studentId.trim()) {
      setLocalStorage("tool:tvu_schedule:student_id", studentId);
    }
  }, [studentId]);

  useEffect(() => {
    if (password.trim()) {
      setLocalStorage("tool:tvu_schedule:password", password);
    }
  }, [password]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim() || !password.trim()) return;

    // Bật công cụ
    onEnable();
    onClose();
  };

  const handleDisable = () => {
    // Không xóa cấu hình khi tắt công cụ nữa
    onDisable();
    onClose();
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Cấu hình Xem TKB TVU"
      maxWidth="xl"
    >
      <div className="flex flex-col gap-6">
        {/* Phần header */}
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
            <IconCalendar
              size={32}
              className="text-blue-600 dark:text-blue-400"
              stroke={1.5}
            />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-black dark:text-white">
              Xem TKB TVU
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Tra cứu và quản lý thời khóa biểu Trường Đại học Trà Vinh
            </p>
          </div>
        </div>

        {/* Phần mô tả */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
          <h3 className="font-medium text-black dark:text-white mb-2">
            Mô tả chi tiết
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Công cụ Xem TKB TVU giúp bạn truy cập thông tin học tập tại Đại học
            Trà Vinh qua tài khoản TTSV. Bạn có thể:
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>Tra cứu thời khóa biểu cá nhân theo ngày</li>
              <li>
                Xem thời khóa biểu theo tuần (tuần này, tuần trước, tuần sau)
              </li>
              <li>
                Tra cứu thời khóa biểu theo số tuần cụ thể (tuần 37, tuần
                38,...)
              </li>
              <li>Xem điểm số các học phần, điểm tổng kết</li>
              <li>Tra cứu điểm theo học kỳ và năm học cụ thể</li>
            </ul>
            Công cụ được kết nối trực tiếp với API của hệ thống TTSV để đảm bảo
            thông tin chính xác.
          </p>
        </div>

        {/* Phần hướng dẫn */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
          <h3 className="font-medium text-black dark:text-white mb-2">
            Hướng dẫn sử dụng
          </h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p>1. Nhập mã số sinh viên của bạn</p>
            <p>2. Nhập mật khẩu TTSV</p>
            <p>3. Nhấn nút bật để kích hoạt công cụ</p>
            <p>4. Yêu cầu AI thông tin bằng các câu hỏi như:</p>
            <ul className="list-disc ml-8 mt-1 space-y-1">
              <li>&quot;Xem thời khóa biểu hôm nay&quot;</li>
              <li>&quot;Thời khóa biểu ngày mai của tôi&quot;</li>
              <li>&quot;Cho tôi xem thời khóa biểu tuần này&quot;</li>
              <li>&quot;Xem thời khóa biểu tuần trước&quot;</li>
              <li>&quot;Thời khóa biểu tuần sau của tôi&quot;</li>
              <li>
                &quot;Xem thời khóa biểu tuần 37&quot; (tra cứu theo số tuần cụ
                thể)
              </li>
              <li>&quot;Xem điểm của tôi&quot;</li>
              <li>
                &quot;Xem điểm học kỳ 2 năm 2023-2024&quot; (tra cứu điểm theo
                kỳ cụ thể)
              </li>
            </ul>
          </div>
        </div>

        {/* Phần cấu hình */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="font-medium text-black dark:text-white">
            Cấu hình đăng nhập TTSV
          </h3>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Mã số sinh viên
            </label>
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="Nhập mã số sinh viên của bạn"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              required
            />
            <div className="flex items-start gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
              <IconInfoCircle size={16} className="mt-0.5 flex-shrink-0" />
              <p>
                Mã số sinh viên là một chuỗi số được cấp khi bạn nhập học tại
                trường TVU. Ví dụ: 110120XXX, 110121XXX, ...
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Mật khẩu TTSV
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu hệ thống TTSV"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              required
            />
            <div className="flex items-start gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
              <IconInfoCircle size={16} className="mt-0.5 flex-shrink-0" />
              <p>
                Sử dụng mật khẩu bạn đăng nhập vào hệ thống TTSV (hệ thống đào
                tạo trực tuyến)
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            * Thông tin đăng nhập sẽ được tự động lưu khi bạn nhập
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
                disabled={!studentId.trim() || !password.trim()}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                  studentId.trim() && password.trim()
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 cursor-pointer"
                    : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed"
                }`}
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
