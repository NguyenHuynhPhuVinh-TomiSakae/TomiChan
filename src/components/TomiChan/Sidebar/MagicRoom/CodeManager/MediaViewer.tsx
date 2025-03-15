/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { IconArrowLeft, IconX, IconDownload } from "@tabler/icons-react";
import { CodeFile } from "@/types";

interface MediaViewerProps {
  file: CodeFile;
  onClose: () => void;
  onBack: () => void;
}

export default function MediaViewer({
  file,
  onClose,
  onBack,
}: MediaViewerProps) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const getFileType = () => {
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (
      ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(extension || "")
    ) {
      return "image";
    } else if (["mp3", "wav", "ogg", "aac"].includes(extension || "")) {
      return "audio";
    } else if (["mp4", "webm", "ogv", "mov"].includes(extension || "")) {
      return "video";
    } else if (["pdf"].includes(extension || "")) {
      return "pdf";
    }
    return "unknown";
  };

  const fileType = getFileType();

  // Tối ưu hóa việc xử lý URL
  const [fileUrl, setFileUrl] = React.useState<string>("");

  React.useEffect(() => {
    setIsLoading(true);
    setError(null);

    // Kiểm tra kích thước của nội dung
    const isLargeFile = file.content.length > 1000000; // Khoảng 1MB base64

    // Nếu là file video hoặc audio lớn, hiển thị thông báo không hỗ trợ
    if ((fileType === "video" || fileType === "audio") && isLargeFile) {
      setError(
        `Không thể phát trực tiếp file ${
          fileType === "video" ? "video" : "âm thanh"
        } này do kích thước quá lớn. Vui lòng tải xuống để xem.`
      );
      setIsLoading(false);
      return;
    }

    try {
      // Kiểm tra nếu nội dung đã là data URL
      if (file.content.startsWith("data:")) {
        setFileUrl(file.content);
        setIsLoading(false);
        return;
      }

      // Tạo URL từ nội dung file
      const extension = file.name.split(".").pop()?.toLowerCase();
      let mimeType = "";

      if (fileType === "image") {
        mimeType = `image/${extension === "svg" ? "svg+xml" : extension}`;
      } else if (fileType === "audio") {
        mimeType = `audio/${extension}`;
      } else if (fileType === "video") {
        mimeType = `video/${extension}`;
      } else if (fileType === "pdf") {
        mimeType = "application/pdf";
      }

      // Luôn sử dụng data URL với base64
      setFileUrl(`data:${mimeType};base64,${file.content}`);
      setIsLoading(false);
    } catch (err) {
      console.error("Lỗi khi xử lý file:", err);
      setError(
        "Không thể hiển thị file này. Có thể file quá lớn hoặc bị hỏng."
      );
      setIsLoading(false);
    }
  }, [file.content, file.name, fileType]);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href =
      fileUrl ||
      (file.content.startsWith("data:")
        ? file.content
        : `data:application/octet-stream;base64,${file.content}`);
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderMediaContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-2">Đang tải...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2 text-red-500">Lỗi</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
            >
              <IconDownload className="inline-block mr-2" />
              Tải xuống
            </button>
          </div>
        </div>
      );
    }

    switch (fileType) {
      case "image":
        return (
          <div className="flex items-center justify-center h-full">
            <img
              src={fileUrl}
              alt={file.name}
              className="max-w-full max-h-full object-contain"
              onError={() => setError("Không thể hiển thị ảnh này.")}
            />
          </div>
        );
      case "audio":
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-center mb-4">
              <h3 className="text-xl font-semibold mb-2">{file.name}</h3>
              <p className="text-gray-500">Tệp âm thanh</p>
            </div>
            <audio
              controls
              className="w-full max-w-md"
              onError={() => setError("Không thể phát âm thanh này.")}
            >
              <source src={fileUrl} />
              Trình duyệt của bạn không hỗ trợ phát âm thanh.
            </audio>
          </div>
        );
      case "video":
        return (
          <div className="flex items-center justify-center h-full">
            <video
              controls
              className="max-w-full max-h-full"
              onError={() => setError("Không thể phát video này.")}
              preload="metadata"
            >
              <source src={fileUrl} />
              Trình duyệt của bạn không hỗ trợ phát video.
            </video>
          </div>
        );
      case "pdf":
        return (
          <div className="h-full">
            <iframe
              src={fileUrl}
              className="w-full h-full"
              title={file.name}
              onError={() => setError("Không thể hiển thị PDF này.")}
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
                onClick={handleDownload}
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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors cursor-pointer"
            >
              <IconArrowLeft size={20} />
            </button>
            <h2 className="text-lg font-semibold truncate">{file.name}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
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

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">{renderMediaContent()}</div>
    </div>
  );
}
