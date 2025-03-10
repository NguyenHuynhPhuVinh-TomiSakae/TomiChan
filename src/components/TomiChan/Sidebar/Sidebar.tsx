import React, { useState } from "react";
import {
  IconMessage,
  IconSettings,
  IconLayoutSidebarLeftCollapse,
} from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";
import { Message, ChatHistory } from "../../../types";
import SettingsModal from "./SettingsModal";
import { chatDB } from "../../../utils/db";
import ChatHistoryList from "./ChatHistoryList";
import { useMediaQuery } from "react-responsive";

interface SidebarProps {
  onNewChat: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  messages: Message[];
  theme: "light" | "dark" | "system";
  onThemeChange: (theme: "light" | "dark" | "system") => void;
  currentChatId?: string;
  onSelectChat: (chatId: string) => void;
  onDeleteChat?: (chatId: string) => void;
  onEditChatTitle?: (chatId: string, newTitle: string) => void;
}

export default function Sidebar({
  onNewChat,
  isCollapsed,
  onToggleCollapse,
  messages,
  theme,
  onThemeChange,
  currentChatId,
  onSelectChat,
  onDeleteChat,
  onEditChatTitle,
}: SidebarProps) {
  const [isFirstRender, setIsFirstRender] = React.useState(true);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = React.useState(false);
  const [chatHistory, setChatHistory] = React.useState<ChatHistory[]>([]);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  const isMobile = useMediaQuery({ maxWidth: 768 });

  React.useEffect(() => {
    setIsFirstRender(false);
    loadChatHistory();
  }, []);

  React.useEffect(() => {
    loadChatHistory();
  }, [messages, updateTrigger]);

  const loadChatHistory = async () => {
    const history = await chatDB.getAllChats();
    setChatHistory(
      history.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    );
  };

  const handleOpenSettings = () => {
    setIsSettingsModalOpen(true);
  };

  // Thay thế phần sidebarStyle
  const sidebarStyle: React.CSSProperties = {
    position: isMobile ? "fixed" : messages.length > 0 ? "fixed" : "relative",
    width: isCollapsed
      ? isMobile
        ? "100%"
        : "4rem"
      : isMobile
      ? "100%"
      : "16rem",
    zIndex: isMobile ? 50 : 10,
    left: isMobile && isCollapsed ? "-100%" : 0,
  };

  return (
    <>
      {/* Overlay cho mobile khi sidebar mở */}
      {isMobile && !isCollapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onToggleCollapse}
        />
      )}

      <div
        className={`bg-white dark:bg-black border-r border-black dark:border-white flex flex-col transition-all duration-300 text-black dark:text-white md:rounded-r-4xl ${
          isMobile
            ? "top-0 bottom-0"
            : messages.length > 0
            ? "fixed top-0 bottom-0"
            : "relative"
        }`}
        style={sidebarStyle}
      >
        {/* Header with Title and Collapse button */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.div
                  initial={isFirstRender ? { opacity: 1 } : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0 } }}
                  transition={{ delay: 0.3 }}
                  className="font-semibold text-2xl truncate"
                >
                  TomiChan
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            onClick={onToggleCollapse}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full cursor-pointer flex-shrink-0"
          >
            <IconLayoutSidebarLeftCollapse
              size={24}
              className={isCollapsed ? "rotate-180" : ""}
            />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={onNewChat}
            className={`w-full py-2 text-black bg-white dark:bg-black hover:bg-gray-100 dark:hover:bg-gray-900 dark:text-white cursor-pointer rounded-lg flex items-center justify-center transition-colors border border-black dark:border-white ${
              isCollapsed ? "px-2" : "px-4"
            }`}
          >
            <IconMessage size={20} className="flex-shrink-0" />
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.span
                  initial={
                    isFirstRender
                      ? { opacity: 1, x: 0 }
                      : { opacity: 0, x: -10 }
                  }
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10, transition: { duration: 0 } }}
                  transition={{ delay: 0.3 }}
                  className="ml-2 truncate"
                >
                  Cuộc trò chuyện mới
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-grow overflow-hidden p-4">
          <ChatHistoryList
            isCollapsed={isCollapsed}
            isFirstRender={isFirstRender}
            chatHistory={chatHistory}
            currentChatId={currentChatId}
            onSelectChat={onSelectChat}
            onDeleteChat={onDeleteChat}
            onEditChatTitle={onEditChatTitle}
            onUpdateTrigger={() => setUpdateTrigger((prev) => prev + 1)}
          />
        </div>

        {/* Settings Button */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={handleOpenSettings}
            className={`w-full py-2 cursor-pointer text-gray-700 dark:text-gray-300 rounded-lg flex items-center hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors ${
              isCollapsed ? "px-2 justify-center" : "px-4"
            }`}
          >
            <IconSettings size={20} className="flex-shrink-0" />
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.span
                  initial={
                    isFirstRender
                      ? { opacity: 1, x: 0 }
                      : { opacity: 0, x: -10 }
                  }
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10, transition: { duration: 0 } }}
                  transition={{ delay: 0.3 }}
                  className="ml-2 truncate"
                >
                  Cài đặt
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          theme={theme}
          onThemeChange={onThemeChange}
        />
      </div>
    </>
  );
}
