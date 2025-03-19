/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import { getLocalStorage } from "../../utils/localStorage";
import {
  getSessionStorage,
  setSessionStorage,
} from "../../utils/sessionStorage";
import { FILE_EXPLORER_EVENTS, MAGIC_EVENTS } from "@/lib/events";
import { emitter } from "@/lib/events";
import { useFileManager } from "./useFileManager";
import { useCurrentFile } from "./useCurrentFile";
import { useSentFiles } from "./useSentFiles";
import { getCodeViewPrompt } from "./prompts/codeViewPrompt";
import { getCodeManagerPrompt } from "./prompts/codeManagerPrompt";
import { getMagicRoomPrompt } from "./prompts/magicRoomPrompt";
import { getImageGenerationPrompt } from "./prompts/imageGenerationPrompt";
import { getSearchPrompt } from "./prompts/searchPrompt";
import { getSentFilesPrompt } from "./prompts/sentFilesPrompt";
import { getSystemTagPrompt } from "./prompts/systemTagPrompt";
import { getProjectManagementPrompt } from "./prompts/fileManagementPrompt";
import { getEmailToolPrompt } from "./prompts/emailToolPrompt";
import { getTVUScheduleToolPrompt } from "./prompts/tvuScheduleToolPrompt";

export function useSystemPrompt() {
  const [uiState, setUiState] = useState(
    getSessionStorage("ui_state_magic", "none")
  );

  const {
    files,
    folders,
    projects,
    loadFilesAndFolders,
    createFileTree,
    createProjectFileTree,
    createFullFileTree,
  } = useFileManager();

  const { currentFile, currentFileContent, loadCurrentFileContent } =
    useCurrentFile(files);
  const { sentFiles, setSentFiles, loadSentFiles } = useSentFiles(
    files,
    currentFile
  );

  useEffect(() => {
    const checkUiState = async () => {
      const currentState = getSessionStorage("ui_state_magic", "none");
      if (currentState !== uiState) {
        setUiState(currentState);
        if (currentState === "code_manager") {
          await loadFilesAndFolders();
        }
      }
    };

    if (!getSessionStorage("ui_state_magic")) {
      setSessionStorage("ui_state_magic", "none");
    }

    // Lắng nghe sự kiện reload
    const handleReload = () => {
      loadFilesAndFolders();
    };

    // Lắng nghe sự kiện khi file được gửi cho AI
    const handleFileSentToAI = () => {
      loadSentFiles();
    };

    // Lắng nghe sự kiện khi file bị xóa khỏi danh sách
    const handleFileRemovedFromAI = () => {
      loadSentFiles();
    };

    // Lắng nghe sự kiện khi tất cả file bị xóa khỏi danh sách
    const handleAllFilesRemovedFromAI = () => {
      setSentFiles([]);
    };

    emitter.on(FILE_EXPLORER_EVENTS.RELOAD, handleReload);
    emitter.on(MAGIC_EVENTS.FILE_SENT_TO_AI, handleFileSentToAI);
    emitter.on(MAGIC_EVENTS.FILE_REMOVED_FROM_AI, handleFileRemovedFromAI);
    emitter.on(
      MAGIC_EVENTS.ALL_FILES_REMOVED_FROM_AI,
      handleAllFilesRemovedFromAI
    );

    const intervalId = setInterval(checkUiState, 1000);

    loadSentFiles();

    return () => {
      clearInterval(intervalId);
      emitter.off(FILE_EXPLORER_EVENTS.RELOAD, handleReload);
      emitter.off(MAGIC_EVENTS.FILE_SENT_TO_AI, handleFileSentToAI);
      emitter.off(MAGIC_EVENTS.FILE_REMOVED_FROM_AI, handleFileRemovedFromAI);
      emitter.off(
        MAGIC_EVENTS.ALL_FILES_REMOVED_FROM_AI,
        handleAllFilesRemovedFromAI
      );
    };
  }, [uiState, files]);

  const getEnhancedSystemPrompt = async (provider: string) => {
    // Tải mới tất cả dữ liệu trước khi tạo system prompt
    await loadFilesAndFolders();
    await loadCurrentFileContent();
    await loadSentFiles();

    // Tải lại files và folders nếu đang ở chế độ code_manager
    const isCodeManager = uiState === "code_manager";
    if (isCodeManager) {
      await loadFilesAndFolders();
    }

    // Đọc trạng thái Magic Mode từ localStorage với tên biến mới
    const isMagicMode =
      getSessionStorage("ui_state_magic", "none") === "magic_room";

    const imageGeneration =
      getLocalStorage("image_generation", "false") === "true";
    const searchEnabled = getLocalStorage("search_enabled", "false") === "true";

    const basePrompt =
      provider === "google"
        ? getLocalStorage(
            "system_prompt",
            `Bạn là 1 Chat Bot AI tên là TomiChan được phát triển bởi TomiSakae!`
          )
        : provider === "groq"
        ? getLocalStorage(
            "groq_system_prompt",
            `Bạn là 1 Chat Bot AI tên là TomiChan được phát triển bởi TomiSakae!`
          )
        : getLocalStorage(
            "openrouter_system_prompt",
            `Bạn là 1 Chat Bot AI tên là TomiChan được phát triển bởi TomiSakae!`
          );

    // Bắt đầu với basePrompt
    let enhancedPrompt = basePrompt;

    // Thêm các tính năng tùy chọn nếu được bật
    if (imageGeneration) {
      const imageConfig = JSON.parse(
        getLocalStorage("image_config", "{}") || "{}"
      );

      enhancedPrompt =
        getImageGenerationPrompt(
          imageConfig.width || 1024,
          imageConfig.height || 768
        ) + enhancedPrompt;
    }

    if (searchEnabled) {
      enhancedPrompt = getSearchPrompt() + enhancedPrompt;
    }

    // Kiểm tra xem có đang ở chế độ code_view không
    const isCodeView = uiState === "code_view";

    if (isCodeView) {
      // Sử dụng dữ liệu từ hook useCurrentFile
      const fileName = currentFile;
      let fileContent = currentFileContent;

      // Nếu không có nội dung, tải nội dung file
      if (fileName && !fileContent) {
        await loadCurrentFileContent();
        fileContent = currentFileContent;
      }

      // Tìm thông tin projectId cho file hiện tại
      let projectId = "";
      for (const file of files) {
        if (file.name === fileName) {
          projectId = file.projectId || "";
          break;
        }
      }

      // Sử dụng createProjectFileTree nếu file thuộc project, ngược lại sử dụng createFileTree nhưng không hiển thị danh sách dự án
      try {
        let fileTree;
        let currentProject = null;

        if (projectId) {
          // Tìm thông tin project
          currentProject = projects.find((p) => p.id === projectId) || null;

          // Nếu file thuộc project, chỉ hiện file và thư mục trong project đó
          fileTree = createProjectFileTree(projectId, fileName);
        } else {
          // Nếu file ở root, chỉ hiện file và thư mục ở root
          fileTree = createFileTree(undefined);
        }

        enhancedPrompt =
          getCodeViewPrompt(fileName, fileContent, fileTree, currentProject) +
          enhancedPrompt;
      } catch (error) {
        console.error("Lỗi khi lấy cấu trúc file:", error);

        // Fallback về createFileTree nếu có lỗi
        enhancedPrompt =
          getCodeViewPrompt(
            fileName,
            fileContent,
            createFileTree(undefined),
            null
          ) + enhancedPrompt;
      }
    }

    // Kiểm tra xem có đang ở chế độ media_view không
    const isMediaView = uiState === "media_view";

    if (isCodeManager || isMediaView) {
      const codeManagerPrompt = getCodeManagerPrompt(
        createFullFileTree,
        isMediaView
      );
      const projectManagementPrompt = getProjectManagementPrompt();
      enhancedPrompt =
        projectManagementPrompt + codeManagerPrompt + enhancedPrompt;
    }

    // Thêm hướng dẫn cho Magic Mode nếu được bật
    if (isMagicMode) {
      const magicModePrompt = getMagicRoomPrompt();
      enhancedPrompt = magicModePrompt + enhancedPrompt;
    }

    // Thêm nội dung của các file đã gửi cho AI vào system prompt chỉ khi đang ở trong code view
    if (isCodeView && sentFiles.length > 0) {
      enhancedPrompt = getSentFilesPrompt(sentFiles) + enhancedPrompt;
    }

    // Kiểm tra xem công cụ nào đã được bật
    const enabledTools = JSON.parse(getLocalStorage("enabled_tools", "[]"));
    const isEmailEnabled = enabledTools.includes("email");
    const isTVUScheduleEnabled = enabledTools.includes("tvu_schedule");

    if (isEmailEnabled) {
      const emailToolPrompt = getEmailToolPrompt();
      enhancedPrompt = emailToolPrompt + enhancedPrompt;
    }

    if (isTVUScheduleEnabled) {
      const tvuScheduleToolPrompt = getTVUScheduleToolPrompt();
      enhancedPrompt = tvuScheduleToolPrompt + enhancedPrompt;
    }

    // Luôn luôn thêm systemTagInstruction vào cuối
    return enhancedPrompt + "\n\n" + getSystemTagPrompt();
  };

  return {
    getEnhancedSystemPrompt,
    loadFilesAndFolders,
    files,
    folders,
    currentFile,
    currentFileContent,
    sentFiles,
    loadSentFiles,
    loadCurrentFileContent,
  };
}
