import React from "react";
import { IconX } from "@tabler/icons-react";
import Image from "next/image";

interface MediaViewerProps {
  isOpen: boolean;
  onClose: () => void;
  type: "image" | "video" | "audio" | "file";
  src: string;
  title?: string;
}

export default function MediaViewer({
  isOpen,
  onClose,
  type,
  src,
  title,
}: MediaViewerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-sm bg-black/50">
      <div className="relative max-w-[90vw] max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 p-2 text-white hover:text-gray-300 transition-colors cursor-pointer"
        >
          <IconX size={24} />
        </button>

        {type === "image" && (
          <Image
            src={src}
            alt={title || "Media preview"}
            width={1024}
            height={1024}
            className="max-w-full max-h-[85vh] object-contain"
          />
        )}

        {type === "video" && (
          <video
            src={src}
            controls
            className="max-w-full max-h-[85vh]"
            autoPlay
          />
        )}

        {type === "audio" && (
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg min-w-[300px]">
            <div className="mb-4 text-center">
              <h3 className="text-lg font-medium">{title || "Audio Player"}</h3>
            </div>
            <audio
              src={src}
              controls
              className="w-full"
              controlsList="nodownload"
              autoPlay
            >
              Your browser does not support the audio element.
            </audio>
          </div>
        )}
      </div>
    </div>
  );
}
