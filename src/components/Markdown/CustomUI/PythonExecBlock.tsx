import React from "react";
import {
  IconTerminal2,
  IconPlayerPlay,
  IconLoader2,
} from "@tabler/icons-react";

interface PythonExecBlockProps {
  children: React.ReactNode;
  isLoading?: boolean;
}

export const PythonExecBlock: React.FC<PythonExecBlockProps> = ({
  children,
  isLoading = true,
}) => {
  return (
    <div className="my-4 p-4 rounded-lg border-2 border-green-500/30 bg-gradient-to-r from-green-500/10 to-blue-500/10">
      <div className="flex items-center gap-2 mb-2">
        {isLoading ? (
          <IconLoader2 className="text-green-500 animate-spin" size={20} />
        ) : (
          <IconTerminal2 className="text-green-500" size={20} />
        )}
        <span className="font-semibold bg-gradient-to-r from-green-400 via-blue-500 to-green-500 text-transparent bg-clip-text">
          {isLoading ? "Đang thực thi..." : "Thực thi mã Python"}
        </span>
      </div>
      <pre className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap bg-black/5 dark:bg-white/5 rounded-md p-3 my-2">
        {children}
      </pre>
    </div>
  );
};

export const PythonResultBlock: React.FC<PythonExecBlockProps> = ({
  children,
  isLoading = false,
}) => {
  const isError = children?.toString().includes("❌");

  // Hàm extract images từ content
  const extractImages = (content: string): string[] => {
    const imageRegex = /\[python_images\](.*?)\[\/python_images\]/;
    const match = content?.toString().match(imageRegex);
    if (match) {
      try {
        return JSON.parse(match[1]);
      } catch {
        return [];
      }
    }
    return [];
  };

  // Lấy content không bao gồm phần images
  const getContentWithoutImages = (content: string): string => {
    return content
      ?.toString()
      .replace(/\[python_images\].*?\[\/python_images\]/, "")
      .trim();
  };

  const images = extractImages(children?.toString() || "");
  const content = getContentWithoutImages(children?.toString() || "");
  const hasOnlyImages = images.length > 0 && !content; // kiểm tra chỉ có images

  return (
    <div
      className={`my-4 p-4 rounded-lg border-2 ${
        isLoading
          ? "border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 to-orange-500/10"
          : isError
          ? "border-red-500/30 bg-gradient-to-r from-red-500/10 to-pink-500/10"
          : "border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-green-500/10"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        {isLoading ? (
          <IconLoader2 className="text-yellow-500 animate-spin" size={20} />
        ) : (
          <IconPlayerPlay
            className={isError ? "text-red-500" : "text-blue-500"}
            size={20}
          />
        )}
        <span
          className={`font-semibold ${
            isError
              ? "bg-gradient-to-r from-red-400 via-pink-500 to-red-500"
              : "bg-gradient-to-r from-blue-400 via-green-500 to-blue-500"
          } text-transparent bg-clip-text`}
        >
          {isError ? "Lỗi thực thi" : "Kết quả thực thi"}
        </span>
      </div>

      {/* Chỉ hiển thị pre khi có content */}
      <pre
        className={`text-sm whitespace-pre-wrap rounded-md p-3 my-2 ${
          isError
            ? "text-red-600 dark:text-red-400 bg-red-500/10"
            : "text-gray-600 dark:text-gray-400 bg-black/5 dark:bg-white/5"
        }`}
      >
        {content}
      </pre>

      {/* Phần hiển thị ảnh */}
      {images.length > 0 && (
        <div
          className={`flex flex-col items-center gap-4 ${
            hasOnlyImages ? "" : "mt-4"
          }`}
        >
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={`data:image/png;base64,${image}`}
                alt={`Plot ${index + 1}`}
                className="max-w-full h-auto rounded-lg shadow-lg"
                style={{ maxHeight: "400px" }}
              />
              <button
                onClick={() => {
                  // Tạo link tải xuống
                  const link = document.createElement("a");
                  link.href = `data:image/png;base64,${image}`;
                  link.download = `plot_${index + 1}.png`;
                  link.click();
                }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
