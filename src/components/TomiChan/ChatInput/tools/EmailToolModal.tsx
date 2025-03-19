import React, { useState, useEffect } from "react";
import ModalWrapper from "@/components/ProviderSettings/ModalWrapper";
import { IconMail, IconInfoCircle, IconArrowRight } from "@tabler/icons-react";
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
  const [serviceId, setServiceId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [publicKey, setPublicKey] = useState("");

  // Load cấu hình từ localStorage khi mở modal
  useEffect(() => {
    const savedEmail = getLocalStorage("tool:email:email", "");
    const savedPassword = getLocalStorage("tool:email:password", "");
    const savedServiceId = getLocalStorage("tool:email:serviceId", "");
    const savedTemplateId = getLocalStorage("tool:email:templateId", "");
    const savedPublicKey = getLocalStorage("tool:email:publicKey", "");

    setEmail(savedEmail);
    setAppPassword(savedPassword);
    setServiceId(savedServiceId);
    setTemplateId(savedTemplateId);
    setPublicKey(savedPublicKey);
  }, []);

  // Tự động lưu cấu hình khi người dùng nhập
  useEffect(() => {
    if (email.trim()) setLocalStorage("tool:email:email", email);
    if (appPassword.trim()) setLocalStorage("tool:email:password", appPassword);
    if (serviceId.trim()) setLocalStorage("tool:email:serviceId", serviceId);
    if (templateId.trim()) setLocalStorage("tool:email:templateId", templateId);
    if (publicKey.trim()) setLocalStorage("tool:email:publicKey", publicKey);
  }, [email, appPassword, serviceId, templateId, publicKey]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !email.trim() ||
      !appPassword.trim() ||
      !serviceId.trim() ||
      !templateId.trim() ||
      !publicKey.trim()
    )
      return;
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
              Cho phép AI gửi email tự động với nội dung được tối ưu thay bạn
            </p>
          </div>
        </div>

        {/* Phần mô tả */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
          <h3 className="font-medium text-black dark:text-white mb-2">
            Mô tả chi tiết
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Công cụ Gửi Mail cho phép AI soạn và gửi email tự động thông qua tài
            khoản Gmail của bạn. Để sử dụng tính năng này, bạn cần:
            <br />
            1. Cấu hình Gmail (email và mật khẩu ứng dụng)
            <br />
            2. Cấu hình EmailJS (dịch vụ gửi email)
            <br />
            <br />
            <span className="text-blue-600 dark:text-blue-400">
              ⚠️ Quan trọng: Bạn cần hoàn tất cả hai bước cấu hình trên để có
              thể gửi email.
            </span>
          </p>
        </div>

        {/* Thêm phần giới thiệu EmailJS */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 border-l-4 border-yellow-400">
          <h3 className="font-medium text-black dark:text-white mb-2 flex items-center gap-2">
            <IconInfoCircle size={20} className="text-yellow-500" />
            Về EmailJS
          </h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p>
              EmailJS là dịch vụ cho phép gửi email trực tiếp từ trình duyệt
              web. Bạn cần tạo tài khoản EmailJS (miễn phí) để:
            </p>
            <ul className="list-disc ml-4 space-y-1">
              <li>Gửi được 200 email/tháng miễn phí</li>
              <li>Tích hợp với Gmail một cách an toàn</li>
              <li>Theo dõi trạng thái gửi email</li>
            </ul>
            <div className="mt-3">
              <a
                href="https://dashboard.emailjs.com/sign-up"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                👉 Đăng ký tài khoản EmailJS tại đây
                <IconArrowRight size={16} />
              </a>
            </div>
          </div>
        </div>

        {/* Cập nhật phần hướng dẫn EmailJS */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
          <h3 className="font-medium text-black dark:text-white mb-2">
            Hướng dẫn cấu hình EmailJS
          </h3>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="space-y-1">
              <p className="font-medium">Bước 1: Tạo Email Service</p>
              <ul className="list-disc ml-4 space-y-1">
                <li>
                  Đăng nhập vào{" "}
                  <a
                    href="https://dashboard.emailjs.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    EmailJS Dashboard
                  </a>
                </li>
                <li>
                  Chọn &quot;Email Services&quot; → &quot;Add New Service&quot;
                </li>
                <li>Chọn &quot;Gmail&quot; và kết nối với tài khoản của bạn</li>
                <li>Lưu lại Service ID (dạng: service_xxxxxx)</li>
              </ul>
            </div>

            <div className="space-y-1">
              <p className="font-medium">Bước 2: Tạo Email Template</p>
              <ul className="list-disc ml-4 space-y-1">
                <li>
                  Vào mục &quot;Email Templates&quot; → &quot;Create New
                  Template&quot;
                </li>
                <li>
                  Sử dụng các biến: {`{{ to_email }}`}, {`{{ from_email }}`},{" "}
                  {`{{ subject }}`}, {`{{ message }}`}
                </li>
                <li>Lưu lại Template ID (dạng: template_xxxxxx)</li>
              </ul>
            </div>

            <div className="space-y-1">
              <p className="font-medium">Bước 3: Lấy Public Key</p>
              <ul className="list-disc ml-4 space-y-1">
                <li>Vào &quot;Account&quot; → &quot;API Keys&quot;</li>
                <li>Sao chép Public Key (dạng: user_xxxxxx)</li>
              </ul>
            </div>

            <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
              <p className="text-blue-600 dark:text-blue-400">
                💡 Xem hướng dẫn chi tiết tại:{" "}
                <a
                  href="https://www.emailjs.com/docs/tutorial/overview/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  EmailJS Documentation
                </a>
              </p>
            </div>
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
              <div>
                <p className="mb-1">
                  Mật khẩu ứng dụng là một mã gồm 16 ký tự được tạo từ cài đặt
                  bảo mật của tài khoản Google.{" "}
                  <span className="text-red-500">
                    Bạn cần bật xác thực 2 bước trước
                  </span>{" "}
                  khi có thể tạo mật khẩu ứng dụng.
                </p>
                <a
                  href="https://myaccount.google.com/apppasswords"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 underline"
                >
                  Nhấn vào đây để tạo mật khẩu ứng dụng →
                </a>
              </div>
            </div>
          </div>

          {/* Thêm các trường cấu hình EmailJS */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                EmailJS Service ID
              </label>
              <input
                type="text"
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                placeholder="VD: service_xxxxxxx"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                EmailJS Template ID
              </label>
              <input
                type="text"
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                placeholder="VD: template_xxxxxxx"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                EmailJS Public Key
              </label>
              <input
                type="text"
                value={publicKey}
                onChange={(e) => setPublicKey(e.target.value)}
                placeholder="VD: XYZ123..."
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            * Cấu hình sẽ được tự động lưu khi bạn nhập
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
                disabled={
                  !email.trim() ||
                  !appPassword.trim() ||
                  !serviceId.trim() ||
                  !templateId.trim() ||
                  !publicKey.trim()
                }
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                  email.trim() &&
                  appPassword.trim() &&
                  serviceId.trim() &&
                  templateId.trim() &&
                  publicKey.trim()
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
