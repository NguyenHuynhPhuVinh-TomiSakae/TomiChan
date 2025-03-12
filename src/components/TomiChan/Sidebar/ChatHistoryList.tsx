import React, { useState, useEffect } from "react";
import { IconEdit, IconTrash, IconDotsVertical } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatHistory } from "../../../types";
import Portal from "../../Portal";
import Image from "next/image";

interface ChatHistoryListProps {
  isCollapsed: boolean;
  isFirstRender: boolean;
  chatHistory: ChatHistory[];
  currentChatId?: string;
  onSelectChat: (chatId: string) => void;
  onDeleteChat?: (chatId: string) => void;
  onEditChatTitle?: (chatId: string, newTitle: string) => void;
  onUpdateTrigger: () => void;
}

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function DeleteModal({ isOpen, onClose, onConfirm }: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
        <div className="bg-white dark:bg-black rounded-lg w-full max-w-md p-6 relative text-black dark:text-white dark:border dark:border-white">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Xác nhận xóa</h2>
          </div>

          <div className="mb-4">
            <p className="text-gray-600 dark:text-gray-400">
              Bạn có chắc muốn xóa cuộc trò chuyện này?
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors cursor-pointer"
            >
              Xóa
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}

interface ChatGroupProps {
  title: string;
  chats: ChatHistory[];
  currentChatId?: string;
  editingChatId: string | null;
  editTitle: string;
  onSelectChat: (chatId: string) => void;
  onEditSubmit: (chatId: string, e: React.FormEvent) => void;
  onEditClick: (chat: ChatHistory, e: React.MouseEvent) => void;
  onDeleteClick: (chatId: string, e: React.MouseEvent) => void;
  setEditTitle: (title: string) => void;
  setEditingChatId: (id: string | null) => void;
}

function ChatGroup({
  title,
  chats,
  currentChatId,
  editingChatId,
  editTitle,
  onSelectChat,
  onEditSubmit,
  onEditClick,
  onDeleteClick,
  setEditTitle,
  setEditingChatId,
}: ChatGroupProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".menu-container")) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Map provider to icon path
  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case "google":
        return "/google-logo.svg";
      case "groq":
        return "/groq-logo.svg";
      case "openrouter":
        return "/openrouter-logo.png";
      default:
        return "/google-logo.svg"; // Default icon
    }
  };

  if (chats.length === 0) return null;

  return (
    <>
      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 border-b border-gray-200 dark:border-gray-800 pb-2">
        {title}
      </div>
      <div className="space-y-2">
        {chats.map((chat) => (
          <div key={chat.id} className="group relative">
            {editingChatId === chat.id ? (
              <form
                onSubmit={(e) => onEditSubmit(chat.id, e)}
                className="w-full p-2 bg-gray-100 dark:bg-gray-900 rounded-lg"
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
              <div className="flex">
                <div
                  onClick={() => onSelectChat(chat.id)}
                  className={`w-full p-2 text-left rounded-lg transition-colors flex items-center cursor-pointer ${
                    currentChatId === chat.id
                      ? "bg-gray-200 dark:bg-gray-800"
                      : "hover:bg-gray-100 dark:hover:bg-gray-900"
                  }`}
                >
                  {/* Display provider icon */}
                  {chat.provider && (
                    <div className="flex-shrink-0 mr-2">
                      <Image
                        src={getProviderIcon(chat.provider)}
                        alt={chat.provider}
                        width={16}
                        height={16}
                        className="w-4 h-4"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0 max-w-[200px]">
                    <div className="truncate text-sm">{chat.title}</div>
                    <div className="truncate text-xs text-gray-500">
                      {new Date(chat.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex-shrink-0 relative ml-2 w-8 menu-container">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === chat.id ? null : chat.id);
                      }}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded cursor-pointer md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                    >
                      <IconDotsVertical size={16} />
                    </button>
                    {openMenuId === chat.id && (
                      <div
                        className="absolute right-0 mt-1 py-1 w-32 bg-white dark:bg-black rounded-lg shadow-lg border dark:border-white z-10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={(e) => {
                            onEditClick(chat, e);
                            setOpenMenuId(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-900 flex items-center gap-2 cursor-pointer"
                        >
                          <IconEdit size={16} />
                          <span>Sửa</span>
                        </button>
                        <button
                          onClick={(e) => {
                            onDeleteClick(chat.id, e);
                            setOpenMenuId(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-900 flex items-center gap-2 text-red-500 cursor-pointer"
                        >
                          <IconTrash size={16} />
                          <span>Xóa</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

export default function ChatHistoryList({
  isCollapsed,
  isFirstRender,
  chatHistory,
  currentChatId,
  onSelectChat,
  onDeleteChat,
  onEditChatTitle,
  onUpdateTrigger,
}: ChatHistoryListProps) {
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);

  const handleEditClick = (chat: ChatHistory, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditTitle(chat.title);
  };

  const handleEditSubmit = async (chatId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (onEditChatTitle && editTitle.trim()) {
      await onEditChatTitle(chatId, editTitle.trim());
      setEditingChatId(null);
      onUpdateTrigger();
    }
  };

  const handleDeleteClick = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChatToDelete(chatId);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (onDeleteChat && chatToDelete) {
      await onDeleteChat(chatToDelete);
      onUpdateTrigger();
    }
    setDeleteModalOpen(false);
    setChatToDelete(null);
  };

  const groupChats = (chats: ChatHistory[]) => {
    const today = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = 7 * oneDay;
    const oneMonth = 30 * oneDay;

    const yesterday = new Date(today.getTime() - oneDay);

    return {
      today: chats.filter(
        (chat) =>
          new Date(chat.updatedAt).toDateString() === today.toDateString()
      ),
      yesterday: chats.filter(
        (chat) =>
          new Date(chat.updatedAt).toDateString() === yesterday.toDateString()
      ),
      thisWeek: chats.filter(
        (chat) =>
          new Date(chat.updatedAt).getTime() > today.getTime() - oneWeek &&
          new Date(chat.updatedAt).toDateString() !== today.toDateString() &&
          new Date(chat.updatedAt).toDateString() !== yesterday.toDateString()
      ),
      thisMonth: chats.filter(
        (chat) =>
          new Date(chat.updatedAt).getTime() > today.getTime() - oneMonth &&
          new Date(chat.updatedAt).getTime() <= today.getTime() - oneWeek
      ),
      older: chats.filter(
        (chat) =>
          new Date(chat.updatedAt).getTime() <= today.getTime() - oneMonth
      ),
    };
  };

  const groupedChats = groupChats(chatHistory);

  return (
    <AnimatePresence mode="wait">
      {!isCollapsed && (
        <motion.div
          initial={isFirstRender ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0 } }}
          transition={{ delay: 0.3 }}
          className="flex flex-col h-full"
        >
          <div className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-4 px-2">
            Lịch sử trò chuyện
          </div>
          <div className="space-y-2 overflow-y-auto px-2 flex-1 thin-scrollbar">
            <ChatGroup
              title="Hôm nay"
              chats={groupedChats.today}
              currentChatId={currentChatId}
              editingChatId={editingChatId}
              editTitle={editTitle}
              onSelectChat={onSelectChat}
              onEditSubmit={handleEditSubmit}
              onEditClick={handleEditClick}
              onDeleteClick={handleDeleteClick}
              setEditTitle={setEditTitle}
              setEditingChatId={setEditingChatId}
            />
            <ChatGroup
              title="Hôm qua"
              chats={groupedChats.yesterday}
              currentChatId={currentChatId}
              editingChatId={editingChatId}
              editTitle={editTitle}
              onSelectChat={onSelectChat}
              onEditSubmit={handleEditSubmit}
              onEditClick={handleEditClick}
              onDeleteClick={handleDeleteClick}
              setEditTitle={setEditTitle}
              setEditingChatId={setEditingChatId}
            />
            <ChatGroup
              title="Tuần này"
              chats={groupedChats.thisWeek}
              currentChatId={currentChatId}
              editingChatId={editingChatId}
              editTitle={editTitle}
              onSelectChat={onSelectChat}
              onEditSubmit={handleEditSubmit}
              onEditClick={handleEditClick}
              onDeleteClick={handleDeleteClick}
              setEditTitle={setEditTitle}
              setEditingChatId={setEditingChatId}
            />
            <ChatGroup
              title="Tháng này"
              chats={groupedChats.thisMonth}
              currentChatId={currentChatId}
              editingChatId={editingChatId}
              editTitle={editTitle}
              onSelectChat={onSelectChat}
              onEditSubmit={handleEditSubmit}
              onEditClick={handleEditClick}
              onDeleteClick={handleDeleteClick}
              setEditTitle={setEditTitle}
              setEditingChatId={setEditingChatId}
            />
            <ChatGroup
              title="Cũ hơn"
              chats={groupedChats.older}
              currentChatId={currentChatId}
              editingChatId={editingChatId}
              editTitle={editTitle}
              onSelectChat={onSelectChat}
              onEditSubmit={handleEditSubmit}
              onEditClick={handleEditClick}
              onDeleteClick={handleDeleteClick}
              setEditTitle={setEditTitle}
              setEditingChatId={setEditingChatId}
            />
          </div>
          <DeleteModal
            isOpen={deleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            onConfirm={handleConfirmDelete}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
