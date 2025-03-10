import React, { useEffect, useState, useRef } from "react";
import { Message } from "../types";
import { IconArrowDown } from "@tabler/icons-react";

interface ChatMessagesProps {
  messages: Message[];
}

export default function ChatMessages({ messages }: ChatMessagesProps) {
  const [showScrollButton, setShowScrollButton] = useState(false);
  const prevMessagesLengthRef = useRef(0);

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
              className={`max-w-[70%] px-6 py-3 ${
                message.sender === "user"
                  ? "bg-gray-100 dark:bg-gray-900 text-black dark:text-white mx-8 rounded-tl-3xl rounded-bl-3xl rounded-br-3xl"
                  : "text-black dark:text-white"
              } whitespace-pre-wrap break-words`}
            >
              {message.content}
            </div>
          </div>
        ))}
      </div>

      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-24 right-8 bg-white dark:bg-black p-2 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-900 border border-black dark:border-white transition-all z-[9999] cursor-pointer"
        >
          <IconArrowDown size={24} stroke={1.5} />
        </button>
      )}
    </div>
  );
}
