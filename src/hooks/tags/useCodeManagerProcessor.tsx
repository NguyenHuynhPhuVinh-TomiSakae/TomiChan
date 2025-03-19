import { useCodeAssistant } from "../../components/TomiChan/Sidebar/MagicRoom/CodeManager/hooks/useCodeAssistant";
import { useRef } from "react";
import { chatDB } from "../../utils/db";
import type { CodeFile, CodeFolder } from "../../types";
import { emitter, FILE_EXPLORER_EVENTS, MAGIC_EVENTS } from "../../lib/events";
import { setSessionStorage } from "@/utils/sessionStorage";
import { nanoid } from "nanoid";
import { getApiKey } from "../../utils/getApiKey";

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
        setSessionStorage("ui_state_magic", "magic_room");
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
      const projectId = fileContent.match(/projectId:\s*(.*)/)?.[1]?.trim();
      const fileData = fileContent
        .match(/content:\s*([\s\S]*?)(?=\[\/CreateFile\]|$)/)?.[1]
        ?.trim();

      if (name) {
        console.log(
          `Chuẩn bị tạo file: ${name}, projectId: ${projectId || "undefined"}`
        );

        // Tìm folder ID từ tên folder
        const targetFolder = folders.find((f) => {
          // Nếu có projectId, folder phải thuộc project đó
          if (projectId && path) {
            return f.name === path && f.projectId === projectId;
          }
          // Nếu không có projectId, tìm folder không thuộc project nào
          if (path) {
            return f.name === path && !f.projectId;
          }
          return false;
        });

        // Log ra thông tin tìm được
        if (path) {
          console.log(
            `Tìm folder: ${path}, kết quả: ${
              targetFolder ? targetFolder.id : "không tìm thấy"
            }`
          );
        }

        // Đảm bảo projectId được chuyển đúng kiểu dữ liệu
        const fileCreateInfo: Partial<CodeFile> = {
          name,
          content: fileData || "",
          folderId: targetFolder?.id,
        };

        // Chỉ thêm projectId nếu nó tồn tại
        if (projectId) {
          fileCreateInfo.projectId = projectId;
          console.log(`Thêm projectId: ${projectId} vào thông tin file`);
        }

        await createNewFile(fileCreateInfo);
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
      const projectId = folderContent.match(/projectId:\s*(.*)/)?.[1]?.trim();

      if (name) {
        console.log(
          `Chuẩn bị tạo thư mục: ${name}, projectId: ${
            projectId || "undefined"
          }`
        );

        // Tìm parent folder ID từ tên folder
        const parentFolder = folders.find((f) => {
          // Nếu có projectId, folder phải thuộc project đó
          if (projectId && path) {
            return f.name === path && f.projectId === projectId;
          }
          // Nếu không có projectId, tìm folder không thuộc project nào
          if (path) {
            return f.name === path && !f.projectId;
          }
          return false;
        });

        // Log ra thông tin tìm được
        if (path) {
          console.log(
            `Tìm folder cha: ${path}, kết quả: ${
              parentFolder ? parentFolder.id : "không tìm thấy"
            }`
          );
        }

        // Đảm bảo projectId được chuyển đúng kiểu dữ liệu
        const folderCreateInfo: Partial<CodeFolder> = {
          name,
          parentId: parentFolder?.id,
        };

        // Chỉ thêm projectId nếu nó tồn tại
        if (projectId) {
          folderCreateInfo.projectId = projectId;
          console.log(`Thêm projectId: ${projectId} vào thông tin thư mục`);
        }

        await createNewFolder(folderCreateInfo);
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
          setSessionStorage("ui_state_magic", "media_view");
          emitter.emit(MAGIC_EVENTS.OPEN_MEDIA, { fileName: targetFile.name });
        }
      }
    }

    // Xử lý CreateProject tag
    const createProjectRegex =
      /\[CreateProject\]([\s\S]*?)\[\/CreateProject\]/g;
    const projectMatches = content.matchAll(createProjectRegex);

    for (const match of projectMatches) {
      const tagContent = match[0];
      if (processedTags.current.has(tagContent)) continue;
      processedTags.current.add(tagContent);

      const projectContent = match[1];
      const name = projectContent.match(/name:\s*(.*)/)?.[1]?.trim();
      const description =
        projectContent.match(/description:\s*(.*)/)?.[1]?.trim() || "";

      if (name) {
        // Tạo project mới
        const newProject = {
          id: nanoid(),
          name,
          description,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await chatDB.saveProject(newProject);
        hasChanges = true;
      }
    }

    // Xử lý UpdateProject tag
    const updateProjectRegex =
      /\[UpdateProject\]([\s\S]*?)\[\/UpdateProject\]/g;
    const updateProjectMatches = content.matchAll(updateProjectRegex);

    for (const match of updateProjectMatches) {
      const tagContent = match[0];
      if (processedTags.current.has(tagContent)) continue;
      processedTags.current.add(tagContent);

      const projectContent = match[1];
      const id = projectContent.match(/id:\s*(.*)/)?.[1]?.trim();
      const name = projectContent.match(/name:\s*(.*)/)?.[1]?.trim();
      const description =
        projectContent.match(/description:\s*(.*)/)?.[1]?.trim() || "";

      if (id && name) {
        // Tìm project theo id
        const project = await chatDB.getProject(id);

        if (project) {
          // Cập nhật project
          const updatedProject = {
            ...project,
            name,
            description,
            updatedAt: new Date(),
          };

          await chatDB.saveProject(updatedProject);
          hasChanges = true;
        }
      }
    }

    // Xử lý DeleteProject tag
    const deleteProjectRegex =
      /\[DeleteProject\]([\s\S]*?)\[\/DeleteProject\]/g;
    const deleteProjectMatches = content.matchAll(deleteProjectRegex);

    for (const match of deleteProjectMatches) {
      const tagContent = match[0];
      if (processedTags.current.has(tagContent)) continue;
      processedTags.current.add(tagContent);

      const projectContent = match[1];
      const id = projectContent.match(/id:\s*(.*)/)?.[1]?.trim();

      if (id) {
        try {
          // Xóa project từ DB
          await chatDB.deleteProject(id);

          // Cần thêm xử lý xóa project từ E2B nếu cần
          const e2bApiKey = await getApiKey("e2b", "e2b_api_key");
          fetch("/api/e2b/delete-project", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-E2B-API-Key": e2bApiKey,
            },
            body: JSON.stringify({
              projectId: id,
            }),
          });

          hasChanges = true;
        } catch (error) {
          console.error("Lỗi khi xóa project:", error);
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
