import { useCodeAssistant } from "../../components/TomiChan/Sidebar/MagicRoom/CodeManager/hooks/useCodeAssistant";
import { useRef } from "react";
import { chatDB } from "../../utils/db";
import type { CodeFile, CodeFolder } from "../../types";
import { emitter, FILE_EXPLORER_EVENTS, MAGIC_EVENTS } from "../../lib/events";

export function useCodeManagerProcessor() {
  const { createNewFile, createNewFolder, folders, files } = useCodeAssistant();
  const processedTags = useRef(new Set<string>());

  const processCodeManagerTag = async (content: string) => {
    // Xử lý CodeManager tag để quay về magic room
    const codeManagerRegex = /\[CodeManager\](.*?)\[\/CodeManager\]/;
    const match = content.match(codeManagerRegex);

    if (match) {
      const modeNumber = match[1];
      if (modeNumber === "0") {
        // Thay thế setLocalStorage bằng event
        emitter.emit(MAGIC_EVENTS.BACK_TO_MAGIC_ROOM);
      }
    }

    // Xử lý CreateFile tag
    const createFileRegex = /\[CreateFile\]([\s\S]*?)\[\/CreateFile\]/g;
    const fileMatches = content.matchAll(createFileRegex);
    let hasChanges = false;

    for (const match of fileMatches) {
      const tagContent = match[0];
      if (processedTags.current.has(tagContent)) continue;
      processedTags.current.add(tagContent);

      const fileContent = match[1];
      const name = fileContent.match(/name:\s*(.*)/)?.[1]?.trim();
      const path = fileContent.match(/path:\s*(.*)/)?.[1]?.trim();
      const fileData = fileContent
        .match(/content:\s*([\s\S]*?)(?=\[\/CreateFile\]|$)/)?.[1]
        ?.trim();

      if (name) {
        // Tìm folder ID từ tên folder
        const targetFolder = folders.find((f) => f.name === path);
        await createNewFile({
          name,
          content: fileData || "",
          folderId: targetFolder?.id,
        });
        hasChanges = true;
      }
    }

    // Xử lý CreateFolder tag
    const createFolderRegex = /\[CreateFolder\]([\s\S]*?)\[\/CreateFolder\]/g;
    const folderMatches = content.matchAll(createFolderRegex);

    for (const match of folderMatches) {
      const tagContent = match[0];
      if (processedTags.current.has(tagContent)) continue;
      processedTags.current.add(tagContent);

      const folderContent = match[1];
      const name = folderContent.match(/name:\s*(.*)/)?.[1]?.trim();
      const path = folderContent.match(/path:\s*(.*)/)?.[1]?.trim();

      if (name) {
        // Tìm parent folder ID từ tên folder
        const parentFolder = folders.find((f) => f.name === path);
        await createNewFolder({
          name,
          parentId: parentFolder?.id,
        });
        hasChanges = true;
      }
    }

    // Xử lý RenameFile tag
    const renameFileRegex = /\[RenameFile\]([\s\S]*?)\[\/RenameFile\]/g;
    const renameFileMatches = content.matchAll(renameFileRegex);

    for (const match of renameFileMatches) {
      const tagContent = match[0];
      if (processedTags.current.has(tagContent)) continue;
      processedTags.current.add(tagContent);

      const fileContent = match[1];
      const path = fileContent.match(/path:\s*(.*)/)?.[1]?.trim();
      const newName = fileContent.match(/newName:\s*(.*)/)?.[1]?.trim();

      if (path && newName) {
        const pathParts = path.split("/");
        const fileName = pathParts.pop() || "";
        const folderPath = pathParts.join("/");
        const folder = folders.find((f) => f.name === folderPath);

        const targetFile = files.find(
          (f) => f.name === fileName && f.folderId === folder?.id
        );

        if (targetFile) {
          // Trực tiếp cập nhật file trong DB thay vì qua useCodeAssistant
          const updatedFile: CodeFile = {
            ...targetFile,
            name: newName,
            updatedAt: new Date(),
            language: newName.split(".").pop() || "javascript",
          };

          await chatDB.saveCodeFile(updatedFile);
          hasChanges = true;
        }
      }
    }

    // Xử lý RenameFolder tag
    const renameFolderRegex = /\[RenameFolder\]([\s\S]*?)\[\/RenameFolder\]/g;
    const renameFolderMatches = content.matchAll(renameFolderRegex);

    for (const match of renameFolderMatches) {
      const tagContent = match[0];
      if (processedTags.current.has(tagContent)) continue;
      processedTags.current.add(tagContent);

      const folderContent = match[1];
      const path = folderContent.match(/path:\s*(.*)/)?.[1]?.trim();
      const newName = folderContent.match(/newName:\s*(.*)/)?.[1]?.trim();

      if (path && newName) {
        const folder = folders.find((f) => f.name === path);

        if (folder) {
          // Trực tiếp cập nhật folder trong DB thay vì qua useCodeAssistant
          const updatedFolder: CodeFolder = {
            ...folder,
            name: newName,
            updatedAt: new Date(),
          };

          await chatDB.saveFolder(updatedFolder);
          hasChanges = true;
        }
      }
    }

    // Xử lý DeleteFile tag
    const deleteFileRegex = /\[DeleteFile\]([\s\S]*?)\[\/DeleteFile\]/g;
    const deleteFileMatches = content.matchAll(deleteFileRegex);

    for (const match of deleteFileMatches) {
      const tagContent = match[0];
      if (processedTags.current.has(tagContent)) continue;
      processedTags.current.add(tagContent);

      const fileContent = match[1];
      const path = fileContent.match(/path:\s*(.*)/)?.[1]?.trim();

      if (path) {
        const pathParts = path.split("/");
        const fileName = pathParts.pop() || "";
        const folderPath = pathParts.join("/");
        const folder = folders.find((f) => f.name === folderPath);

        const targetFile = files.find(
          (f) => f.name === fileName && f.folderId === folder?.id
        );

        if (targetFile) {
          // Trực tiếp xóa file trong DB thay vì qua useCodeAssistant
          await chatDB.deleteCodeFile(targetFile.id);
          hasChanges = true;
        }
      }
    }

    // Xử lý DeleteFolder tag
    const deleteFolderRegex = /\[DeleteFolder\]([\s\S]*?)\[\/DeleteFolder\]/g;
    const deleteFolderMatches = content.matchAll(deleteFolderRegex);

    for (const match of deleteFolderMatches) {
      const tagContent = match[0];
      if (processedTags.current.has(tagContent)) continue;
      processedTags.current.add(tagContent);

      const folderContent = match[1];
      const path = folderContent.match(/path:\s*(.*)/)?.[1]?.trim();

      if (path) {
        const folder = folders.find((f) => f.name === path);
        if (folder) {
          // Trực tiếp xóa folder trong DB thay vì qua useCodeAssistant
          await chatDB.deleteFolder(folder.id);
          hasChanges = true;
        }
      }
    }

    // Xử lý OpenMedia tag
    const openMediaRegex = /\[OpenMedia\]([\s\S]*?)\[\/OpenMedia\]/g;
    const mediaMatches = content.matchAll(openMediaRegex);

    for (const match of mediaMatches) {
      const tagContent = match[0];
      if (processedTags.current.has(tagContent)) continue;
      processedTags.current.add(tagContent);

      const mediaContent = match[1];
      const path = mediaContent.match(/path:\s*(.*)/)?.[1]?.trim();

      if (path) {
        // Tìm file từ đường dẫn
        const pathParts = path.split("/");
        const fileName = pathParts.pop() || "";
        const folderPath = pathParts.join("/");
        const folder = folders.find((f) => f.name === folderPath);

        const targetFile = files.find(
          (f) => f.name === fileName && f.folderId === folder?.id
        );

        if (targetFile) {
          // Thay thế localStorage bằng event
          emitter.emit(MAGIC_EVENTS.OPEN_MEDIA, { fileName: targetFile.name });
        }
      }
    }

    // Nếu có thay đổi, phát event để reload
    if (hasChanges) {
      emitter.emit(FILE_EXPLORER_EVENTS.RELOAD);
    }
  };

  return { processCodeManagerTag };
}
