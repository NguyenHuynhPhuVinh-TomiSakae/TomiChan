import { useState } from "react";
import type { CodeFile } from "../types";

export function useOpenedFiles() {
  const [openedFiles, setOpenedFiles] = useState<CodeFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);

  const openFile = (file: CodeFile) => {
    if (!openedFiles.find((f) => f.id === file.id)) {
      setOpenedFiles((prev) => [...prev, file]);
    }
    setActiveFileId(file.id);
  };

  const closeFile = (fileId: string) => {
    setOpenedFiles((prev) => prev.filter((f) => f.id !== fileId));
    if (activeFileId === fileId) {
      const remainingFiles = openedFiles.filter((f) => f.id !== fileId);
      setActiveFileId(remainingFiles.length > 0 ? remainingFiles[0].id : null);
    }
  };

  return {
    openedFiles,
    activeFileId,
    openFile,
    closeFile,
    setActiveFileId,
  };
}
