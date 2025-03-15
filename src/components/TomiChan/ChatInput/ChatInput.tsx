/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  IconSend2,
  IconPlus,
  IconSquare,
  IconPhoto,
  IconFile,
  IconVideo,
  IconMusicUp,
  IconArrowDown,
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import UploadFiles from "./UploadFiles";
import {
  useImageUpload,
  useFileUpload,
  useVideoUpload,
  useAudioUpload,
  useFileValidator,
} from "@/hooks/useUploadFiles";
import { scrollToBottom } from "../ChatMessages/ChatMessages";
import { useMediaQuery } from "react-responsive";

interface ChatInputProps {
  onSendMessage: (
    message: string,
    imageData?: { url: string; data: string }[],
    fileData?: { name: string; type: string; data: string }[],
    videoData?: { url: string; data: string }[],
    audioData?: { url: string; data: string }[]
  ) => void;
  onPlusClick?: () => void;
  onStopGeneration?: () => void;
  isGenerating?: boolean;
  onImagesUpload?: (files: File[]) => void;
  onFilesUpload?: (files: File[]) => void;
  onVideosUpload?: (files: File[]) => void;
  onAudiosUpload?: (files: File[]) => void;
  selectedProvider?: string;
  showScrollButton?: boolean;
  isMagicMode?: boolean;
}

export default function ChatInput({
  onSendMessage,
  onStopGeneration,
  isGenerating = false,
  onImagesUpload,
  onFilesUpload,
  onVideosUpload,
  onAudiosUpload,
  selectedProvider = "google",
  showScrollButton = false,
  isMagicMode = false,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [textareaHeight, setTextareaHeight] = useState(56);
  const [isDragging, setIsDragging] = useState(false);
  const [hasUnsupportedFile, setHasUnsupportedFile] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const {
    selectedImages,
    fileInputRef: imageInputRef,
    handleFileInputChange: handleImageInputChange,
    handlePastedFiles: handlePastedImages,
    handleRemoveImage,
    handleClearAllImages,
  } = useImageUpload(onImagesUpload);

  const isMobile = useMediaQuery({ maxWidth: 768 });
  const isTablet = useMediaQuery({ maxWidth: 1024 });

  const {
    selectedFiles,
    fileInputRef: fileInputRef,
    handleFileInputChange: handleFileInputChange,
    handleRemoveFile,
    handleClearAllFiles,
  } = useFileUpload(onFilesUpload);

  const {
    selectedVideos,
    fileInputRef: videoInputRef,
    handleFileInputChange: handleVideoInputChange,
    handleRemoveVideo,
    handleClearAllVideos,
  } = useVideoUpload(onVideosUpload);

  const {
    selectedAudios,
    fileInputRef: audioInputRef,
    handleFileInputChange: handleAudioInputChange,
    handleRemoveAudio,
    handleClearAllAudios,
  } = useAudioUpload(onAudiosUpload);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [isTouching, setIsTouching] = useState(false);
  const touchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { validateFiles, isFileTypeSupported } = useFileValidator();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      (!message.trim() &&
        selectedImages.length === 0 &&
        selectedFiles.length === 0 &&
        selectedVideos.length === 0 &&
        selectedAudios.length === 0) ||
      isGenerating
    )
      return;

    // Xử lý hình ảnh đọc trực tiếp thành base64 thay vì dùng URL
    let imageDataArray: { url: string; data: string }[] | undefined;
    if (selectedImages.length > 0) {
      imageDataArray = await Promise.all(
        selectedImages.map(async (image) => {
          // Đọc file ảnh thành base64 string
          const base64Data = await readFileAsDataURL(image.file);
          return {
            url: URL.createObjectURL(image.file),
            data: base64Data,
          };
        })
      );
    }

    // Xử lý file nếu có
    let fileDataArray:
      | { name: string; type: string; data: string }[]
      | undefined;
    if (selectedFiles.length > 0) {
      fileDataArray = await Promise.all(
        selectedFiles.map(async (fileObj) => {
          return {
            name: fileObj.file.name,
            type: fileObj.file.type,
            data: await readFileAsDataURL(fileObj.file),
          };
        })
      );
    }

    // Xử lý video nếu có
    let videoDataArray: { url: string; data: string }[] | undefined;
    if (selectedVideos.length > 0) {
      videoDataArray = await Promise.all(
        selectedVideos.map(async (video) => {
          // Đọc file video thành base64 string
          const base64Data = await readFileAsDataURL(video.file);
          return {
            url: URL.createObjectURL(video.file),
            data: base64Data,
          };
        })
      );
    }

    // Xử lý audio nếu có
    let audioDataArray: { url: string; data: string }[] | undefined;
    if (selectedAudios.length > 0) {
      audioDataArray = await Promise.all(
        selectedAudios.map(async (audio) => {
          // Đọc file audio thành base64 string
          const base64Data = await readFileAsDataURL(audio.file);
          return {
            url: URL.createObjectURL(audio.file),
            data: base64Data,
          };
        })
      );
    }

    onSendMessage(
      message,
      imageDataArray,
      fileDataArray,
      videoDataArray,
      audioDataArray
    );
    setMessage("");
    setTextareaHeight(56);
    handleClearAllImages();
    handleClearAllFiles();
    handleClearAllVideos();
    handleClearAllAudios();
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
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

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) {
        return;
      }

      const imageItems = Array.from(items).filter((item) =>
        item.type.startsWith("image/")
      );

      if (imageItems.length === 0) return;

      e.preventDefault();

      const files = imageItems
        .map((item) => item.getAsFile())
        .filter((file): file is File => file !== null);

      if (files.length > 0) {
        handlePastedImages(files);
      }
    };

    textarea.addEventListener("paste", handlePaste);

    return () => {
      textarea.removeEventListener("paste", handlePaste);
    };
  }, [handlePastedImages]);

  useEffect(() => {
    if (!isMobile) return;

    const handleTouchStart = () => {
      // Xóa timeout cũ nếu có
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }
      setIsTouching(true);
    };

    const handleTouchEnd = () => {
      // Thêm timeout 2s trước khi set isTouching = false
      touchTimeoutRef.current = setTimeout(() => {
        setIsTouching(false);
      }, 2000);
    };

    document.addEventListener("touchstart", handleTouchStart);
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
      // Cleanup timeout khi unmount
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }
    };
  }, [isMobile]);

  useEffect(() => {
    // Reset trạng thái khi provider thay đổi (tạo chat mới)
    setShowPopup(false);
    setIsTouching(false);
  }, [selectedProvider]);

  // Hàm kiểm tra loại file và xử lý tương ứng
  const handleFiles = (files: File[]) => {
    const {
      imageFiles,
      videoFiles,
      audioFiles,
      documentFiles,
      hasUnsupported,
    } = validateFiles(files);

    setHasUnsupportedFile(hasUnsupported);

    if (imageFiles.length > 0) {
      handlePastedImages(imageFiles);
    }

    if (videoFiles.length > 0 && videoInputRef.current) {
      const dataTransfer = new DataTransfer();
      videoFiles.forEach((file) => dataTransfer.items.add(file));
      videoInputRef.current.files = dataTransfer.files;
      handleVideoInputChange({ target: { files: dataTransfer.files } } as any);
    }

    if (audioFiles.length > 0 && audioInputRef.current) {
      const dataTransfer = new DataTransfer();
      audioFiles.forEach((file) => dataTransfer.items.add(file));
      audioInputRef.current.files = dataTransfer.files;
      handleAudioInputChange({ target: { files: dataTransfer.files } } as any);
    }

    if (documentFiles.length > 0 && fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      documentFiles.forEach((file) => dataTransfer.items.add(file));
      fileInputRef.current.files = dataTransfer.files;
      handleFileInputChange({ target: { files: dataTransfer.files } } as any);
    }

    // Nếu có file không hỗ trợ, hiển thị cảnh báo trong 3 giây
    if (hasUnsupported) {
      setTimeout(() => {
        setHasUnsupportedFile(false);
      }, 3000);
    }
  };

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isDragging) {
        setIsDragging(true);
      }

      // Kiểm tra xem có file nào không được hỗ trợ không
      if (e.dataTransfer?.items) {
        let hasUnsupported = false;
        for (let i = 0; i < e.dataTransfer.items.length; i++) {
          const item = e.dataTransfer.items[i];
          if (!isFileTypeSupported(item.type)) {
            hasUnsupported = true;
            break;
          }
        }
        setHasUnsupportedFile(hasUnsupported);
      }
    };

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Kiểm tra xem chuột có thực sự rời khỏi form hay không
      // bằng cách kiểm tra relatedTarget
      const rect = form.getBoundingClientRect();
      const x = e.clientX;
      const y = e.clientY;

      // Chỉ set isDragging = false khi chuột thực sự ra khỏi vùng form
      if (
        x <= rect.left ||
        x >= rect.right ||
        y <= rect.top ||
        y >= rect.bottom
      ) {
        setIsDragging(false);
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        handleFiles(Array.from(e.dataTransfer.files));
      }
    };

    form.addEventListener("dragover", handleDragOver);
    form.addEventListener("dragenter", handleDragEnter);
    form.addEventListener("dragleave", handleDragLeave);
    form.addEventListener("drop", handleDrop);

    return () => {
      form.removeEventListener("dragover", handleDragOver);
      form.removeEventListener("dragenter", handleDragEnter);
      form.removeEventListener("dragleave", handleDragLeave);
      form.removeEventListener("drop", handleDrop);
    };
  }, [isDragging]);

  return (
    <motion.form
      ref={formRef}
      onSubmit={handleSubmit}
      className={`relative w-full ${
        isDragging
          ? `ring-2 ${
              hasUnsupportedFile ? "ring-red-500" : "ring-blue-500"
            } ring-opacity-50`
          : ""
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
    >
      {isDragging && (
        <div
          className={`absolute inset-0 ${
            hasUnsupportedFile
              ? "bg-red-100 dark:bg-red-900 bg-opacity-30 dark:bg-opacity-30"
              : "bg-blue-100 dark:bg-blue-900 bg-opacity-30 dark:bg-opacity-30"
          } flex items-center justify-center rounded-2xl z-10 pointer-events-none`}
        >
          <div
            className={`${
              hasUnsupportedFile
                ? "text-red-600 dark:text-red-300"
                : "text-blue-600 dark:text-blue-300"
            } font-medium`}
          >
            {hasUnsupportedFile
              ? "Định dạng file không được hỗ trợ!"
              : "Thả file để tải lên"}
          </div>
        </div>
      )}

      <AnimatePresence>
        {showScrollButton && !isTouching && (
          <motion.button
            onClick={scrollToBottom}
            className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-white dark:bg-black p-2 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-900 border border-black dark:border-white transition-all z-[9999] cursor-pointer"
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
      </AnimatePresence>

      <div className="flex flex-col w-full">
        <div className="w-full overflow-hidden bg-white dark:bg-black rounded-2xl border border-black dark:border-white">
          <div className="w-full h-full flex flex-col">
            <div className="max-h-[300px] overflow-y-auto">
              <UploadFiles
                selectedImages={selectedImages}
                selectedFiles={selectedFiles}
                onRemoveImage={handleRemoveImage}
                onRemoveFile={handleRemoveFile}
                onClearAllImages={handleClearAllImages}
                onClearAllFiles={handleClearAllFiles}
                fileType="image"
              />

              {selectedVideos.length > 0 && (
                <UploadFiles
                  selectedVideos={selectedVideos}
                  onRemoveVideo={handleRemoveVideo}
                  onClearAllVideos={handleClearAllVideos}
                  fileType="video"
                />
              )}

              {selectedAudios.length > 0 && (
                <UploadFiles
                  selectedAudios={selectedAudios}
                  onRemoveAudio={handleRemoveAudio}
                  onClearAllAudios={handleClearAllAudios}
                  fileType="audio"
                />
              )}

              {selectedFiles.length > 0 && (
                <UploadFiles
                  selectedFiles={selectedFiles}
                  onRemoveFile={handleRemoveFile}
                  onClearAllFiles={handleClearAllFiles}
                  fileType="document"
                />
              )}
            </div>

            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextareaChange}
              placeholder="Nhập câu hỏi của bạn..."
              className={`w-full pt-3 pb-3 px-4 focus:outline-none resize-none overflow-y min-h-[50px] max-h-[160px] bg-transparent flex-grow placeholder:text-gray-500 dark:placeholder:text-gray-400 ${
                isMagicMode
                  ? ""
                  : "sm:min-h-[56px] sm:max-h-[200px] sm:pt-4 sm:pb-4 sm:px-6"
              }`}
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

            <div className={`h-10 ${isMagicMode ? "" : "sm:h-14"}`}>
              <AnimatePresence>
                {selectedProvider === "google" && (
                  <motion.button
                    data-plus-button
                    type="button"
                    className={`absolute left-2 bottom-8 cursor-pointer dark:hover:bg-gray-900 hover:bg-gray-100 rounded-full p-1 transition-all duration-200 border border-black dark:border-white ${
                      isMagicMode ? "" : "sm:left-3 sm:bottom-10 sm:p-2"
                    }`}
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
                      className={`text-black dark:text-white ${
                        isMagicMode ? "" : "sm:w-[22px] sm:h-[22px]"
                      }`}
                      stroke={1.5}
                    />
                  </motion.button>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {(message.trim() || isGenerating) && (
                  <motion.button
                    type="button"
                    className={`absolute right-2 bottom-8 cursor-pointer rounded-full p-2 bg-black dark:bg-white ${
                      isMagicMode ? "" : "sm:right-3 sm:bottom-10"
                    }`}
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
                          className={`text-white dark:text-black ${
                            isMagicMode ? "" : "sm:w-[22px] sm:h-[22px]"
                          }`}
                          stroke={1.5}
                        />
                      </motion.div>
                    ) : (
                      <IconSend2
                        size={18}
                        className={`text-white dark:text-black ${
                          isMagicMode ? "" : "sm:w-[22px] sm:h-[22px]"
                        }`}
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

            <input
              type="file"
              ref={videoInputRef}
              onChange={handleVideoInputChange}
              multiple
              accept="video/mp4,video/mpeg,video/mov,video/avi,video/x-flv,video/mpg,video/webm,video/wmv,video/3gpp"
              className="hidden"
            />

            <input
              type="file"
              ref={audioInputRef}
              onChange={handleAudioInputChange}
              multiple
              accept="audio/wav,audio/mp3,audio/mpeg,audio/aiff,audio/aac,audio/ogg,audio/flac"
              className="hidden"
            />
          </div>
        </div>
        <div
          className={`text-center text-xs ${
            isMagicMode ? "" : "sm:text-sm"
          } text-gray-500 dark:text-gray-400`}
        >
          {isMagicMode && isTablet
            ? "Dự án của TomiSakae! - "
            : isMagicMode
            ? "Dự án mã nguồn mở của TomiSakae! - "
            : "Đây là dự án mã nguồn mở của TomiSakae! - "}
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
                  videoInputRef.current?.click();
                  setShowPopup(false);
                }}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-md transition-colors cursor-pointer"
              >
                <IconVideo
                  size={18}
                  className="text-gray-600 dark:text-gray-300"
                />
                <span className="text-sm">Tải video lên</span>
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
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  audioInputRef.current?.click();
                  setShowPopup(false);
                }}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-md transition-colors cursor-pointer"
              >
                <IconMusicUp
                  size={18}
                  className="text-gray-600 dark:text-gray-300"
                />
                <span className="text-sm">Tải âm thanh lên</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.form>
  );
}
