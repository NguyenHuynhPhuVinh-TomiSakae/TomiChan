import React, { useState, useEffect, useRef } from "react";
import { IconCheck, IconX, IconFolder } from "@tabler/icons-react";
import { chatDB } from "../../../../../../utils/db";
import type { CodeFile, CodeFolder } from "../../../../../../types";
import { nanoid } from "nanoid";
import FileIcon from "../FileIcon";

interface NewItemInputProps {
  type: "file" | "folder";
  level: number;
  parentId: string;
  onCancel: () => void;
}

const NewItemInput: React.FC<NewItemInputProps> = ({
  type,
  level,
  parentId,
  onCancel,
}) => {
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const paddingLeft = level * 16 + (type === "file" ? 20 : 0);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = async () => {
    if (!name.trim()) {
      onCancel();
      return;
    }

    try {
      if (type === "folder") {
        const newFolder: CodeFolder = {
          id: nanoid(),
          name: name.trim(),
          parentId: parentId === "" ? null : parentId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await chatDB.saveFolder(newFolder);
      } else {
        const newFile: CodeFile = {
          id: nanoid(),
          name: name.trim(),
          content: "",
          folderId: parentId === "" ? null : parentId,
          language: name.trim().split(".").pop() || "javascript",
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await chatDB.saveCodeFile(newFile);
      }
      onCancel();
      // Reload data
      window.dispatchEvent(new CustomEvent("fileExplorer:reload"));
    } catch (error) {
      console.error(`Error creating ${type}:`, error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  return (
    <div
      className="flex flex-col py-1 px-2"
      style={{ paddingLeft: `${paddingLeft}px` }}
    >
      <div className="flex items-center">
        {type === "folder" ? (
          <IconFolder size={18} className="mr-2 text-yellow-500" />
        ) : (
          <FileIcon
            fileName={name || "new.txt"}
            size={18}
            className="mr-2 flex-shrink-0"
          />
        )}
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent border-b border-gray-300 dark:border-gray-700 focus:outline-none focus:border-purple-500 py-1"
          placeholder={type === "folder" ? "Tên thư mục mới" : "Tên file mới"}
        />
      </div>
      <div className="flex justify-end mt-1 gap-1">
        <button
          onClick={handleSubmit}
          className="px-2 py-1 bg-green-500 text-white rounded text-xs"
          title="Xác nhận"
        >
          <IconCheck size={14} className="mr-1 inline" /> Lưu
        </button>
        <button
          onClick={onCancel}
          className="px-2 py-1 bg-gray-500 text-white rounded text-xs"
          title="Hủy"
        >
          <IconX size={14} className="mr-1 inline" /> Hủy
        </button>
      </div>
    </div>
  );
};

export default NewItemInput;
