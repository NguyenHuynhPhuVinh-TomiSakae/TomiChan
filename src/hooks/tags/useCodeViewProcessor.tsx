import { useEffect } from "react";
import { chatDB } from "../../utils/db";
import { emitter, MAGIC_EVENTS, FILE_EXPLORER_EVENTS } from "../../lib/events";

export function useCodeViewProcessor() {
  useEffect(() => {
    const handleAcceptCode = async ({
      filePath,
      newContent,
    }: {
      filePath: string;
      newContent: string;
    }) => {
      try {
        // Tìm file trong CSDL
        const allFiles = await chatDB.getAllCodeFiles();
        const allFolders = await chatDB.getAllFolders();

        // Lấy tên file từ đường dẫn (không bao gồm thư mục)
        const pathParts = filePath.split("/");
        const fileName = pathParts.pop() || filePath;

        // Tìm file theo tên file
        let fileToUpdate = null;

        // Nếu có đường dẫn thư mục
        if (pathParts.length > 0) {
          // Tìm thư mục phù hợp với đường dẫn
          let currentFolderId: string | null = null;
          let folderPath = "";

          for (const folderName of pathParts) {
            if (!folderName) continue;
            folderPath += (folderPath ? "/" : "") + folderName;

            // Tìm thư mục con trong thư mục hiện tại
            const matchingFolders = allFolders.filter(
              (f) =>
                f.name === folderName &&
                ((!currentFolderId && !f.parentId) ||
                  f.parentId === currentFolderId)
            );

            if (matchingFolders.length > 0) {
              currentFolderId = matchingFolders[0].id;
            } else {
              console.warn(`Không tìm thấy thư mục: ${folderPath}`);
              currentFolderId = null;
              break;
            }
          }

          // Nếu tìm thấy thư mục, tìm file trong thư mục đó
          if (currentFolderId) {
            fileToUpdate = allFiles.find(
              (f) => f.name === fileName && f.folderId === currentFolderId
            );
          }
        }

        // Nếu không tìm thấy file theo đường dẫn, thử tìm theo tên
        if (!fileToUpdate) {
          fileToUpdate = allFiles.find((f) => f.name === fileName);
        }

        if (!fileToUpdate) {
          console.warn(
            `Không tìm thấy file: ${fileName} (từ đường dẫn: ${filePath})`
          );
          return;
        }

        // Cập nhật nội dung file
        await chatDB.saveCodeFile({
          ...fileToUpdate,
          content: newContent,
          updatedAt: new Date(),
        });

        // Phát event để thông báo cho CodeEditor
        emitter.emit(MAGIC_EVENTS.FILE_CONTENT_UPDATED, {
          fileId: fileToUpdate.id,
          fileName: fileToUpdate.name,
          content: newContent,
        });

        emitter.emit(FILE_EXPLORER_EVENTS.RELOAD);
        console.log(`Đã cập nhật file: ${fileToUpdate.name}`);
      } catch (error) {
        console.error("Lỗi khi cập nhật file:", error);
      }
    };

    // Đăng ký lắng nghe sự kiện
    emitter.on(MAGIC_EVENTS.ACCEPT_CODE, handleAcceptCode);

    // Cleanup
    return () => {
      emitter.off(MAGIC_EVENTS.ACCEPT_CODE, handleAcceptCode);
    };
  }, []);

  const processCodeViewTag = async (content: string) => {
    // Xử lý OpenCode tag
    const openCodeRegex = /\[OpenCode\]([\s\S]*?)\[\/OpenCode\]/g;
    const codeMatches = content.matchAll(openCodeRegex);

    for (const match of codeMatches) {
      const codeContent = match[1];
      const path = codeContent.match(/path:\s*(.*)/)?.[1]?.trim();

      if (path) {
        emitter.emit(MAGIC_EVENTS.OPEN_CODE_FILE, { filePath: path });
      }
    }

    // Xử lý CodeEditor tag để quay về
    const codeEditorRegex = /\[CodeEditor\]0\[\/CodeEditor\]/g;
    const editorMatches = content.match(codeEditorRegex);

    if (editorMatches) {
      // Phát event để đóng code file và quay về code_manager
      emitter.emit(MAGIC_EVENTS.CLOSE_CODE_FILE);
    }
  };

  return { processCodeViewTag };
}
