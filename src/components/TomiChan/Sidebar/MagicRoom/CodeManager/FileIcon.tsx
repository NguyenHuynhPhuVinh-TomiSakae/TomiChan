import React from "react";
import {
  IconCode,
  IconPhoto,
  IconMusic,
  IconVideo,
  IconFileText,
  IconBrandJavascript,
  IconBrandHtml5,
  IconBrandCss3,
  IconBrandPython,
  IconJson,
  IconMarkdown,
} from "@tabler/icons-react";

interface FileIconProps {
  fileName: string;
  size?: number;
  className?: string;
}

const FileIcon: React.FC<FileIconProps> = ({
  fileName,
  size = 20,
  className = "mr-2",
}) => {
  const extension = fileName.split(".").pop()?.toLowerCase();

  // Biểu tượng cho các loại file hình ảnh
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(extension || "")) {
    return <IconPhoto size={size} className={`${className} text-green-500`} />;
  }

  // Biểu tượng cho các loại file âm thanh
  if (["mp3", "wav", "ogg", "aac"].includes(extension || "")) {
    return <IconMusic size={size} className={`${className} text-blue-500`} />;
  }

  // Biểu tượng cho các loại file video
  if (["mp4", "webm", "ogv", "mov"].includes(extension || "")) {
    return <IconVideo size={size} className={`${className} text-red-500`} />;
  }

  // Biểu tượng cho file PDF
  if (extension === "pdf") {
    return (
      <IconFileText size={size} className={`${className} text-orange-500`} />
    );
  }

  // Biểu tượng cho các loại file code phổ biến
  if (["js", "jsx", "ts", "tsx"].includes(extension || "")) {
    return (
      <IconBrandJavascript
        size={size}
        className={`${className} text-yellow-500`}
      />
    );
  }

  if (["html", "htm"].includes(extension || "")) {
    return (
      <IconBrandHtml5 size={size} className={`${className} text-orange-500`} />
    );
  }

  if (["css", "scss", "sass"].includes(extension || "")) {
    return (
      <IconBrandCss3 size={size} className={`${className} text-blue-500`} />
    );
  }

  if (["py"].includes(extension || "")) {
    return (
      <IconBrandPython size={size} className={`${className} text-blue-700`} />
    );
  }

  if (["json", "yml", "yaml"].includes(extension || "")) {
    return <IconJson size={size} className={`${className} text-gray-500`} />;
  }

  if (["md", "markdown"].includes(extension || "")) {
    return (
      <IconMarkdown size={size} className={`${className} text-blue-400`} />
    );
  }

  // Biểu tượng mặc định cho các loại file code khác
  return <IconCode size={size} className={`${className} text-purple-500`} />;
};

export default FileIcon;
