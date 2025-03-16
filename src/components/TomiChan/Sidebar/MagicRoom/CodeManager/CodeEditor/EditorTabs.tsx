/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { IconX } from "@tabler/icons-react";
import type { CodeFile } from "../../../../../../types";
import FileIcon from "../FileIcon";

interface EditorTabsProps {
  openedFiles: CodeFile[];
  activeFileId: string | null;
  onTabClick: (fileId: string) => void;
  onTabClose: (fileId: string, e: React.MouseEvent) => void;
  activeFile: CodeFile | null;
}

export default function EditorTabs({
  openedFiles,
  activeFileId,
  onTabClick,
  onTabClose,
  activeFile,
}: EditorTabsProps) {
  return (
    <div className="flex items-center border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 overflow-x-auto">
      {openedFiles.map((openedFile) => (
        <div
          key={openedFile.id}
          onClick={() => onTabClick(openedFile.id)}
          className={`
            flex items-center gap-2 px-4 py-2 cursor-pointer border-r border-gray-200 dark:border-gray-700
            ${
              openedFile.id === activeFileId
                ? "bg-white dark:bg-gray-800"
                : "hover:bg-gray-100 dark:hover:bg-gray-800"
            }
          `}
        >
          <FileIcon fileName={openedFile.name} size={16} />
          <span className="truncate max-w-[120px]">{openedFile.name}</span>
          <button
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
            onClick={(e) => onTabClose(openedFile.id, e)}
          >
            <IconX size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
