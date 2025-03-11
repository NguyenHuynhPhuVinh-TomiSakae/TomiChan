"use client";
import TomiChat from "../components/TomiChan/TomiChat";
import ChatInput from "../components/TomiChan/ChatInput";
import Sidebar from "../components/TomiChan/Sidebar/Sidebar";
import React from "react";
import ChatMessages from "../components/TomiChan/ChatMessages";
import Header from "../components/TomiChan/Header";
import { useThemeContext } from "../providers/ThemeProvider";
import { useGemini } from "../hooks/useGemini";
import { v4 as uuidv4 } from "uuid";
import { chatDB } from "../utils/db";
import { useMediaQuery } from "react-responsive";
import LoadingScreen from "../components/TomiChan/LoadingScreen";

export default function Home() {
  const [isCollapsed, setIsCollapsed] = React.useState(true);
  const { theme, setTheme } = useThemeContext();
  const [currentChatId, setCurrentChatId] = React.useState<string>(uuidv4());
  const { messages, sendMessage, clearMessages, isLoading } =
    useGemini(currentChatId);
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [showLoading, setShowLoading] = React.useState(true);

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleNewChat = () => {
    const newChatId = uuidv4();
    setCurrentChatId(newChatId);
    clearMessages();
  };

  const handleSelectChat = async (chatId: string) => {
    setCurrentChatId(chatId);
    // clearMessages() sẽ được gọi tự động thông qua useEffect trong useGemini
  };

  const handleDeleteChat = async (chatId: string) => {
    await chatDB.deleteChat(chatId);
    if (currentChatId === chatId) {
      handleNewChat(); // Tạo chat mới nếu xóa chat hiện tại
    }
  };

  const handleEditChatTitle = async (chatId: string, newTitle: string) => {
    const chat = await chatDB.getChat(chatId);
    if (chat) {
      chat.title = newTitle;
      chat.updatedAt = new Date(); // Cập nhật thời gian
      await chatDB.saveChat(chat);
    }
  };

  if (showLoading) {
    return <LoadingScreen onLoadingComplete={() => setShowLoading(false)} />;
  }

  return (
    <div className="flex min-h-screen bg-white dark:bg-black">
      <Sidebar
        onNewChat={handleNewChat}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
        messages={messages}
        theme={theme}
        onThemeChange={setTheme}
        currentChatId={currentChatId}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        onEditChatTitle={handleEditChatTitle}
      />
      <main
        className={`flex-1 transition-all duration-300 text-black dark:text-white
          ${
            messages.length > 0
              ? !isMobile
                ? isCollapsed
                  ? "sm:ml-16"
                  : "sm:ml-64"
                : "ml-0"
              : ""
          } ${isMobile ? "w-full" : ""}`}
      >
        {messages.length === 0 ? (
          <>
            <Header
              isCollapsed={isCollapsed}
              isMobile={isMobile}
              onToggleCollapse={handleToggleCollapse}
            />
            <div className="h-screen flex flex-col justify-center items-center">
              <TomiChat />
              <div className="w-full max-w-4xl mx-auto p-4">
                <ChatInput onSendMessage={sendMessage} />
              </div>
            </div>
          </>
        ) : (
          <>
            <Header
              isCollapsed={isCollapsed}
              isMobile={isMobile}
              onToggleCollapse={handleToggleCollapse}
            />
            <div className="w-full max-w-4xl mx-auto flex-1 pb-126 pt-20">
              <ChatMessages messages={messages} isLoading={isLoading} />
            </div>

            <div
              className="fixed bottom-0 right-0 bg-white dark:bg-black transition-all duration-300 w-full sm:w-auto"
              style={{
                left: isMobile ? 0 : isCollapsed ? "64px" : "256px",
              }}
            >
              <div className="w-full max-w-4xl mx-auto p-2 sm:p-4">
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
