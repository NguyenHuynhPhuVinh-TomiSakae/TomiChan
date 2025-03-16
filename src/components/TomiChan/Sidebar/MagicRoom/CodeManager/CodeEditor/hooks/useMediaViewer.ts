import { useState } from "react";
import type { CodeFile } from "../../../../../../../types";
import { createMediaUrl } from "../utils";

export function useMediaViewer() {
  const [showMediaViewer, setShowMediaViewer] = useState<boolean>(false);
  const [mediaFile, setMediaFile] = useState<CodeFile | null>(null);
  const [mediaFileUrl, setMediaFileUrl] = useState<string>("");
  const [isMediaLoading, setIsMediaLoading] = useState<boolean>(false);
  const [mediaError, setMediaError] = useState<string | null>(null);

  const openMediaViewer = (file: CodeFile) => {
    setMediaFile(file);
    setIsMediaLoading(true);
    setMediaError(null);
    setShowMediaViewer(true);

    try {
      const url = createMediaUrl(file);
      setMediaFileUrl(url);
      setIsMediaLoading(false);
    } catch (err) {
      console.error("Lỗi khi xử lý file media:", err);
      setMediaError("Không thể hiển thị file này.");
      setIsMediaLoading(false);
    }
  };

  const closeMediaViewer = () => {
    setShowMediaViewer(false);
    setMediaFile(null);
    setMediaFileUrl("");
  };

  const handleDownloadMedia = () => {
    if (!mediaFile) return;

    const link = document.createElement("a");
    link.href =
      mediaFileUrl ||
      `data:application/octet-stream;base64,${mediaFile.content}`;
    link.download = mediaFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    showMediaViewer,
    mediaFile,
    mediaFileUrl,
    isMediaLoading,
    mediaError,
    openMediaViewer,
    closeMediaViewer,
    handleDownloadMedia,
  };
}
