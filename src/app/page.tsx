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
    <div className="flex min-h-screen bg-white dark:bg-black overflow-x-hidden">
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
        className={`relative transition-all duration-300 text-black dark:text-white min-h-screen overflow-x-hidden
          ${
            !isMobile
              ? isCollapsed
                ? "ml-16 w-[calc(100%-4rem)]"
                : isMagicMode
                ? "ml-[70vw] w-[30vw]"
                : "ml-64 w-[calc(100%-16rem)]"
              : "w-full"
          }`}
      >
        {messages.length === 0 ? (
          <>
            <Header
              isCollapsed={isCollapsed}
              isMobile={isMobile}
              onToggleCollapse={handleToggleCollapse}
              onProviderChange={handleProviderChange}
              selectedProvider={selectedProvider}
              isMagicMode={isMagicMode}
            />
            <div className="min-h-screen flex flex-col justify-center items-center">
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
            <div
              className={`w-full max-w-4xl mx-auto flex-1 pb-[22vh] pt-20
              ${isMagicMode ? "sm:pb-[30vh]" : "sm:pb-[70vh]"}
              `}
            >
              <ChatMessages
                messages={messages}
                isLoading={isLoading}
                chatId={currentChatId}
                setMessages={setMessages}
                onRegenerate={handleRegenerate}
                onScrollButtonStateChange={setShowScrollButton}
              />
            </div>
            <div
              className={`fixed bottom-0 bg-white dark:bg-black transition-all duration-300
                ${
                  !isMobile
                    ? isCollapsed
                      ? "left-16 w-[calc(100%-4rem)]"
                      : isMagicMode
                      ? "left-[70vw] w-[30vw]"
                      : "left-64 w-[calc(100%-16rem)]"
                    : "left-0 w-full"
                }`}
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
