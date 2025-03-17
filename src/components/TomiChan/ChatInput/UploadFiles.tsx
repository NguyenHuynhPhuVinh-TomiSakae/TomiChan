/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  IconX,
  IconTrash,
  IconFile,
  IconFileText,
  IconCode,
  IconMarkdown,
  IconTable,
  IconBrandHtml5,
  IconBrandCss3,
  IconVideo,
  IconPlayerPlay,
  IconMusic,
  IconBrain,
} from "@tabler/icons-react";
import { emitter, MAGIC_EVENTS } from "../../../lib/events";
import { getSessionStorage, setSessionStorage } from "@/utils/sessionStorage";

interface UploadFilesProps {
  onImagesUpload?: (files: File[]) => void;
  onFilesUpload?: (files: File[]) => void;
  onVideosUpload?: (files: File[]) => void;
  onAudiosUpload?: (files: File[]) => void;
  selectedImages?: { file: File; preview: string }[];
  selectedFiles?: { file: File; type: string }[];
  selectedVideos?: { file: File; preview: string }[];
  selectedAudios?: { file: File; preview: string }[];
  onRemoveImage?: (index: number) => void;
  onRemoveFile?: (index: number) => void;
  onRemoveVideo?: (index: number) => void;
  onRemoveAudio?: (index: number) => void;
  onClearAllImages?: () => void;
  onClearAllFiles?: () => void;
  onClearAllVideos?: () => void;
  onClearAllAudios?: () => void;
  onClearSentFiles?: () => void;
  fileType?: "image" | "document" | "video" | "audio" | "ai-files";
}

export default function UploadFiles({
  onImagesUpload,
  onFilesUpload,
  onVideosUpload,
  onAudiosUpload,
  selectedImages = [],
  selectedFiles = [],
  selectedVideos = [],
  selectedAudios = [],
  onRemoveImage = () => {},
  onRemoveFile = () => {},
  onRemoveVideo = () => {},
  onRemoveAudio = () => {},
  onClearAllImages = () => {},
  onClearAllFiles = () => {},
  onClearAllVideos = () => {},
  onClearAllAudios = () => {},
  onClearSentFiles = () => {},
  fileType = "image",
}: UploadFilesProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [playingVideo, setPlayingVideo] = useState<number | null>(null);
  const audioRefs = useRef<(HTMLAudioElement | null)[]>([]);

  // State cho danh sách file đã gửi cho AI
  const [sentFiles, setSentFiles] = useState<string[]>([]);
  // State để kiểm tra xem có đang ở trong Code View không
  const [isCodeView, setIsCodeView] = useState(false);

  // Kiểm tra xem có đang ở trong Code View không
  useEffect(() => {
    const checkIsCodeView = () => {
      const uiState = getSessionStorage("ui_state_magic", "none");
      setIsCodeView(uiState === "code_view");
    };

    // Kiểm tra lần đầu
    checkIsCodeView();

    // Lắng nghe sự thay đổi trạng thái
    const handleStateChange = () => {
      checkIsCodeView();
    };

    // Đăng ký lắng nghe các events liên quan
    emitter.on(MAGIC_EVENTS.OPEN_CODE_FILE, handleStateChange);
    emitter.on(MAGIC_EVENTS.CLOSE_CODE_FILE, handleStateChange);
    emitter.on(MAGIC_EVENTS.BACK_TO_MAGIC_ROOM, handleStateChange);

    return () => {
      // Hủy đăng ký khi component unmount
      emitter.off(MAGIC_EVENTS.OPEN_CODE_FILE, handleStateChange);
      emitter.off(MAGIC_EVENTS.CLOSE_CODE_FILE, handleStateChange);
      emitter.off(MAGIC_EVENTS.BACK_TO_MAGIC_ROOM, handleStateChange);
    };
  }, []);

  // Tải danh sách file đã gửi cho AI từ localStorage
  useEffect(() => {
    const loadSentFiles = () => {
      const sentFilesStr = getSessionStorage("files_sent_to_ai", "[]");
      try {
        const files = JSON.parse(sentFilesStr);
        setSentFiles(files);
      } catch (error) {
        console.error("Lỗi khi parse danh sách file đã gửi cho AI:", error);
        setSentFiles([]);
      }
    };

    // Tải danh sách file ban đầu
    loadSentFiles();
  }, []);

  // Lắng nghe event khi file được gửi cho AI từ FileItem
  useEffect(() => {
    const handleFileSentToAI = ({ fileName }: { fileName: string }) => {
      const sentFilesStr = getSessionStorage("files_sent_to_ai", "[]");
      try {
        const files = JSON.parse(sentFilesStr);
        setSentFiles(files);
      } catch (error) {
        console.error("Lỗi khi parse danh sách file đã gửi cho AI:", error);
      }
    };

    const handleFileRemovedFromAI = () => {
      const sentFilesStr = getSessionStorage("files_sent_to_ai", "[]");
      try {
        const files = JSON.parse(sentFilesStr);
        setSentFiles(files);
      } catch (error) {
        console.error("Lỗi khi parse danh sách file đã gửi cho AI:", error);
      }
    };

    const handleAllFilesRemovedFromAI = () => {
      setSentFiles([]);
    };

    emitter.on(MAGIC_EVENTS.FILE_SENT_TO_AI, handleFileSentToAI);
    emitter.on(MAGIC_EVENTS.FILE_REMOVED_FROM_AI, handleFileRemovedFromAI);
    emitter.on(
      MAGIC_EVENTS.ALL_FILES_REMOVED_FROM_AI,
      handleAllFilesRemovedFromAI
    );

    return () => {
      emitter.off(MAGIC_EVENTS.FILE_SENT_TO_AI, handleFileSentToAI);
      emitter.off(MAGIC_EVENTS.FILE_REMOVED_FROM_AI, handleFileRemovedFromAI);
      emitter.off(
        MAGIC_EVENTS.ALL_FILES_REMOVED_FROM_AI,
        handleAllFilesRemovedFromAI
      );
    };
  }, []);

  const handleRemoveSentFile = (index: number) => {
    const newSentFiles = [...sentFiles];
    const removedFileName = newSentFiles[index];
    newSentFiles.splice(index, 1);
    setSentFiles(newSentFiles);
    setSessionStorage("files_sent_to_ai", JSON.stringify(newSentFiles));

    emitter.emit(MAGIC_EVENTS.FILE_REMOVED_FROM_AI, {
      fileName: removedFileName,
    });
  };

  const handleClearAllSentFiles = () => {
    setSentFiles([]);
    setSessionStorage("files_sent_to_ai", "[]");
    emitter.emit(MAGIC_EVENTS.ALL_FILES_REMOVED_FROM_AI);
    onClearSentFiles();
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (fileType === "image" && onImagesUpload) {
      onImagesUpload(files);
    } else if (fileType === "document" && onFilesUpload) {
      onFilesUpload(files);
    } else if (fileType === "video" && onVideosUpload) {
      onVideosUpload(files);
    } else if (fileType === "audio" && onAudiosUpload) {
      onAudiosUpload(files);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return <IconFile size={24} />;
    if (type.includes("javascript")) return <IconCode size={24} />;
    if (type.includes("python")) return <IconCode size={24} />;
    if (type.includes("text/plain")) return <IconFileText size={24} />;
    if (type.includes("html")) return <IconBrandHtml5 size={24} />;
    if (type.includes("css")) return <IconBrandCss3 size={24} />;
    if (type.includes("md")) return <IconMarkdown size={24} />;
    if (type.includes("csv")) return <IconTable size={24} />;
    if (type.includes("xml")) return <IconCode size={24} />;
    if (type.includes("rtf")) return <IconFileText size={24} />;
    if (type.includes("video")) return <IconVideo size={24} />;
    return <IconFile size={24} />;
  };

  // Lấy icon dựa trên phần mở rộng của tên file
  const getFileIconByName = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase() || "";

    if (extension === "pdf") return <IconFile size={20} />;
    if (["js", "jsx", "ts", "tsx"].includes(extension))
      return <IconCode size={20} />;
    if (["py", "ipynb"].includes(extension)) return <IconCode size={20} />;
    if (extension === "txt") return <IconFileText size={20} />;
    if (["html", "htm"].includes(extension))
      return <IconBrandHtml5 size={20} />;
    if (extension === "css") return <IconBrandCss3 size={20} />;
    if (["md", "markdown"].includes(extension))
      return <IconMarkdown size={20} />;
    if (extension === "csv") return <IconTable size={20} />;
    if (extension === "xml") return <IconCode size={20} />;
    if (extension === "rtf") return <IconFileText size={20} />;

    return <IconFile size={20} />;
  };

  useEffect(() => {
    return () => {
      selectedImages.forEach((image) => {
        URL.revokeObjectURL(image.preview);
      });

      selectedVideos.forEach((video) => {
        URL.revokeObjectURL(video.preview);
      });
    };
  }, []);

  // Hiển thị danh sách file đã gửi cho AI nếu fileType là "ai-files" và đang ở trong Code View
  if (fileType === "ai-files" && isCodeView && sentFiles.length > 0) {
    return (
      <div className="relative border-b border-black dark:border-white">
        <div className="font-medium text-sm py-1 px-2 bg-purple-100 dark:bg-purple-900 border-b border-black dark:border-white flex items-center">
          <IconBrain
            size={16}
            className="mr-2 text-purple-600 dark:text-purple-400"
          />
          File đã gửi cho AI
        </div>
        <button
          type="button"
          onClick={handleClearAllSentFiles}
          className="absolute top-1 right-2 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs transition-colors z-10 cursor-pointer flex items-center gap-1"
        >
          <IconTrash size={14} stroke={1.5} />
        </button>
        <div className="flex flex-wrap gap-2 p-2 max-h-[200px] overflow-y-auto">
          {sentFiles.map((fileName, index) => (
            <div
              key={index}
              className="relative p-2 bg-purple-50 dark:bg-purple-950 rounded flex items-center gap-2 max-w-[200px] min-w-[150px] border border-purple-200 dark:border-purple-800"
            >
              <div className="text-purple-600 dark:text-purple-400">
                {getFileIconByName(fileName)}
              </div>
              <div className="flex-1 truncate text-xs">{fileName}</div>
              <button
                type="button"
                onClick={() => handleRemoveSentFile(index)}
                className="bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center transition-colors cursor-pointer"
              >
                <IconX size={12} stroke={2} />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        multiple
        accept={
          fileType === "image"
            ? "image/*"
            : fileType === "video"
            ? "video/mp4,video/mpeg,video/mov,video/avi,video/x-flv,video/mpg,video/webm,video/wmv,video/3gpp"
            : fileType === "audio"
            ? "audio/wav,audio/mp3,audio/mpeg,audio/aiff,audio/aac,audio/ogg,audio/flac"
            : "application/pdf,application/x-javascript,text/javascript,application/x-python,text/x-python,text/plain,text/html,text/css,text/md,text/csv,text/xml,text/rtf"
        }
        className="hidden"
      />

      {fileType === "image" && selectedImages.length > 0 && (
        <div className="relative border-b border-black dark:border-white">
          <div className="font-medium text-sm py-1 px-2 bg-gray-100 dark:bg-gray-800 border-b border-black dark:border-white">
            Hình ảnh đã tải lên
          </div>
          <button
            type="button"
            onClick={onClearAllImages}
            className="absolute top-1 right-2 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs transition-colors z-10 cursor-pointer flex items-center gap-1"
          >
            <IconTrash size={14} stroke={1.5} />
          </button>
          <div className="flex flex-wrap gap-2 p-2 max-h-[200px] overflow-y-auto">
            {selectedImages.map((image, index) => (
              <div key={index} className="relative w-20 h-20">
                <Image
                  src={image.preview}
                  alt={`Preview ${index}`}
                  className="w-full h-full object-cover rounded"
                  width={80}
                  height={80}
                />
                <button
                  type="button"
                  onClick={() => onRemoveImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <IconX size={12} stroke={2} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {fileType === "video" && selectedVideos.length > 0 && (
        <div className="relative border-b border-black dark:border-white">
          <div className="font-medium text-sm py-1 px-2 bg-gray-100 dark:bg-gray-800 border-b border-black dark:border-white">
            Video đã tải lên
          </div>
          <button
            type="button"
            onClick={onClearAllVideos}
            className="absolute top-1 right-2 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs transition-colors z-10 cursor-pointer flex items-center gap-1"
          >
            <IconTrash size={14} stroke={1.5} />
          </button>
          <div className="flex flex-wrap gap-3 p-3 max-h-[300px] overflow-y-auto">
            {selectedVideos.map((video, index) => (
              <div key={index} className="relative w-[200px] flex flex-col">
                <div className="h-[150px] rounded overflow-hidden relative">
                  {playingVideo === index ? (
                    <video
                      src={video.preview}
                      className="w-full h-full object-contain bg-gray-200 dark:bg-gray-800"
                      controls
                      autoPlay
                      onEnded={() => setPlayingVideo(null)}
                    />
                  ) : (
                    <div
                      className="w-full h-full rounded bg-gray-200 dark:bg-gray-800 flex items-center justify-center cursor-pointer relative"
                      onClick={() => setPlayingVideo(index)}
                    >
                      <div className="absolute inset-0">
                        <video
                          src={video.preview}
                          className="w-full h-full object-cover opacity-70"
                          muted
                          playsInline
                        />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center z-1">
                        <div className="bg-black bg-opacity-60 rounded-full p-3">
                          <IconPlayerPlay size={24} className="text-white" />
                        </div>
                      </div>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => onRemoveVideo(index)}
                    className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center transition-colors cursor-pointer z-20"
                  >
                    <IconX size={14} stroke={2} />
                  </button>
                </div>
                <div className="text-xs py-1 px-1 truncate text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  <IconVideo size={14} />
                  <span>{video.file.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {fileType === "document" && selectedFiles.length > 0 && (
        <div className="relative border-b border-black dark:border-white">
          <div className="font-medium text-sm py-1 px-2 bg-gray-100 dark:bg-gray-800 border-b border-black dark:border-white">
            Tài liệu đã tải lên
          </div>
          <button
            type="button"
            onClick={onClearAllFiles}
            className="absolute top-1 right-2 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs transition-colors z-10 cursor-pointer flex items-center gap-1"
          >
            <IconTrash size={14} stroke={1.5} />
          </button>
          <div className="flex flex-wrap gap-2 p-2 max-h-[200px] overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="relative p-2 bg-gray-100 dark:bg-gray-800 rounded flex items-center gap-2 max-w-[200px] min-w-[150px]"
              >
                <div className="text-gray-700 dark:text-gray-300">
                  {getFileIcon(file.type)}
                </div>
                <div className="flex-1 truncate text-xs">{file.file.name}</div>
                <button
                  type="button"
                  onClick={() => onRemoveFile(index)}
                  className="bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <IconX size={12} stroke={2} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {fileType === "audio" && selectedAudios.length > 0 && (
        <div className="relative border-b border-black dark:border-white">
          <div className="font-medium text-sm py-1 px-2 bg-gray-100 dark:bg-gray-800 border-b border-black dark:border-white">
            Âm thanh đã tải lên
          </div>
          <button
            type="button"
            onClick={onClearAllAudios}
            className="absolute top-1 right-2 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs transition-colors z-10 cursor-pointer flex items-center gap-1"
          >
            <IconTrash size={14} stroke={1.5} />
          </button>
          <div className="flex flex-wrap gap-3 p-3 max-h-[200px] overflow-y-auto">
            {selectedAudios.map((audio, index) => (
              <div
                key={index}
                className="relative p-2 bg-gray-100 dark:bg-gray-800 rounded flex items-center gap-2 w-full max-w-[400px]"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-gray-700 dark:text-gray-300">
                      <IconMusic size={20} />
                    </div>
                    <div className="truncate text-xs">{audio.file.name}</div>
                    <button
                      type="button"
                      onClick={() => onRemoveAudio(index)}
                      className="bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <IconX size={12} stroke={2} />
                    </button>
                  </div>
                  <audio
                    ref={(el) => {
                      audioRefs.current[index] = el;
                    }}
                    src={audio.preview}
                    className="w-full h-8"
                    controls
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
