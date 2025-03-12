import React, { useEffect, useState, useRef } from "react";
import { Message } from "../../types";
import {
  IconArrowDown,
  IconFile,
  IconPdf,
  IconCode,
  IconFileText,
  IconPlayerPlay,
  IconVideo,
  IconMusic,
  IconCopy,
  IconEdit,
  IconTrash,
  IconCheck,
  IconRefresh,
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import Markdown from "../Markdown";
import { useMediaQuery } from "react-responsive";
import Image from "next/image";
import { useMessageActions } from "../../hooks/useMessageActions";
import DeleteConfirmModal from "./DeleteConfirmModal";
import { extractImagePrompt } from "../../lib/together";

interface ChatMessagesProps {
  messages: Message[];
  isLoading?: boolean;
  chatId?: string;
  setMessages: (messages: Message[]) => void;
  onRegenerate?: (messageId: string) => void;
}

export default function ChatMessages({
  messages,
  isLoading,
  chatId,
  setMessages,
  onRegenerate,
}: ChatMessagesProps) {
  const [showScrollButton, setShowScrollButton] = useState(false);
  const prevMessagesLengthRef = useRef(0);
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [playingVideo, setPlayingVideo] = useState<{
    messageId: string;
    videoIndex: number;
  } | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);

  const {
    copiedMessageId,
    handleCopy,
    handleEdit,
    handleDelete,
    handleRegenerate,
  } = useMessageActions(messages, setMessages, chatId, onRegenerate);

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  };

  const checkIfAtBottom = () => {
    return (
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 100
    );
  };

  useEffect(() => {
    const handleScroll = () => {
      const isNearBottom = checkIfAtBottom();
      setShowScrollButton(!isNearBottom);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // So sánh số lượng tin nhắn để biết có tin nhắn mới không
    if (messages.length > prevMessagesLengthRef.current) {
      // Tìm tin nhắn mới nhất được thêm vào
      const newMessages = messages.slice(prevMessagesLengthRef.current);

      // Kiểm tra xem có tin nhắn nào từ user không
      const hasUserMessage = newMessages.some((msg) => msg.sender === "user");

      if (hasUserMessage) {
        // Cuộn xuống khi có tin nhắn mới từ user
        setTimeout(() => {
          scrollToBottom();
        }, 0);
      }
    }

    // Cập nhật số lượng tin nhắn hiện tại
    prevMessagesLengthRef.current = messages.length;
  }, [messages]);

  // Hàm để xác định biểu tượng theo loại file
  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return <IconPdf size={20} />;
    if (
      type.includes("javascript") ||
      type.includes("python") ||
      type.includes("xml")
    )
      return <IconCode size={20} />;
    if (type.includes("text/plain") || type.includes("rtf"))
      return <IconFileText size={20} />;
    return <IconFile size={20} />;
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditContent(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight + 2}px`;
  };

  useEffect(() => {
    if (editingMessageId) {
      const textarea = document.querySelector("textarea");
      if (textarea) {
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight + 2}px`;
      }
    }
  }, [editingMessageId]);

  const renderMessage = (message: Message) => {
    // Kiểm tra xem có image prompt không
    const imagePrompt = extractImagePrompt(message.content);

    if (imagePrompt && message.sender === "bot") {
      // Lọc bỏ image prompt khỏi nội dung hiển thị
      const cleanContent = message.content.replace(
        /\[IMAGE_PROMPT\].*?\[\/IMAGE_PROMPT\]/,
        ""
      );

      // Kiểm tra xem có lỗi trong nội dung không
      const hasError = cleanContent.includes("*Lỗi:");

      return (
        <div>
          <div className="break-words">
            <Markdown content={cleanContent} />
          </div>
          {!hasError && message.images ? (
            <div className="mt-4">
              {message.images.map((image, index) => (
                <div key={index} className="relative w-full max-w-[512px] mb-2">
                  <Image
                    src={image.data}
                    alt="AI Generated Image"
                    width={512}
                    height={512}
                    className="rounded-lg"
                  />
                </div>
              ))}
            </div>
          ) : !hasError ? (
            <div className="mt-4 w-full max-w-[512px] h-[512px] bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse flex items-center justify-center">
              <span className="text-gray-500">Đang tạo ảnh...</span>
            </div>
          ) : null}
        </div>
      );
    }

    return (
      <div className="break-words">
        <Markdown content={message.content} />
      </div>
    );
  };

  return (
    <div className="w-full relative">
      <div className="w-full space-y-12">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex flex-col ${
              message.sender === "user" ? "items-end" : "items-start"
            }`}
          >
            {message.images &&
              message.images.length > 0 &&
              message.sender === "user" && (
                <div
                  className={`w-full flex mx-4 sm:mx-8 ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  } mb-2`}
                >
                  <div
                    className={`grid gap-y-1 sm:gap-1 w-fit border border-black dark:border-white rounded-lg overflow-hidden${
                      message.images.length === 1
                        ? "grid-cols-1"
                        : message.images.length === 2
                        ? "grid-cols-2"
                        : message.images.length === 3
                        ? "grid-cols-2 sm:grid-cols-3"
                        : "grid-cols-2 sm:grid-cols-4"
                    } justify-items-end`}
                  >
                    <div className="col-span-full font-medium text-sm py-1 px-2 bg-gray-100 dark:bg-gray-800 border-b border-black dark:border-white w-full">
                      Hình ảnh
                    </div>
                    {message.images.map((image, index) => (
                      <div
                        key={index}
                        className="relative w-[120px] h-[120px] sm:w-[100px] sm:h-[100px] justify-self-end m-1"
                      >
                        <Image
                          src={image.data}
                          alt={`Uploaded image ${index + 1}`}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            {message.files && message.files.length > 0 && (
              <div
                className={`w-full flex mx-4 sm:mx-8 ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                } mb-2`}
              >
                <div className="flex flex-col gap-1 w-fit border border-black dark:border-white rounded-lg overflow-hidden">
                  <div className="font-medium text-sm py-1 px-2 bg-gray-100 dark:bg-gray-800 border-b border-black dark:border-white w-full">
                    Tài liệu
                  </div>
                  <div className="p-2">
                    {message.files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900 rounded p-2"
                      >
                        <span className="text-gray-700 dark:text-gray-300">
                          {getFileIcon(file.type)}
                        </span>
                        <span className="text-xs sm:text-sm truncate max-w-[200px]">
                          {file.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {message.videos && message.videos.length > 0 && (
              <div
                className={`w-full flex mx-4 sm:mx-8 ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                } mb-2`}
              >
                <div className="w-fit border border-black dark:border-white rounded-lg overflow-hidden">
                  <div className="font-medium text-sm py-1 px-2 bg-gray-100 dark:bg-gray-800 border-b border-black dark:border-white">
                    Video
                  </div>
                  <div
                    className={`p-2 grid gap-3 ${
                      message.videos.length === 1
                        ? "grid-cols-1"
                        : message.videos.length === 2
                        ? "grid-cols-2"
                        : "grid-cols-2 sm:grid-cols-3"
                    }`}
                  >
                    {message.videos.map((video, index) => (
                      <div
                        key={index}
                        className="relative w-[200px] flex flex-col"
                      >
                        <div className="h-[150px] rounded overflow-hidden relative">
                          {playingVideo?.messageId === message.id &&
                          playingVideo?.videoIndex === index ? (
                            <video
                              src={video.data}
                              className="w-full h-full object-contain bg-gray-200 dark:bg-gray-800"
                              controls
                              autoPlay
                              onEnded={() => setPlayingVideo(null)}
                            />
                          ) : (
                            <div
                              className="w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center cursor-pointer relative"
                              onClick={() =>
                                setPlayingVideo({
                                  messageId: message.id,
                                  videoIndex: index,
                                })
                              }
                            >
                              <div className="absolute inset-0">
                                <video
                                  src={video.data}
                                  className="w-full h-full object-cover opacity-70"
                                  muted
                                  playsInline
                                />
                              </div>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-black bg-opacity-60 rounded-full p-3">
                                  <IconPlayerPlay
                                    size={24}
                                    className="text-white"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="text-xs py-1 px-1 truncate text-gray-700 dark:text-gray-300 flex items-center gap-1">
                          <IconVideo size={14} />
                          <span>
                            {video.url
                              ? video.url.split("/").pop() ||
                                `Video ${index + 1}`
                              : `Video ${index + 1}`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {message.audios && message.audios.length > 0 && (
              <div
                className={`w-full flex mx-4 sm:mx-8 ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                } mb-2`}
              >
                <div className="flex flex-col w-fit border border-black dark:border-white rounded-lg overflow-hidden">
                  <div className="font-medium text-sm py-1 px-2 bg-gray-100 dark:bg-gray-800 border-b border-black dark:border-white">
                    Âm thanh
                  </div>
                  <div className="p-2 flex flex-col gap-2">
                    {message.audios.map((audio, index) => (
                      <div
                        key={index}
                        className="flex flex-col gap-1 bg-gray-100 dark:bg-gray-900 rounded p-2 max-w-[350px]"
                      >
                        <div className="flex items-center gap-2">
                          <IconMusic
                            size={16}
                            className="text-gray-700 dark:text-gray-300"
                          />
                          <span className="text-xs sm:text-sm truncate">
                            {audio.url
                              ? audio.url.split("/").pop() ||
                                `Audio ${index + 1}`
                              : `Audio ${index + 1}`}
                          </span>
                        </div>
                        <audio
                          src={audio.data}
                          controls
                          className="w-full h-8"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div
              className={`relative group ${
                message.sender === "user"
                  ? "self-end bg-gray-100 dark:bg-gray-900 text-black dark:text-white mx-4 sm:mx-8 rounded-tl-2xl rounded-bl-2xl rounded-br-2xl sm:rounded-tl-3xl sm:rounded-bl-3xl sm:rounded-br-3xl"
                  : "self-start text-black dark:text-white w-full"
              } ${
                editingMessageId === message.id ? "!bg-transparent w-full" : ""
              }`}
            >
              {editingMessageId === message.id ? (
                <div className="flex flex-col gap-2 w-full">
                  <textarea
                    value={editContent}
                    onChange={handleTextareaChange}
                    className="w-full p-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white resize-none overflow-hidden shadow-lg"
                    autoFocus
                    style={{ height: "auto" }}
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setEditingMessageId(null)}
                      className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={() => {
                        handleEdit(message.id, editContent);
                        setEditingMessageId(null);
                      }}
                      className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors cursor-pointer"
                    >
                      Lưu
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-3 px-4">{renderMessage(message)}</div>
              )}

              {editingMessageId !== message.id &&
                extractImagePrompt(message.content) &&
                ((message.images && message.images.length > 0) ||
                  message.content.includes("*Lỗi:")) &&
                !isLoading && (
                  <div
                    className={`absolute flex gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity ${
                      message.sender === "user"
                        ? "right-0 -bottom-8"
                        : isMobile
                        ? "left-2 -bottom-2"
                        : "left-4 -bottom-2"
                    }`}
                  >
                    {message.sender !== "user" && (
                      <button
                        className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                        onClick={() => handleRegenerate(message.id)}
                      >
                        <IconRefresh
                          size={16}
                          className="text-gray-600 dark:text-gray-400"
                        />
                      </button>
                    )}
                    <button
                      className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                      onClick={() => handleCopy(message.content, message.id)}
                    >
                      {copiedMessageId === message.id ? (
                        <IconCheck
                          size={16}
                          className="text-green-600 dark:text-green-400"
                        />
                      ) : (
                        <IconCopy
                          size={16}
                          className="text-gray-600 dark:text-gray-400"
                        />
                      )}
                    </button>
                    <button
                      className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                      onClick={() => {
                        setEditContent(message.content);
                        setEditingMessageId(message.id);
                      }}
                    >
                      <IconEdit
                        size={16}
                        className="text-gray-600 dark:text-gray-400"
                      />
                    </button>
                    <button
                      className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                      onClick={() => {
                        setMessageToDelete(message.id);
                        setDeleteModalOpen(true);
                      }}
                    >
                      <IconTrash
                        size={16}
                        className="text-gray-600 dark:text-gray-400"
                      />
                    </button>
                  </div>
                )}

              {isLoading && message === messages[messages.length - 1] && (
                <motion.div
                  className="w-4 h-4 border-2 border-black dark:border-white mt-2 mb-6 mx-2"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {showScrollButton && !isMobile && (
        <motion.button
          onClick={scrollToBottom}
          className="fixed bottom-16 sm:bottom-24 right-4 sm:right-24 bg-white dark:bg-black p-2 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-900 border border-black dark:border-white transition-all z-[9999] cursor-pointer"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 0.9 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            animate={{ y: [0, 3, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <IconArrowDown size={16} stroke={1.5} />
          </motion.div>
        </motion.button>
      )}

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setMessageToDelete(null);
        }}
        onConfirm={() => {
          if (messageToDelete) {
            handleDelete(messageToDelete);
          }
        }}
      />
    </div>
  );
}
