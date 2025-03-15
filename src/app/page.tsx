"use client";
import TomiChat from "../components/TomiChan/TomiChat";
import ChatInput from "../components/TomiChan/ChatInput/ChatInput";
import Sidebar from "../components/TomiChan/Sidebar/Sidebar";
import React, { useState } from "react";
import ChatMessages from "../components/TomiChan/ChatMessages/ChatMessages";
import Header from "../components/TomiChan/Header";
import { useThemeContext } from "../providers/ThemeProvider";
import { useChatProvider } from "../hooks/chats/useChatProvider";
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
  const {
    messages,
    sendMessage,
    clearMessages,
    isLoading,
    stopGeneration,
    setMessages,
    regenerateMessage,
  } = useChatProvider(currentChatId, selectedProvider);
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [showLoading, setShowLoading] = React.useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isMagicMode, setIsMagicMode] = useState(false);

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleNewChat = () => {
    if (isLoading) {
      stopGeneration();
    }
    const newChatId = uuidv4();
    setCurrentChatId(newChatId);
    clearMessages();
    if (isMobile) {
      handleToggleCollapse();
    }
  };

  const handleSelectChat = async (chatId: string) => {
    if (isLoading) {
      stopGeneration();
    }
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
    if (isLoading) {
      stopGeneration();
    }
    setSelectedProvider(provider);
    const newChatId = uuidv4();
    setCurrentChatId(newChatId);
    clearMessages();
  };

  const handleRegenerate = async (messageId: string) => {
    await regenerateMessage(messageId);
  };

  const handleToggleMagicMode = () => {
    setIsMagicMode(!isMagicMode);
    if (isCollapsed) {
      handleToggleCollapse();
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
        isMagicMode={isMagicMode}
        onToggleMagicMode={handleToggleMagicMode}
      />
      <main
        className={`flex-1 transition-all duration-300 text-black dark:text-white
          ${
            messages.length > 0
              ? !isMobile
                ? isCollapsed
                  ? "sm:ml-16"
                  : isMagicMode
                  ? "sm:ml-[70vw]"
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
              isMagicMode={isMagicMode}
            />
            <div className="h-screen flex flex-col justify-center items-center">
              <TomiChat isMagicMode={isMagicMode} />
              <div className="w-full max-w-4xl mx-auto p-4">
                <ChatInput
                  onSendMessage={sendMessage}
                  onImagesUpload={() => {}}
                  onFilesUpload={() => {}}
                  onVideosUpload={() => {}}
                  onAudiosUpload={() => {}}
                  onStopGeneration={stopGeneration}
                  isGenerating={isLoading}
                  selectedProvider={selectedProvider}
                  showScrollButton={showScrollButton}
                  isMagicMode={isMagicMode}
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
              isMagicMode={isMagicMode}
            />
            {messages.length > 0 ? (
              <div className="w-full max-w-4xl mx-auto flex-1 pb-[22vh] sm:pb-[70vh] pt-20">
                <ChatMessages
                  messages={messages}
                  isLoading={isLoading}
                  chatId={currentChatId}
                  setMessages={setMessages}
                  onRegenerate={handleRegenerate}
                  onScrollButtonStateChange={setShowScrollButton}
                />
              </div>
            ) : (
              <div className="h-screen flex flex-col justify-center items-center">
                <TomiChat />
              </div>
            )}
            <div
              className="fixed bottom-0 right-0 bg-white dark:bg-black transition-all duration-300 w-full sm:w-auto"
              style={{
                left: isMobile
                  ? 0
                  : isCollapsed
                  ? "64px"
                  : isMagicMode
                  ? "70vw"
                  : "256px",
              }}
            >
              <div className="w-full max-w-4xl mx-auto p-2 sm:p-4">
                <ChatInput
                  onSendMessage={sendMessage}
                  onImagesUpload={() => {}}
                  onFilesUpload={() => {}}
                  onVideosUpload={() => {}}
                  onAudiosUpload={() => {}}
                  onStopGeneration={stopGeneration}
                  isGenerating={isLoading}
                  selectedProvider={selectedProvider}
                  showScrollButton={showScrollButton}
                  isMagicMode={isMagicMode}
                />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
