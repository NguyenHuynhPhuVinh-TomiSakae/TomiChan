import React, { useState } from "react";
import {
  IconMessage,
  IconSettings,
  IconLayoutSidebarLeftCollapse,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";
import { Message } from "../types";
import SettingsModal from "./SettingsModal";
import { chatDB, ChatHistory } from "../utils/db";

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
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [updateTrigger, setUpdateTrigger] = useState(0);

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

  const handleEditClick = (chat: ChatHistory, e: React.MouseEvent) => {
    e.stopPropagation(); // Ngăn việc chọn chat
    setEditingChatId(chat.id);
    setEditTitle(chat.title);
  };

  const handleEditSubmit = async (chatId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (onEditChatTitle && editTitle.trim()) {
      await onEditChatTitle(chatId, editTitle.trim());
      setEditingChatId(null);
      setUpdateTrigger((prev) => prev + 1);
    }
  };

  const handleDeleteClick = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      onDeleteChat &&
      window.confirm("Bạn có chắc muốn xóa cuộc trò chuyện này?")
    ) {
      await onDeleteChat(chatId);
      setUpdateTrigger((prev) => prev + 1);
    }
  };

  return (
    <div
      className={`${isCollapsed ? "w-16" : "w-64"} ${
        messages.length > 0 ? "fixed" : "relative"
      } left-0 top-0 bottom-0 bg-white dark:bg-black border-r border-black dark:border-white flex flex-col transition-all duration-300 text-black dark:text-white`}
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
                  isFirstRender ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }
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
      <div className="flex-grow overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={isFirstRender ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0 } }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                Lịch sử trò chuyện
              </div>
              {chatHistory.map((chat) => (
                <div key={chat.id} className="group relative">
                  {editingChatId === chat.id ? (
                    <form
                      onSubmit={(e) => handleEditSubmit(chat.id, e)}
                      className="w-full p-2 bg-gray-100 dark:bg-gray-800 rounded-lg"
                    >
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full bg-transparent border-none focus:outline-none text-sm"
                        autoFocus
                        onBlur={() => setEditingChatId(null)}
                      />
                    </form>
                  ) : (
                    <button
                      onClick={() => onSelectChat(chat.id)}
                      className={`w-full p-2 text-left rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-between ${
                        currentChatId === chat.id
                          ? "bg-gray-100 dark:bg-gray-800"
                          : ""
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="truncate text-sm">{chat.title}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(chat.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleEditClick(chat, e)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                        >
                          <IconEdit size={16} />
                        </button>
                        <button
                          onClick={(e) => handleDeleteClick(chat.id, e)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-red-500"
                        >
                          <IconTrash size={16} />
                        </button>
                      </div>
                    </button>
                  )}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
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
                  isFirstRender ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }
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
  );
}
