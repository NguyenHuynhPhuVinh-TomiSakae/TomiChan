import React, { useState, useEffect } from "react";
import ModalWrapper from "@/components/ProviderSettings/ModalWrapper";
import { IconMail, IconInfoCircle } from "@tabler/icons-react";
import { getLocalStorage, setLocalStorage } from "@/utils/localStorage";

interface EmailToolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnable: () => void;
  onDisable: () => void;
  isEnabled: boolean;
}

export default function EmailToolModal({
  isOpen,
  onClose,
  onEnable,
  onDisable,
  isEnabled,
}: EmailToolModalProps) {
  const [email, setEmail] = useState("");
  const [appPassword, setAppPassword] = useState("");

  // Load cấu hình từ localStorage khi mở modal
  useEffect(() => {
    const savedEmail = getLocalStorage("tool:email:email", "");
    const savedPassword = getLocalStorage("tool:email:password", "");
    setEmail(savedEmail);
    setAppPassword(savedPassword);
  }, []);

  // Tự động lưu cấu hình khi người dùng nhập
  useEffect(() => {
    if (email.trim()) {
      setLocalStorage("tool:email:email", email);
    }
  }, [email]);

  useEffect(() => {
    if (appPassword.trim()) {
      setLocalStorage("tool:email:password", appPassword);
    }
  }, [appPassword]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !appPassword.trim()) return;

    // Bật công cụ
    onEnable();
    onClose();
  };

  const handleDisable = () => {
    // Xóa cấu hình khi tắt công cụ
    setLocalStorage("tool:email:email", "");
    setLocalStorage("tool:email:password", "");
    setEmail("");
    setAppPassword("");
    onDisable();
    onClose();
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Cấu hình Gửi Mail"
      maxWidth="xl"
    >
      <div className="flex flex-col gap-6">
        {/* Phần header */}
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
            <IconMail
              size={32}
              className="text-blue-600 dark:text-blue-400"
              stroke={1.5}
            />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-black dark:text-white">
              Gửi Mail
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Hỗ trợ soạn và gửi email tự động với nội dung được tối ưu
            </p>
          </div>
        </div>

        {/* Phần mô tả */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
          <h3 className="font-medium text-black dark:text-white mb-2">
            Mô tả chi tiết
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Công cụ Gửi Mail cho phép bạn soạn và gửi email tự động thông qua
            Gmail. Bạn có thể cấu hình email và mật khẩu ứng dụng để sử dụng.
            Công cụ này sẽ giúp bạn tiết kiệm thời gian khi cần gửi nhiều email
            hoặc tạo các email mẫu.
          </p>
        </div>

        {/* Phần hướng dẫn */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
          <h3 className="font-medium text-black dark:text-white mb-2">
            Hướng dẫn sử dụng
          </h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p>1. Nhập địa chỉ email Gmail của bạn</p>
            <p>2. Tạo mật khẩu ứng dụng trong cài đặt bảo mật Gmail</p>
            <p>3. Nhập mật khẩu ứng dụng vào ô bên dưới</p>
            <p>4. Nhấn nút bật để kích hoạt công cụ</p>
          </div>
        </div>

        {/* Phần cấu hình */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="font-medium text-black dark:text-white">Cấu hình</h3>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập địa chỉ email của bạn"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Mật khẩu ứng dụng
            </label>
            <input
              type="password"
              value={appPassword}
              onChange={(e) => setAppPassword(e.target.value)}
              placeholder="Nhập mật khẩu ứng dụng"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              required
            />
            <div className="flex items-start gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
              <IconInfoCircle size={16} className="mt-0.5 flex-shrink-0" />
              <p>
                Mật khẩu ứng dụng là một mã gồm 16 ký tự được tạo từ cài đặt bảo
                mật của tài khoản Google. Bạn cần bật xác thực 2 bước trước khi
                tạo mật khẩu ứng dụng.
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            * Cấu hình sẽ được tự động lưu khi bạn nhập
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
                disabled={!email.trim() || !appPassword.trim()}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                  email.trim() && appPassword.trim()
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800"
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
