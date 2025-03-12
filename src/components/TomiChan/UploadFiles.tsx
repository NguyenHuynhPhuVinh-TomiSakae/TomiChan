import React, { useEffect, useRef } from "react";
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
} from "@tabler/icons-react";

interface UploadFilesProps {
  onImagesUpload?: (files: File[]) => void;
  onFilesUpload?: (files: File[]) => void;
  selectedImages?: { file: File; preview: string }[];
  selectedFiles?: { file: File; type: string }[];
  onRemoveImage?: (index: number) => void;
  onRemoveFile?: (index: number) => void;
  onClearAllImages?: () => void;
  onClearAllFiles?: () => void;
  fileType?: "image" | "document";
}

export default function UploadFiles({
  onImagesUpload,
  onFilesUpload,
  selectedImages = [],
  selectedFiles = [],
  onRemoveImage = () => {},
  onRemoveFile = () => {},
  onClearAllImages = () => {},
  onClearAllFiles = () => {},
  fileType = "image",
}: UploadFilesProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (fileType === "image" && onImagesUpload) {
      onImagesUpload(files);
    } else if (fileType === "document" && onFilesUpload) {
      onFilesUpload(files);
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
    return <IconFile size={24} />;
  };

  useEffect(() => {
    return () => {
      selectedImages.forEach((image) => {
        URL.revokeObjectURL(image.preview);
      });
    };
  }, []);

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        multiple
        accept={
          fileType === "image"
            ? "image/*"
            : "application/pdf,application/x-javascript,text/javascript,application/x-python,text/x-python,text/plain,text/html,text/css,text/md,text/csv,text/xml,text/rtf"
        }
        className="hidden"
      />

      {fileType === "image" && selectedImages.length > 0 && (
        <div className="relative border-b border-black dark:border-white">
          <button
            type="button"
            onClick={onClearAllImages}
            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs transition-colors z-10 cursor-pointer flex items-center gap-1"
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

      {fileType === "document" && selectedFiles.length > 0 && (
        <div className="relative border-b border-black dark:border-white">
          <button
            type="button"
            onClick={onClearAllFiles}
            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs transition-colors z-10 cursor-pointer flex items-center gap-1"
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
    </>
  );
}
