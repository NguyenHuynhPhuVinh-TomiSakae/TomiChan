/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { IconFilePlus } from "@tabler/icons-react";

interface FileCreationPreviewProps {
  content: string;
}

export const FileCreationPreview: React.FC<FileCreationPreviewProps> = ({
  content,
}) => {
  // Tìm tên file từ dòng "name: "
  const nameMatch = content.match(/name:\s*(.*)/);
  const fileName = nameMatch ? nameMatch[1].trim() : "";

  // Tìm path từ dòng "path: " nếu có, nếu không thì dùng fileName
  const pathMatch = content.match(/path:\s*(.*)/);
  const filePath = pathMatch ? pathMatch[1].trim() : fileName;

  return (
    <div className="my-4 p-4 rounded-lg border-2 border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <IconFilePlus className="text-blue-500" size={20} />
          <span className="font-semibold bg-gradient-to-r from-blue-400 via-cyan-500 to-blue-500 text-transparent bg-clip-text">
            Tạo File Mới: {fileName}
          </span>
        </div>
        {filePath !== fileName && (
          <div className="ml-6 text-sm text-gray-500 dark:text-gray-400">
            Đường dẫn: {filePath}
          </div>
        )}
      </div>
    </div>
  );
};
