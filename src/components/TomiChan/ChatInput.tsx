"use client";
import React, { useState, useRef } from "react";
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
  const [textareaHeight, setTextareaHeight] = useState(56);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
      setTextareaHeight(56);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    setMessage(textarea.value);

    textarea.style.height = "56px";
    const newHeight = Math.max(Math.min(textarea.scrollHeight, 200), 56);
    textarea.style.height = `${newHeight}px`;
    setTextareaHeight(newHeight);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className="flex flex-col w-full">
        <div className="w-full overflow-hidden bg-white dark:bg-black rounded-2xl border border-black dark:border-white">
          <div className="w-full h-full flex flex-col">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextareaChange}
              placeholder="Nhập câu hỏi của bạn..."
              className="w-full pt-4 pb-4 px-6 focus:outline-none resize-none overflow-y min-h-[56px] max-h-[200px] bg-transparent flex-grow placeholder:text-gray-500 dark:placeholder:text-gray-400"
              style={{ height: `${textareaHeight}px` }}
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
                  className="absolute left-3 bottom-10 cursor-pointer dark:hover:bg-gray-900 hover:bg-gray-100 rounded-full p-2 transition-all duration-200 border border-black dark:border-white"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onPlusClick) onPlusClick();
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <IconPlus
                    size={22}
                    className="text-black dark:text-white"
                    stroke={1.5}
                  />
                </motion.button>
              </AnimatePresence>

              <AnimatePresence>
                {message.trim() && (
                  <motion.button
                    type="submit"
                    className="absolute right-3 bottom-10 cursor-pointer rounded-full p-2 bg-black dark:bg-white"
                    disabled={!message.trim()}
                    initial={{
                      opacity: 0,
                      scale: 0.8,
                      backgroundColor: "rgb(229 231 235)", // gray-200
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      backgroundColor:
                        document.documentElement.classList.contains("dark")
                          ? "#ffffff"
                          : "#000000",
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
                    <IconSend2
                      size={22}
                      className="text-white dark:text-black"
                      stroke={1.5}
                    />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        <div className="text-center mt-2 text-sm text-gray-500">
          Đây là dự án mã nguồn mở của TomiSakae! -{" "}
          <a
            href="https://github.com/NguyenHuynhPhuVinh-TomiSakae/TomiChan"
            className="underline hover:text-gray-700"
            target="_blank"
            rel="noopener noreferrer"
          >
            Xem tại đây
          </a>
        </div>
      </div>
    </form>
  );
}
