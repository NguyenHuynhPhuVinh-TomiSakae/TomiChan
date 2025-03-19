import { useEffect } from "react";
import { chatDB } from "../../utils/db";
import { emitter, MAGIC_EVENTS, FILE_EXPLORER_EVENTS } from "../../lib/events";
import { setSessionStorage } from "@/utils/sessionStorage";

export function useCodeViewProcessor() {
  useEffect(() => {
    const handleAcceptCode = async ({
      filePath,
      newContent,
      projectId,
    }: {
      filePath: string;
      newContent: string;
      projectId?: string;
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

        // Xử lý tìm kiếm file trong dự án nếu có projectId
        if (projectId) {
          console.log(
            `Tìm file trong dự án: ${projectId}, đường dẫn: ${filePath}`
          );

          // Tìm file trực tiếp trong dự án trước
          fileToUpdate = allFiles.find(
            (f) => f.name === fileName && f.projectId === projectId
          );

          // Nếu có đường dẫn thư mục
          if (!fileToUpdate && pathParts.length > 0) {
            // Tìm thư mục phù hợp với đường dẫn trong dự án
            let currentFolderId: string | null = null;
            let folderPath = "";

            for (const folderName of pathParts) {
              if (!folderName) continue;
              folderPath += (folderPath ? "/" : "") + folderName;

              // Tìm thư mục con trong thư mục hiện tại, ưu tiên thư mục trong dự án
              const matchingFolders = allFolders.filter(
                (f) =>
                  f.name === folderName &&
                  f.projectId === projectId &&
                  ((!currentFolderId && !f.parentId) ||
                    f.parentId === currentFolderId)
              );

              if (matchingFolders.length > 0) {
                currentFolderId = matchingFolders[0].id;
              } else {
                console.warn(
                  `Không tìm thấy thư mục trong dự án: ${folderPath}`
                );
                currentFolderId = null;
                break;
              }
            }

            // Nếu tìm thấy thư mục, tìm file trong thư mục đó
            if (currentFolderId) {
              fileToUpdate = allFiles.find(
                (f) =>
                  f.name === fileName &&
                  f.folderId === currentFolderId &&
                  f.projectId === projectId
              );
            }
          }
        }

        // Nếu không có projectId hoặc không tìm thấy trong dự án, tìm kiếm như thông thường
        if (!fileToUpdate) {
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
        }

        if (!fileToUpdate) {
          console.warn(
            `Không tìm thấy file: ${fileName} (từ đường dẫn: ${filePath}${
              projectId ? `, dự án: ${projectId}` : ""
            })`
          );
          return;
        }

        console.log(
          `Đã tìm thấy file: ${fileToUpdate.name}, ID: ${fileToUpdate.id}`
        );

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
    // Xử lý PATH tag để cập nhật nội dung file
    const pathRegex = /\[PATH\](.*?)\[\/PATH\]\s*```(?:\w*)\s*([\s\S]*?)```/g;
    const matches = [...content.matchAll(pathRegex)];

    for (const match of matches) {
      const pathInfo = match[1];
      const code = match[2].trim();

      // Kiểm tra xem pathInfo có chứa projectId không (định dạng path|projectId)
      const [filePath, projectId] = pathInfo.split("|").map((s) => s.trim());

      console.log(
        `Xử lý file path: ${filePath}, projectId: ${projectId || "không có"}`
      );

      if (filePath) {
        // Gửi event để cập nhật nội dung file với projectId nếu có
        emitter.emit(MAGIC_EVENTS.ACCEPT_CODE, {
          filePath,
          newContent: code,
          projectId: projectId || undefined,
        });
      }
    }

    // Xử lý OpenCode tag
    const openCodeRegex = /\[OpenCode\]([\s\S]*?)\[\/OpenCode\]/g;
    const codeMatches = content.matchAll(openCodeRegex);

    for (const match of codeMatches) {
      const codeContent = match[1];
      const path = codeContent.match(/path:\s*(.*)/)?.[1]?.trim();
      const projectId = codeContent.match(/projectId:\s*(.*)/)?.[1]?.trim();

      if (path) {
        setSessionStorage("ui_state_magic", "code_view");
        emitter.emit(MAGIC_EVENTS.OPEN_CODE_FILE, {
          filePath: path,
          projectId: projectId,
        });
      }
    }

    // Xử lý CodeEditor tag để quay về
    const codeEditorRegex = /\[CodeEditor\]0\[\/CodeEditor\]/g;
    const editorMatches = content.match(codeEditorRegex);

    if (editorMatches) {
      setSessionStorage("ui_state_magic", "code_manager");
      // Phát event để đóng code file và quay về code_manager
      emitter.emit(MAGIC_EVENTS.CLOSE_CODE_FILE);
    }
  };

  return { processCodeViewTag };
}
