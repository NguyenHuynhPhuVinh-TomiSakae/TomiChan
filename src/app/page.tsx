"use client";
import TomiChat from "../components/TomiChan/TomiChat";
import ChatInput from "../components/TomiChan/ChatInput";
import Sidebar from "../components/TomiChan/Sidebar/Sidebar";
import React from "react";
import ChatMessages from "../components/TomiChan/ChatMessages";
import Header from "../components/TomiChan/Header";
import { useThemeContext } from "../providers/ThemeProvider";
import { useChatProvider } from "../hooks/useChatProvider";
import { v4 as uuidv4 } from "uuid";
import { chatDB } from "../utils/db";
import { useMediaQuery } from "react-responsive";
import LoadingScreen from "../components/TomiChan/LoadingScreen";
import { getLocalStorage, setLocalStorage } from "@/utils/localStorage";

export default function Home() {
  const [isCollapsed, setIsCollapsed] = React.useState(true);
  const { theme, setTheme } = useThemeContext();
  const [currentChatId, setCurrentChatId] = React.useState<string>(uuidv4());
  const [selectedProvider, setSelectedProvider] = React.useState(() => {
    return getLocalStorage("selected_provider", "google");
  });
  const { messages, sendMessage, clearMessages, isLoading, stopGeneration } =
    useChatProvider(currentChatId, selectedProvider);
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [showLoading, setShowLoading] = React.useState(true);

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleNewChat = () => {
    const newChatId = uuidv4();
    setCurrentChatId(newChatId);
    clearMessages();
    if (isMobile) {
      handleToggleCollapse();
    }
  };

  const handleSelectChat = async (chatId: string) => {
    const chat = await chatDB.getChat(chatId);

    if (chat && chat.provider && chat.provider !== selectedProvider) {
      setSelectedProvider(chat.provider);
      setLocalStorage("selected_provider", chat.provider);
    }

    setCurrentChatId(chatId);
  };

  const handleDeleteChat = async (chatId: string) => {
    await chatDB.deleteChat(chatId);
    if (currentChatId === chatId) {
      handleNewChat();
    }
  };

  const handleEditChatTitle = async (chatId: string, newTitle: string) => {
    const chat = await chatDB.getChat(chatId);
    if (chat) {
      chat.title = newTitle;
      chat.updatedAt = new Date();
      await chatDB.saveChat(chat);
    }
  };

  const handleProviderChange = (provider: string) => {
    setSelectedProvider(provider);
    const newChatId = uuidv4();
    setCurrentChatId(newChatId);
    clearMessages();
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
        {messages.length === 0 && !isMobile ? (
          <>
            <Header
              isCollapsed={isCollapsed}
              isMobile={isMobile}
              onToggleCollapse={handleToggleCollapse}
              onProviderChange={handleProviderChange}
              selectedProvider={selectedProvider}
            />
            <div className="h-screen flex flex-col justify-center items-center">
              <TomiChat />
              <div className="w-full max-w-4xl mx-auto p-4">
                <ChatInput
                  onSendMessage={sendMessage}
                  onPlusClick={handleNewChat}
                  onStopGeneration={stopGeneration}
                  isGenerating={isLoading}
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <Header
              isCollapsed={isCollapsed}
              isMobile={isMobile}
              onToggleCollapse={handleToggleCollapse}
              onProviderChange={handleProviderChange}
              selectedProvider={selectedProvider}
            />
            {messages.length > 0 ? (
              <div className="w-full max-w-4xl mx-auto flex-1 pb-32 sm:pb-126 pt-20">
                <ChatMessages messages={messages} isLoading={isLoading} />
              </div>
            ) : (
              <div className="h-screen flex flex-col justify-center items-center">
                <TomiChat />
              </div>
            )}
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
                  onStopGeneration={stopGeneration}
                  isGenerating={isLoading}
                />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
