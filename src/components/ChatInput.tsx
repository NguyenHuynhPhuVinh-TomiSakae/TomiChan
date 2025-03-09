"use client";
import React, { useState, useRef, useEffect } from "react";
import { IconSend2, IconPlus } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onPlusClick?: () => void;
}

export default function ChatInput({
  onSendMessage,
  onPlusClick,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [textareaHeight, setTextareaHeight] = useState(56); // Bắt đầu với chiều cao tối thiểu
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
      setTextareaHeight(56); // Reset chiều cao khi gửi tin nhắn
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    setMessage(textarea.value);

    // Cập nhật chiều cao ngay lập tức
    updateTextareaHeight(textarea);
  };

  // Tách logic cập nhật chiều cao thành hàm riêng
  const updateTextareaHeight = (
    textarea: HTMLTextAreaElement,
    reset: boolean = false
  ) => {
    // Lưu vị trí con trỏ
    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;

    // Reset chiều cao để tính toán lại
    textarea.style.height = "56px";

    // Tính toán chiều cao mới và cập nhật state
    const newHeight = Math.max(Math.min(textarea.scrollHeight, 200), 56);
    textarea.style.height = `${newHeight}px`;
    setTextareaHeight(newHeight);

    // Khôi phục vị trí con trỏ
    textarea.setSelectionRange(selectionStart, selectionEnd);

    // Nếu xóa hết nội dung, reset về chiều cao mặc định
    if (reset) {
      textarea.style.height = "56px";
      setTextareaHeight(56);
      return;
    }
  };

  // Đảm bảo chiều cao được cập nhật khi component mount và khi message thay đổi
  useEffect(() => {
    if (textareaRef.current) {
      if (message.trim()) {
        updateTextareaHeight(textareaRef.current);
      } else {
        updateTextareaHeight(textareaRef.current, true);
      }
    }
  }, [message]);

  // Đảm bảo chiều cao được cập nhật khi component mount
  useEffect(() => {
    if (textareaRef.current) {
      updateTextareaHeight(textareaRef.current);
    }
  }, []);

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className="flex flex-col w-full">
        <motion.div
          className="w-full overflow-hidden bg-white rounded-2xl border border-black"
          initial={{ height: 56 }}
          animate={{ height: textareaHeight + 48 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          <div className="w-full h-full flex flex-col">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextareaChange}
              placeholder="Nhập câu hỏi của bạn..."
              className="w-full pt-4 pb-4 px-6 focus:outline-none resize-none overflow-y min-h-[56px] max-h-[200px] bg-transparent flex-grow"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />

            {/* Layout cho các nút */}
            <div className="h-16">
              <AnimatePresence>
                <motion.button
                  type="button"
                  className="absolute left-3 bottom-3 cursor-pointer bg-gray-200 hover:bg-gray-300 rounded-full p-2"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onPlusClick) onPlusClick();
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <IconPlus size={22} className="text-white" stroke={1.5} />
                </motion.button>
              </AnimatePresence>

              <AnimatePresence>
                {message.trim() && (
                  <motion.button
                    type="submit"
                    className="absolute right-3 bottom-3 cursor-pointer rounded-full p-2"
                    disabled={!message.trim()}
                    initial={{
                      opacity: 0,
                      scale: 0.8,
                      backgroundColor: "#e5e7eb",
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      backgroundColor: "#000000",
                      transition: {
                        backgroundColor: {
                          duration: 0.25,
                          ease: "easeInOut",
                        },
                      },
                    }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <IconSend2 size={22} className="text-white" stroke={1.5} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </form>
  );
}
