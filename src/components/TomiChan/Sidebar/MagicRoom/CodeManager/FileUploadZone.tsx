/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { ReactNode } from "react";
import { IconUpload, IconFolderUp } from "@tabler/icons-react";
import { CodeFile } from "@/types";
import { FILE_EXPLORER_EVENTS } from "@/lib/events";
import { emitter } from "@/lib/events";

interface FileUploadZoneProps {
  currentFolder: string | null;
  createNewFile: (file?: Partial<CodeFile>) => Promise<CodeFile | undefined>;
  createNewFolder: (folder?: {
    name: string;
    parentId?: string;
  }) => Promise<{ id: string; name: string } | undefined>;
  isMediaFile: (fileName: string) => boolean;
  children?: ReactNode;
  className?: string;
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  currentFolder,
  createNewFile,
  createNewFolder,
  isMediaFile,
  children,
  className,
}) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const dropZoneRef = React.useRef<HTMLDivElement>(null);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();

    if (isMediaFile(file.name)) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }

    reader.onload = async (e) => {
      if (e.target?.result) {
        const content = e.target.result.toString();
        const newFile: Partial<CodeFile> = {
          name: file.name,
          content: content,
          folderId: currentFolder || undefined,
          updatedAt: new Date(),
        };
        await createNewFile(newFile);
        // Trigger reload sau khi tạo file
        emitter.emit(FILE_EXPLORER_EVENTS.RELOAD);
      }
    };

    event.target.value = "";
  };

  const handleFolderUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Tạo map để lưu trữ đường dẫn thư mục và ID tương ứng
    const folderPathMap = new Map<string, string>();

    // Thêm thư mục gốc hiện tại vào map
    if (currentFolder) {
      folderPathMap.set("", currentFolder);
    } else {
      folderPathMap.set("", "root");
    }

    // Xử lý từng file trong thư mục được tải lên
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const relativePath = file.webkitRelativePath;
      const pathParts = relativePath.split("/");
      const fileName = pathParts.pop() || "";
      const folderPath = pathParts.join("/");

      // Tạo các thư mục cần thiết
      let parentId = currentFolder;
      let currentPath = "";

      for (let j = 0; j < pathParts.length; j++) {
        const folderName = pathParts[j];
        const previousPath = currentPath;
        currentPath = currentPath ? `${currentPath}/${folderName}` : folderName;

        // Kiểm tra xem thư mục đã được tạo chưa
        if (!folderPathMap.has(currentPath)) {
          // Lấy ID thư mục cha
          parentId =
            folderPathMap.get(previousPath) === "root"
              ? null
              : folderPathMap.get(previousPath) || null;

          // Tạo thư mục mới
          const newFolder = await createNewFolder({
            name: folderName,
            parentId: parentId || undefined,
          });

          // Lưu ID thư mục mới vào map
          folderPathMap.set(currentPath, newFolder?.id || "");
          parentId = newFolder?.id || null;
        } else {
          parentId =
            folderPathMap.get(currentPath) === "root"
              ? null
              : folderPathMap.get(currentPath) || null;
        }
      }

      // Đọc và lưu file
      const reader = new FileReader();

      if (isMediaFile(fileName)) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }

      reader.onload = async (e) => {
        if (e.target?.result) {
          const content = e.target.result.toString();
          const folderId =
            folderPathMap.get(folderPath) === "root"
              ? null
              : folderPathMap.get(folderPath);

          const newFile: Partial<CodeFile> = {
            name: fileName,
            content: content,
            folderId: folderId || undefined,
            updatedAt: new Date(),
          };

          await createNewFile(newFile);
        }
      };
    }

    // Trigger reload sau khi hoàn thành tất cả các thao tác
    emitter.emit(FILE_EXPLORER_EVENTS.RELOAD);

    event.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // Chỉ tắt trạng thái kéo thả khi rời khỏi vùng chứa (không phải các phần tử con)
    if (
      dropZoneRef.current &&
      !dropZoneRef.current.contains(e.relatedTarget as Node)
    ) {
      setIsDragging(false);
    }
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    // Xử lý các file được kéo thả
    const items = e.dataTransfer.items;
    if (!items) return;

    // Hàm đệ quy để xử lý thư mục
    const processEntry = async (
      entry: any,
      parentFolderId: string | null = currentFolder
    ) => {
      if (entry.isFile) {
        entry.file(async (file: File) => {
          const reader = new FileReader();

          if (isMediaFile(file.name)) {
            reader.readAsDataURL(file);
          } else {
            reader.readAsText(file);
          }

          reader.onload = (e) => {
            if (e.target?.result) {
              const content = e.target.result.toString();
              const newFile: Partial<CodeFile> = {
                name: file.name,
                content: content,
                folderId: parentFolderId || undefined,
                updatedAt: new Date(),
              };
              createNewFile(newFile);
            }
          };
        });
      } else if (entry.isDirectory) {
        // Tạo thư mục mới
        const newFolder = await createNewFolder({
          name: entry.name,
          parentId: parentFolderId || undefined,
        });

        const newFolderId = newFolder?.id;

        // Đọc nội dung thư mục
        const reader = entry.createReader();
        reader.readEntries(async (entries: any[]) => {
          for (const childEntry of entries) {
            await processEntry(childEntry, newFolderId || null);
          }
        });
      }
    };

    // Xử lý từng item được kéo thả
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      // Chỉ xử lý các item kiểu file
      if (item.kind === "file") {
        const entry = item.webkitGetAsEntry();
        if (entry) {
          await processEntry(entry);
        } else {
          // Fallback cho trình duyệt không hỗ trợ webkitGetAsEntry
          const file = item.getAsFile();
          if (file) {
            const reader = new FileReader();

            if (isMediaFile(file.name)) {
              reader.readAsDataURL(file);
            } else {
              reader.readAsText(file);
            }

            reader.onload = (e) => {
              if (e.target?.result) {
                const content = e.target.result.toString();
                const newFile: Partial<CodeFile> = {
                  name: file.name,
                  content: content,
                  folderId: currentFolder || undefined,
                  updatedAt: new Date(),
                };
                createNewFile(newFile);
              }
            };
          }
        }
      }
    }

    // Trigger reload sau khi hoàn thành tất cả các thao tác
    emitter.emit(FILE_EXPLORER_EVENTS.RELOAD);
  };

  // Nếu không có children, chỉ hiển thị các nút tải lên
  if (!children) {
    return (
      <div className="flex gap-2">
        <label
          className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors cursor-pointer"
          title="Tải file lên"
        >
          <IconUpload size={20} className="mr-1" />
          <span className="hidden sm:inline">Tải file</span>
          <input
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            accept=".txt,.js,.jsx,.ts,.tsx,.html,.css,.json,.md,.py,.java,.cpp,.c,.cs,.php,.rb,.rs,.sql,.swift,.go,.yml,.yaml,.jpg,.jpeg,.png,.gif,.webp,.svg,.mp3,.wav,.ogg,.aac,.mp4,.webm,.ogv,.mov,.pdf"
          />
        </label>
        <label
          className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors cursor-pointer"
          title="Tải thư mục lên"
        >
          <IconFolderUp size={20} className="mr-1" />
          <span className="hidden sm:inline">Tải thư mục</span>
          <input
            type="file"
            className="hidden"
            onChange={handleFolderUpload}
            webkitdirectory=""
            directory=""
            multiple
          />
        </label>
      </div>
    );
  }

  // Nếu có children, bọc chúng trong vùng kéo thả
  return (
    <div
      ref={dropZoneRef}
      className={className}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDragEnd={handleDragEnd}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="absolute inset-0 bg-purple-100 dark:bg-purple-900 bg-opacity-50 dark:bg-opacity-30 flex items-center justify-center border-2 border-dashed border-purple-500 z-10 rounded-lg pointer-events-none">
          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <IconUpload size={48} className="mx-auto mb-2 text-purple-500" />
            <p className="text-lg font-medium">
              Thả file hoặc thư mục để tải lên
            </p>
          </div>
        </div>
      )}
      {children}
    </div>
  );
};

export default FileUploadZone;
