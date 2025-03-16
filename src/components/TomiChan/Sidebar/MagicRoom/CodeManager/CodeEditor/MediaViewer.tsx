import React from "react";
import Image from "next/image";
import { IconArrowLeft, IconX, IconDownload } from "@tabler/icons-react";
import type { CodeFile } from "../../../../../../types";
import { getMediaFileType } from "./utils";

interface MediaViewerProps {
  mediaFile: CodeFile;
  mediaFileUrl: string;
  isMediaLoading: boolean;
  mediaError: string | null;
  onClose: () => void;
  onDownload: () => void;
}

export default function MediaViewer({
  mediaFile,
  mediaFileUrl,
  isMediaLoading,
  mediaError,
  onClose,
  onDownload,
}: MediaViewerProps) {
  const renderMediaContent = () => {
    if (isMediaLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-2">Đang tải...</p>
          </div>
        </div>
      );
    }

    if (mediaError) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2 text-red-500">Lỗi</h3>
            <p className="text-gray-500 mb-4">{mediaError}</p>
            <button
              onClick={onDownload}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
            >
              <IconDownload className="inline-block mr-2" />
              Tải xuống
            </button>
          </div>
        </div>
      );
    }

    const fileType = getMediaFileType(mediaFile.name);

    switch (fileType) {
      case "image":
        return (
          <div className="flex items-center justify-center h-full">
            <Image
              src={mediaFileUrl}
              alt={mediaFile.name}
              className="max-w-full max-h-full object-contain"
              width={1000}
              height={1000}
              onError={() => console.error("Không thể hiển thị ảnh này.")}
            />
          </div>
        );
      case "audio":
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-center mb-4">
              <h3 className="text-xl font-semibold mb-2">{mediaFile.name}</h3>
              <p className="text-gray-500">Tệp âm thanh</p>
            </div>
            <audio
              src={mediaFileUrl}
              controls
              className="w-full max-w-md"
              onError={() => console.error("Không thể phát âm thanh này.")}
              preload="auto"
            >
              Trình duyệt của bạn không hỗ trợ phát âm thanh.
            </audio>
          </div>
        );
      case "video":
        return (
          <div className="flex items-center justify-center h-full">
            <video
              src={mediaFileUrl}
              controls
              className="max-w-full max-h-full"
              onError={() => console.error("Không thể phát video này.")}
              preload="auto"
            >
              Trình duyệt của bạn không hỗ trợ phát video.
            </video>
          </div>
        );
      case "pdf":
        return (
          <div className="h-full">
            <iframe
              src={mediaFileUrl}
              className="w-full h-full"
              title={mediaFile.name}
              onError={() => console.error("Không thể hiển thị PDF này.")}
            />
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">
                Không thể hiển thị file
              </h3>
              <p className="text-gray-500 mb-4">
                Định dạng file không được hỗ trợ để xem trực tiếp.
              </p>
              <button
                onClick={onDownload}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <IconDownload className="inline-block mr-2" />
                Tải xuống
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="absolute inset-0 bg-white dark:bg-gray-900 z-10 flex flex-col">
      {/* Media Viewer Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors cursor-pointer"
            >
              <IconArrowLeft size={20} />
            </button>
            <h2 className="text-lg font-semibold truncate">{mediaFile.name}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onDownload}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors cursor-pointer"
              title="Tải xuống"
            >
              <IconDownload size={20} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors cursor-pointer"
            >
              <IconX size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Media Content */}
      <div className="flex-1 overflow-auto p-4">{renderMediaContent()}</div>
    </div>
  );
}
