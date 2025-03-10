"use client";
import TomiChat from "../components/TomiChat";
import ChatInput from "../components/ChatInput";
import Sidebar from "../components/Sidebar";
import React from "react";
import ChatMessages from "../components/ChatMessages";
import { Message } from "../types";

export default function Home() {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([]);

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleSendMessage = (message: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content: message,
      sender: "user",
    };
    setMessages((prev) => [...prev, newMessage]);

    // Giả lập phản hồi từ bot
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "Đây là phản hồi tự động từ bot.",
        sender: "bot",
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 1000);
  };

  const handleNewChat = () => {
    console.log("Tạo cuộc trò chuyện mới");
    // Xử lý tạo chat mới ở đây
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar
        onNewChat={handleNewChat}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
        messages={messages}
      />
      <main
        className={`flex-1 ${
          messages.length > 0 ? (isCollapsed ? "ml-16" : "ml-64") : ""
        } transition-all duration-300`}
      >
        {messages.length === 0 ? (
          <div className="h-screen flex flex-col justify-center items-center">
            <TomiChat />
            <div className="w-full max-w-4xl mx-auto p-4">
              <ChatInput onSendMessage={handleSendMessage} />
            </div>
          </div>
        ) : (
          <>
            <div className="w-full max-w-4xl mx-auto flex-1 pb-126">
              <ChatMessages messages={messages} />
            </div>

            <div
              className="fixed bottom-0 right-0 bg-white transition-all duration-300"
              style={{ left: isCollapsed ? "64px" : "256px" }}
            >
              <div className="w-full max-w-4xl mx-auto p-4">
                <ChatInput
                  onSendMessage={handleSendMessage}
                  onPlusClick={handleNewChat}
                />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
