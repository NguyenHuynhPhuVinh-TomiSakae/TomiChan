import { useState } from "react";
import { Message } from "../types";
import { chatDB } from "../utils/db";

export function useMessageActions(
  messages: Message[],
  setMessages: (messages: Message[]) => void,
  chatId?: string
) {
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const handleCopy = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => {
        setCopiedMessageId(null);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleEdit = async (messageId: string, newContent: string) => {
    const updatedMessages = messages.map((msg) =>
      msg.id === messageId ? { ...msg, content: newContent } : msg
    );

    setMessages(updatedMessages);

    // Cập nhật trong IndexedDB
    if (chatId) {
      const chat = await chatDB.getChat(chatId);
      if (chat) {
        chat.messages = updatedMessages;
        chat.updatedAt = new Date();
        await chatDB.saveChat(chat);
      }
    }
  };

  const handleDelete = async (messageId: string) => {
    // Xóa tin nhắn khỏi UI
    const updatedMessages = messages.filter((msg) => msg.id !== messageId);
    setMessages(updatedMessages);

    // Cập nhật trong IndexedDB
    if (chatId) {
      const chat = await chatDB.getChat(chatId);
      if (chat) {
        chat.messages = updatedMessages;
        chat.updatedAt = new Date();
        // Nếu không còn tin nhắn nào, xóa toàn bộ chat
        if (updatedMessages.length === 0) {
          await chatDB.deleteChat(chatId);
        } else {
          await chatDB.saveChat(chat);
        }
      }
    }
  };

  return {
    copiedMessageId,
    handleCopy,
    handleEdit,
    handleDelete,
  };
}
