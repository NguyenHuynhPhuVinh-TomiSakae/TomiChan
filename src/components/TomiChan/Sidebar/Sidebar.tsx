import React, { useState } from "react";
import {
  IconMessage,
  IconSettings,
  IconLayoutSidebarLeftCollapse,
  IconSparkles,
} from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";
import { Message, ChatHistory } from "../../../types";
import SettingsModal from "./SettingsModal";
import { chatDB } from "../../../utils/db";
import ChatHistoryList from "./ChatHistoryList";
import { useMediaQuery } from "react-responsive";
import { getLocalStorage, setLocalStorage } from "../../../utils/localStorage";
import Image from "next/image";
import MagicRoom from "./MagicRoom/MagicRoom";

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
  isMagicMode?: boolean;
  onToggleMagicMode?: () => void;
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
  isMagicMode = false,
  onToggleMagicMode,
}: SidebarProps) {
  const [isFirstRender, setIsFirstRender] = React.useState(true);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = React.useState(false);
  const [chatHistory, setChatHistory] = React.useState<ChatHistory[]>([]);
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [imageGeneration, setImageGeneration] = React.useState(() => {
    return getLocalStorage("image_generation", false) === "true";
  });
  const [imageConfig, setImageConfig] = React.useState(() => {
    const savedConfig = getLocalStorage("image_config", null);
    return savedConfig
      ? JSON.parse(savedConfig)
      : {
          width: 1024,
          height: 768,
          steps: 4,
          togetherApiKey: "",
        };
  });

  // Thêm state cho tìm kiếm web
  const [searchEnabled, setSearchEnabled] = React.useState(() => {
    return getLocalStorage("search_enabled", false) === "true";
  });
  const [searchConfig, setSearchConfig] = React.useState(() => {
    const savedConfig = getLocalStorage("search_config", null);
    return savedConfig
      ? JSON.parse(savedConfig)
      : {
          googleApiKey: "",
          googleCseId: "",
          numResults: 3,
          deepSearch: false,
        };
  });

  // Thêm state cho e2bApiKey
  const [e2bApiKey, setE2bApiKey] = React.useState(() => {
    return getLocalStorage("e2b_api_key", "");
  });

  // Thêm state cho e2bEnabled
  const [e2bEnabled, setE2bEnabled] = React.useState(() => {
    return getLocalStorage("e2b_enabled", false) === "true";
  });

  const isMobile = useMediaQuery({ maxWidth: 768 });

  React.useEffect(() => {
    setIsFirstRender(false);
    loadChatHistory();
    if (!isMobile && isCollapsed) {
      onToggleCollapse();
    }
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

  // Cập nhật sidebarStyle để mở rộng 70% màn hình khi ở chế độ magic
  const sidebarStyle: React.CSSProperties = {
    position: isMobile ? "fixed" : "fixed",
    width: isCollapsed
      ? isMobile
        ? "100%"
        : "4rem"
      : isMobile
      ? isMagicMode
        ? "100%"
        : "80%"
      : isMagicMode
      ? "70vw"
      : "16rem",
    zIndex: isMobile ? 50 : 10,
    left: isMobile && isCollapsed ? "-100%" : 0,
    height: "100vh",
  };

  // Thêm xử lý cho onSelectChat trong ChatHistoryList
  const handleSelectChat = (chatId: string) => {
    onSelectChat(chatId);
    if (isMobile) {
      onToggleCollapse(); // Tự động thu gọn sidebar trên mobile
    }
  };

  // Thêm handlers để cập nhật localStorage khi thay đổi cài đặt
  const handleImageGenerationChange = (enabled: boolean) => {
    setImageGeneration(enabled);
    setLocalStorage("image_generation", enabled.toString());
  };

  const handleImageConfigChange = (config: {
    width: number;
    height: number;
    steps: number;
  }) => {
    setImageConfig(config);
    setLocalStorage("image_config", JSON.stringify(config));
  };

  // Thêm handlers để cập nhật localStorage khi thay đổi cài đặt tìm kiếm
  const handleSearchEnabledChange = (enabled: boolean) => {
    setSearchEnabled(enabled);
    setLocalStorage("search_enabled", enabled.toString());
  };

  const handleSearchConfigChange = (config: {
    googleApiKey?: string;
    googleCseId?: string;
  }) => {
    setSearchConfig(config);
    setLocalStorage("search_config", JSON.stringify(config));
  };

  // Thêm hàm xử lý thay đổi e2bApiKey
  const handleE2bApiKeyChange = (apiKey: string) => {
    setE2bApiKey(apiKey);
    setLocalStorage("e2b_api_key", apiKey);
  };

  // Thêm handler cho e2bEnabled
  const handleE2bEnabledChange = (enabled: boolean) => {
    setE2bEnabled(enabled);
    setLocalStorage("e2b_enabled", enabled.toString());
  };

  const handleClearAllData = async () => {
    await chatDB.clearAllData();
    // Có thể thêm thông báo hoặc làm mới UI ở đây
    window.location.reload();
  };

  return (
    <>
      {/* Overlay cho mobile khi sidebar mở */}
      {isMobile && !isCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onToggleCollapse}
        />
      )}

      <div
        className={`bg-white dark:bg-black border-r border-black dark:border-white flex flex-col transition-all duration-300 text-black dark:text-white md:rounded-r-4xl ${
          isMobile
            ? "top-0 bottom-0"
            : messages.length > 0
            ? "fixed top-0 bottom-0"
            : "h-screen"
        }`}
        style={sidebarStyle}
      >
        {/* Header with Title and Collapse button */}
        {!isMagicMode && (
          <div className="p-4 flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                {!isCollapsed && (
                  <motion.div
                    initial={isFirstRender ? { opacity: 1 } : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0 } }}
                    transition={{ delay: 0.3 }}
                    className="font-semibold text-2xl truncate flex items-center gap-2"
                  >
                    <Image
                      src="/tomichan-icon.png"
                      alt="TomiChan"
                      width={36}
                      height={36}
                      priority
                      className="hover:rotate-[20deg] transition-transform duration-300 cursor-pointer"
                    />
                    <span className="bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-500 text-transparent bg-clip-text font-bold tracking-wide hover:scale-105 transition-transform duration-200 cursor-pointer">
                      TomiChan
                    </span>
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
        )}

        {/* Nội dung chính - Hiển thị MagicRoom hoặc Sidebar thông thường */}
        {isMagicMode && !isCollapsed ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 overflow-hidden"
          >
            <MagicRoom onToggleMagicMode={onToggleMagicMode} />
          </motion.div>
        ) : (
          <>
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
                onSelectChat={handleSelectChat}
                onDeleteChat={onDeleteChat}
                onEditChatTitle={onEditChatTitle}
                onUpdateTrigger={() => setUpdateTrigger((prev) => prev + 1)}
              />
            </div>

            {/* Magic Mode Button */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={onToggleMagicMode}
                className={`w-full py-2 cursor-pointer rounded-lg flex items-center bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 border border-purple-500/30 transition-all ${
                  isCollapsed ? "px-2 justify-center" : "px-4"
                }`}
              >
                <motion.div
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <IconSparkles
                    size={20}
                    className="flex-shrink-0 text-purple-500"
                  />
                </motion.div>
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
                      className="ml-2 truncate bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-transparent bg-clip-text font-medium"
                    >
                      Phòng ma thuật
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </>
        )}

        {/* Settings Button - Xóa phần header toggle button */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div
            className={`w-full flex ${isCollapsed ? "justify-center" : "px-4"}`}
          >
            <button
              onClick={handleOpenSettings}
              className={`flex items-center cursor-pointer ${
                isMagicMode && !isCollapsed
                  ? "hover:bg-gray-200 dark:hover:bg-gray-800 px-2 py-1 rounded transition-colors"
                  : "w-full py-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg px-2"
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
        </div>

        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          theme={theme}
          onThemeChange={onThemeChange}
          imageGeneration={imageGeneration}
          onImageGenerationChange={handleImageGenerationChange}
          imageConfig={imageConfig}
          onImageConfigChange={handleImageConfigChange}
          searchEnabled={searchEnabled}
          onSearchEnabledChange={handleSearchEnabledChange}
          searchConfig={searchConfig}
          onSearchConfigChange={handleSearchConfigChange}
          onClearAllData={handleClearAllData}
          e2bApiKey={e2bApiKey}
          onE2bApiKeyChange={handleE2bApiKeyChange}
          e2bEnabled={e2bEnabled}
          onE2bEnabledChange={handleE2bEnabledChange}
        />
      </div>
    </>
  );
}
