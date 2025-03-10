"use client";
import TomiChat from "../components/TomiChat";
import ChatInput from "../components/ChatInput";
import Sidebar from "../components/Sidebar";
import React from "react";
import ChatMessages from "../components/ChatMessages";
import Header from "../components/Header";
import { useThemeContext } from "../providers/ThemeProvider";
import { useGemini } from "../hooks/useGemini";

export default function Home() {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const { theme, setTheme } = useThemeContext();
  const { messages, sendMessage, clearMessages } = useGemini();

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleNewChat = () => {
    console.log("Tạo cuộc trò chuyện mới");
    clearMessages();
  };

  return (
    <div className="flex min-h-screen bg-white dark:bg-black">
      <Sidebar
        onNewChat={handleNewChat}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
        messages={messages}
        theme={theme}
        onThemeChange={setTheme}
      />
      <main
        className={`flex-1 ${
          messages.length > 0 ? (isCollapsed ? "ml-16" : "ml-64") : ""
        } transition-all duration-300 text-black dark:text-white`}
      >
        {messages.length === 0 ? (
          <>
            <Header isCollapsed={isCollapsed} />
            <div className="h-screen flex flex-col justify-center items-center">
              <TomiChat />
              <div className="w-full max-w-4xl mx-auto p-4">
                <ChatInput onSendMessage={sendMessage} />
              </div>
            </div>
          </>
        ) : (
          <>
            <Header isCollapsed={isCollapsed} />
            <div className="w-full max-w-4xl mx-auto flex-1 pb-126 pt-20">
              <ChatMessages messages={messages} />
            </div>

            <div
              className="fixed bottom-0 right-0 bg-white dark:bg-black transition-all duration-300"
              style={{ left: isCollapsed ? "64px" : "256px" }}
            >
              <div className="w-full max-w-4xl mx-auto p-4">
                <ChatInput
                  onSendMessage={sendMessage}
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
