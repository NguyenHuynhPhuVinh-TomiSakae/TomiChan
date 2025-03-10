"use client";
import TomiChat from "../components/TomiChat";
import ChatInput from "../components/ChatInput";
import Sidebar from "../components/Sidebar";
import React from "react";

export default function Home() {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleSendMessage = (message: string) => {
    console.log("Tin nhắn đã gửi:", message);
    // Xử lý tin nhắn ở đây (gửi API, cập nhật state, v.v.)
  };

  const handleNewChat = () => {
    console.log("Tạo cuộc trò chuyện mới");
    // Xử lý tạo chat mới ở đây
  };

  return (
    <div className="flex">
      <Sidebar
        onNewChat={handleNewChat}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />
      <main className="flex-1 flex flex-col items-center justify-center min-h-screen bg-white p-4">
        <div className="w-full max-w-2xl flex flex-col justify-center items-center">
          <TomiChat />
          {/* Phần hiển thị tin nhắn sẽ nằm ở đây */}
          <div className="mb-4 flex-grow">
            {/* Các tin nhắn sẽ được hiển thị ở đây */}
          </div>

          <ChatInput onSendMessage={handleSendMessage} />
        </div>
      </main>
    </div>
  );
}
