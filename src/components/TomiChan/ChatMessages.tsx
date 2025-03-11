import React, { useEffect, useState, useRef } from "react";
import { Message } from "../../types";
import { IconArrowDown } from "@tabler/icons-react";
import { motion } from "framer-motion";
import Markdown from "../Markdown";
import { useMediaQuery } from "react-responsive";

interface ChatMessagesProps {
  messages: Message[];
  isLoading?: boolean;
}

export default function ChatMessages({
  messages,
  isLoading,
}: ChatMessagesProps) {
  const [showScrollButton, setShowScrollButton] = useState(false);
  const prevMessagesLengthRef = useRef(0);
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  };

  const checkIfAtBottom = () => {
    return (
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 100
    );
  };

  useEffect(() => {
    const handleScroll = () => {
      const isNearBottom = checkIfAtBottom();
      setShowScrollButton(!isNearBottom);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // So sánh số lượng tin nhắn để biết có tin nhắn mới không
    if (messages.length > prevMessagesLengthRef.current) {
      // Tìm tin nhắn mới nhất được thêm vào
      const newMessages = messages.slice(prevMessagesLengthRef.current);

      // Kiểm tra xem có tin nhắn nào từ user không
      const hasUserMessage = newMessages.some((msg) => msg.sender === "user");

      if (hasUserMessage) {
        // Cuộn xuống khi có tin nhắn mới từ user
        setTimeout(() => {
          scrollToBottom();
        }, 0);
      }
    }

    // Cập nhật số lượng tin nhắn hiện tại
    prevMessagesLengthRef.current = messages.length;
  }, [messages]);

  return (
    <div className="w-full relative">
      <div className="w-full space-y-4 py-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-3 py-2 sm:px-6 sm:py-3 ${
                message.sender === "user"
                  ? "bg-gray-100 dark:bg-gray-900 text-black dark:text-white mx-4 sm:mx-8 rounded-tl-2xl rounded-bl-2xl rounded-br-2xl sm:rounded-tl-3xl sm:rounded-bl-3xl sm:rounded-br-3xl max-w-[85%] sm:max-w-[70%]"
                  : "text-black dark:text-white w-full max-w-full"
              }`}
            >
              <div className="max-w-full overflow-x-auto thin-scrollbar">
                <div className="max-w-fit">
                  <Markdown content={message.content} />
                </div>
              </div>
              {isLoading && message === messages[messages.length - 1] && (
                <motion.div
                  className="w-4 h-4 border-2 border-black dark:border-white mt-2"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {showScrollButton && !isMobile && (
        <motion.button
          onClick={scrollToBottom}
          className="fixed bottom-16 sm:bottom-24 right-4 sm:right-24 bg-white dark:bg-black p-2 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-900 border border-black dark:border-white transition-all z-[9999] cursor-pointer"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 0.9 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            animate={{ y: [0, 3, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <IconArrowDown size={16} stroke={1.5} />
          </motion.div>
        </motion.button>
      )}
    </div>
  );
}
