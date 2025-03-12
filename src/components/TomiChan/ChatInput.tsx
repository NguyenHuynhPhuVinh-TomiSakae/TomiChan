"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  IconSend2,
  IconPlus,
  IconSquare,
  IconPhoto,
  IconFile,
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import UploadFiles from "./UploadFiles";
import { useImageUpload, useFileUpload } from "@/hooks/useUploadFiles";

interface ChatInputProps {
  onSendMessage: (
    message: string,
    imageData?: { url: string; data: string }[],
    fileData?: { name: string; type: string; data: string }[]
  ) => void;
  onPlusClick?: () => void;
  onStopGeneration?: () => void;
  isGenerating?: boolean;
  onImagesUpload?: (files: File[]) => void;
  onFilesUpload?: (files: File[]) => void;
  selectedProvider?: string;
}

export default function ChatInput({
  onSendMessage,
  onStopGeneration,
  isGenerating = false,
  onImagesUpload,
  onFilesUpload,
  selectedProvider = "google",
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [textareaHeight, setTextareaHeight] = useState(56);
  const {
    selectedImages,
    fileInputRef: imageInputRef,
    handleFileInputChange: handleImageInputChange,
    handleRemoveImage,
    handleClearAllImages,
  } = useImageUpload(onImagesUpload);

  const {
    selectedFiles,
    fileInputRef: fileInputRef,
    handleFileInputChange: handleFileInputChange,
    handleRemoveFile,
    handleClearAllFiles,
  } = useFileUpload(onFilesUpload);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      message.trim() ||
      selectedImages.length > 0 ||
      selectedFiles.length > 0
    ) {
      const imageData = await Promise.all(
        selectedImages.map(async (image) => {
          return {
            url: image.preview,
            data: await convertFileToBase64(image.file),
          };
        })
      );

      const fileData = await Promise.all(
        selectedFiles.map(async (file: { file: File; type: string }) => {
          return {
            name: file.file.name,
            type: file.type,
            data: await convertFileToBase64(file.file),
          };
        })
      );

      onSendMessage(message, imageData, fileData);
      setMessage("");
      setTextareaHeight(56);
      handleClearAllImages();
      handleClearAllFiles();
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    setMessage(textarea.value);

    textarea.style.height = "56px";
    const newHeight = Math.max(Math.min(textarea.scrollHeight, 200), 56);
    textarea.style.height = `${newHeight}px`;
    setTextareaHeight(newHeight);
  };

  useEffect(() => {
    return () => {
      selectedImages.forEach((image) => {
        URL.revokeObjectURL(image.preview);
      });
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const popup = document.querySelector("[data-popup]");
      const plusButton = document.querySelector("[data-plus-button]");

      if (
        showPopup &&
        !popup?.contains(target) &&
        !plusButton?.contains(target)
      ) {
        setShowPopup(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPopup]);

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="relative w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
    >
      <div className="flex flex-col w-full">
        <div className="w-full overflow-hidden bg-white dark:bg-black rounded-2xl border border-black dark:border-white">
          <div className="w-full h-full flex flex-col">
            <UploadFiles
              selectedImages={selectedImages}
              onRemoveImage={handleRemoveImage}
              onClearAllImages={handleClearAllImages}
              fileType="image"
            />

            <UploadFiles
              selectedFiles={selectedFiles}
              onRemoveFile={handleRemoveFile}
              onClearAllFiles={handleClearAllFiles}
              fileType="document"
            />

            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextareaChange}
              placeholder="Nhập câu hỏi của bạn..."
              className="w-full pt-3 pb-3 sm:pt-4 sm:pb-4 px-4 sm:px-6 focus:outline-none resize-none overflow-y min-h-[50px] sm:min-h-[56px] max-h-[160px] sm:max-h-[200px] bg-transparent flex-grow placeholder:text-gray-500 dark:placeholder:text-gray-400"
              style={{ height: `${textareaHeight}px` }}
              rows={1}
              disabled={isGenerating}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !isGenerating) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />

            <div className="h-10 sm:h-14">
              <AnimatePresence>
                {selectedProvider === "google" && (
                  <motion.button
                    data-plus-button
                    type="button"
                    className="absolute left-2 sm:left-3 bottom-8 sm:bottom-10 cursor-pointer dark:hover:bg-gray-900 hover:bg-gray-100 rounded-full p-1 sm:p-2 transition-all duration-200 border border-black dark:border-white"
                    onClick={(e) => {
                      e.preventDefault();
                      if (isGenerating) return;

                      const button = e.currentTarget;
                      const rect = button.getBoundingClientRect();
                      setPopupPosition({
                        x: rect.left,
                        y: rect.top - 5,
                      });
                      setShowPopup(!showPopup);
                    }}
                    disabled={isGenerating}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <IconPlus
                      size={18}
                      className="text-black dark:text-white sm:w-[22px] sm:h-[22px]"
                      stroke={1.5}
                    />
                  </motion.button>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {(message.trim() || isGenerating) && (
                  <motion.button
                    type="button"
                    className="absolute right-2 sm:right-3 bottom-8 sm:bottom-10 cursor-pointer rounded-full p-2 bg-black dark:bg-white"
                    onClick={(e) => {
                      e.preventDefault();
                      if (isGenerating && onStopGeneration) {
                        onStopGeneration();
                      } else if (!isGenerating && message.trim()) {
                        handleSubmit(e);
                      }
                    }}
                    initial={{
                      opacity: 0,
                      scale: 0.8,
                      backgroundColor: "rgb(229 231 235)",
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      backgroundColor:
                        document.documentElement.classList.contains("dark")
                          ? "#ffffff"
                          : "#000000",
                      transition: {
                        backgroundColor: {
                          duration: 0.25,
                          ease: "easeInOut",
                        },
                      },
                    }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isGenerating ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      >
                        <IconSquare
                          size={18}
                          className="text-white dark:text-black sm:w-[22px] sm:h-[22px]"
                          stroke={1.5}
                        />
                      </motion.div>
                    ) : (
                      <IconSend2
                        size={18}
                        className="text-white dark:text-black sm:w-[22px] sm:h-[22px]"
                        stroke={1.5}
                      />
                    )}
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            <input
              type="file"
              ref={imageInputRef}
              onChange={handleImageInputChange}
              multiple
              accept="image/png,image/jpeg,image/webp,image/heic,image/heif"
              className="hidden"
            />

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              multiple
              accept="application/pdf,application/x-javascript,text/javascript,application/x-python,text/x-python,text/plain,text/html,text/css,text/md,text/csv,text/xml,text/rtf"
              className="hidden"
            />
          </div>
        </div>
        <div className="text-center mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          Đây là dự án mã nguồn mở của TomiSakae! -{" "}
          <a
            href="https://github.com/NguyenHuynhPhuVinh-TomiSakae/TomiChan"
            className="underline hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            Xem tại đây
          </a>
        </div>
      </div>

      <AnimatePresence>
        {showPopup && (
          <motion.div
            data-popup
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="fixed bg-white dark:bg-black rounded-lg shadow-lg border border-black dark:border-white p-2 z-50"
            style={{
              left: popupPosition.x,
              bottom: `calc(100vh - ${popupPosition.y}px)`,
            }}
          >
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  imageInputRef.current?.click();
                  setShowPopup(false);
                }}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-md transition-colors cursor-pointer"
              >
                <IconPhoto
                  size={18}
                  className="text-gray-600 dark:text-gray-300"
                />
                <span className="text-sm">Tải ảnh lên</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  fileInputRef.current?.click();
                  setShowPopup(false);
                }}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-md transition-colors cursor-pointer"
              >
                <IconFile
                  size={18}
                  className="text-gray-600 dark:text-gray-300"
                />
                <span className="text-sm">Tải file lên</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.form>
  );
}
