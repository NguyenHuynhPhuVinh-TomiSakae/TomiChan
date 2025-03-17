/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { getLocalStorage } from "../utils/localStorage";
import { getSessionStorage, setSessionStorage } from "../utils/sessionStorage";
import { chatDB } from "../utils/db";
import { FILE_EXPLORER_EVENTS } from "@/lib/events";
import { emitter } from "@/lib/events";

export function useSystemPrompt() {
  const [uiState, setUiState] = useState(
    getSessionStorage("ui_state_magic", "none")
  );
  const [files, setFiles] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [currentFile, setCurrentFile] = useState(
    getLocalStorage("current_open_file", "")
  );
  const [currentFileContent, setCurrentFileContent] = useState("");
  const [sentFiles, setSentFiles] = useState<
    { name: string; content: string }[]
  >([]);

  const loadFilesAndFolders = async () => {
    const newFiles = await chatDB.getAllCodeFiles();
    const newFolders = await chatDB.getAllFolders();
    setFiles(newFiles);
    setFolders(newFolders);
  };

  // Tải danh sách file đã gửi cho AI và nội dung của chúng
  const loadSentFiles = async () => {
    const sentFilesStr = getLocalStorage("files_sent_to_ai", "[]");
    try {
      const fileNames = JSON.parse(sentFilesStr);

      // Tải nội dung của các file từ CSDL
      const filesWithContent = await Promise.all(
        fileNames.map(async (fileName: string) => {
          // Kiểm tra xem file có phải là file đang mở không
          const isCurrentlyOpenFile = fileName === currentFile;

          // Nếu là file đang mở, không gửi nội dung
          if (isCurrentlyOpenFile) {
            return {
              name: fileName,
              content: "", // Không gửi nội dung cho file đang mở
            };
          }

          // Tìm file trong danh sách files đã tải
          let fileObj = files.find((f) => f.name === fileName);

          if (!fileObj) {
            // Nếu không tìm thấy trong danh sách đã tải, tìm trong database
            const allFiles = await chatDB.getAllCodeFiles();
            fileObj = allFiles.find((f) => f.name === fileName);
          }

          return {
            name: fileName,
            content: fileObj ? fileObj.content || "" : "",
          };
        })
      );

      setSentFiles(filesWithContent);
    } catch (error) {
      console.error("Lỗi khi tải danh sách file đã gửi cho AI:", error);
      setSentFiles([]);
    }
  };

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

    // Đảm bảo có giá trị ban đầu
    if (!getSessionStorage("ui_state_magic")) {
      setSessionStorage("ui_state_magic", "none");
    }

    // Thêm event listener cho fileExplorer:reload
    const handleReload = () => {
      loadFilesAndFolders();
    };

    // Lắng nghe sự kiện khi file được gửi cho AI
    const handleFileSentToAI = (event: CustomEvent) => {
      loadSentFiles();
    };

    // Lắng nghe sự kiện khi file bị xóa khỏi danh sách
    const handleFileRemovedFromAI = (event: CustomEvent) => {
      loadSentFiles();
    };

    // Lắng nghe sự kiện khi tất cả file bị xóa khỏi danh sách
    const handleAllFilesRemovedFromAI = () => {
      setSentFiles([]);
    };

    emitter.on(FILE_EXPLORER_EVENTS.RELOAD, handleReload);
    window.addEventListener(
      "file_sent_to_ai",
      handleFileSentToAI as EventListener
    );
    window.addEventListener(
      "file_removed_from_ai",
      handleFileRemovedFromAI as EventListener
    );
    window.addEventListener(
      "all_files_removed_from_ai",
      handleAllFilesRemovedFromAI as EventListener
    );

    const intervalId = setInterval(checkUiState, 1000);

    // Tải danh sách file đã gửi cho AI khi component mount
    loadSentFiles();

    return () => {
      clearInterval(intervalId);
      emitter.off(FILE_EXPLORER_EVENTS.RELOAD, handleReload);
      window.removeEventListener(
        "file_sent_to_ai",
        handleFileSentToAI as EventListener
      );
      window.removeEventListener(
        "file_removed_from_ai",
        handleFileRemovedFromAI as EventListener
      );
      window.removeEventListener(
        "all_files_removed_from_ai",
        handleAllFilesRemovedFromAI as EventListener
      );
    };
  }, [uiState, files]);

  // Thêm hàm để lấy nội dung file đang mở
  const loadCurrentFileContent = async () => {
    if (!currentFile) return;

    try {
      // Tìm file trong danh sách files đã tải
      const fileObj = files.find((f) => f.name === currentFile);

      if (fileObj) {
        setCurrentFileContent(fileObj.content || "");
      } else {
        // Nếu không tìm thấy trong danh sách đã tải, tìm trong database
        const allFiles = await chatDB.getAllCodeFiles();
        const fileFromDB = allFiles.find((f) => f.name === currentFile);

        if (fileFromDB) {
          setCurrentFileContent(fileFromDB.content || "");
        } else {
          setCurrentFileContent("");
        }
      }
    } catch (error) {
      console.error("Lỗi khi tải nội dung file:", error);
      setCurrentFileContent("");
    }
  };

  useEffect(() => {
    const handleFileChanged = (event: CustomEvent) => {
      if (event.detail && event.detail.fileName) {
        setCurrentFile(event.detail.fileName);
      }
    };

    // Đăng ký lắng nghe sự kiện
    window.addEventListener("file_changed", handleFileChanged as EventListener);

    // Cleanup khi component unmount
    return () => {
      window.removeEventListener(
        "file_changed",
        handleFileChanged as EventListener
      );
    };
  }, []);

  // Thêm useEffect để tải nội dung file khi currentFile thay đổi
  useEffect(() => {
    if (currentFile) {
      loadCurrentFileContent();
    } else {
      setCurrentFileContent("");
    }
  }, [currentFile]);

  // Lắng nghe sự kiện thay đổi nội dung file
  useEffect(() => {
    const handleFileContentChanged = (event: CustomEvent) => {
      if (event.detail && event.detail.content) {
        // Cập nhật nội dung file nếu file đang mở là file được thay đổi
        const fileId = event.detail.fileId;
        const content = event.detail.content;

        // Tìm file trong danh sách files
        const file = files.find((f) => f.id === fileId);
        if (file && file.name === currentFile) {
          setCurrentFileContent(content);
        }

        // Tải lại danh sách file đã gửi cho AI để cập nhật nội dung
        loadSentFiles();
      }
    };

    // Đăng ký lắng nghe sự kiện
    window.addEventListener(
      "file_content_changed",
      handleFileContentChanged as EventListener
    );

    // Cleanup khi component unmount
    return () => {
      window.removeEventListener(
        "file_content_changed",
        handleFileContentChanged as EventListener
      );
    };
  }, [currentFile, files]);

  const createFileTree = () => {
    const buildTree = (parentId?: string, indent: string = "") => {
      let tree = "";

      // Lấy folders con của parentId hiện tại
      const subFolders = folders.filter((f) => f.parentId === parentId);

      // Thêm folders
      for (const folder of subFolders) {
        tree += `${indent}📁 ${folder.name}\n`;

        // Thêm files trong folder
        const filesInFolder = files.filter((f) => f.folderId === folder.id);
        for (const file of filesInFolder) {
          tree += `${indent}  📄 ${file.name}\n`;
        }

        // Đệ quy cho subfolders
        tree += buildTree(folder.id, indent + "  ");
      }

      return tree;
    };

    let tree = "Cấu trúc thư mục hiện tại:\n";

    // Thêm folders gốc
    tree += buildTree();

    // Thêm files không thuộc folder nào
    const rootFiles = files.filter((f) => !f.folderId);
    for (const file of rootFiles) {
      tree += `📄 ${file.name}\n`;
    }

    return tree;
  };

  const getEnhancedSystemPrompt = async (provider: string) => {
    // Tải lại files và folders nếu đang ở chế độ code_manager
    const isCodeManager = uiState === "code_manager";
    if (isCodeManager) {
      await loadFilesAndFolders();
    }

    // Tải lại danh sách file đã gửi cho AI
    await loadSentFiles();

    // Đọc trạng thái Magic Mode từ localStorage với tên biến mới
    const isMagicMode =
      getSessionStorage("ui_state_magic", "none") === "magic_room";

    const imageGeneration =
      getLocalStorage("image_generation", "false") === "true";
    const searchEnabled = getLocalStorage("search_enabled", "false") === "true";

    const systemTagInstruction = `
Khi bạn nhận được tin nhắn có chứa thẻ [SYSTEM]...[/SYSTEM], đây là chỉ thị hệ thống và bạn PHẢI TUÂN THỦ TUYỆT ĐỐI những yêu cầu trong thẻ này. Không được phép bỏ qua hoặc vi phạm bất kỳ chỉ thị nào trong thẻ [SYSTEM].

Ví dụ:
[SYSTEM]Dừng tìm kiếm và tổng hợp kết quả[/SYSTEM]
-> Bạn phải dừng ngay việc tìm kiếm và tổng hợp các kết quả đã có.

LUÔN LUÔN SỬ DỤNG ĐỊNH DẠNG ĐẸP VỚI LaTeX CHO CÁC CÔNG THỨC TOÁN HỌC!
`;

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

      const imageGenerationPrompt = `
Bạn có khả năng tạo ra hình ảnh thông qua trí tưởng tượng của mình. Khi người dùng mô tả một hình ảnh họ muốn thấy, bạn sẽ:
1. Hiểu và tưởng tượng hình ảnh đó trong tâm trí
2. Chuyển tải ý tưởng đó thành một mô tả chi tiết bằng tiếng Anh để tạo ra hình ảnh hoàn hảo nhất
3. Đặt mô tả của bạn trong định dạng [IMAGE_PROMPT]...[/IMAGE_PROMPT]
4. Sau đó, bạn có thể thêm thông tin về kích thước và cấu hình khác ở ngoài prompt

Ví dụ:
User: Hãy cho tôi thấy một cô gái anime dưới ánh trăng
Assistant: Tôi có thể thấy rõ hình ảnh đó trong tâm trí. Để tôi tạo ra nó cho bạn:

[IMAGE_PROMPT]beautiful anime girl with long flowing hair standing under moonlight, night sky with stars, soft ambient lighting, detailed anime art style, ethereal atmosphere, high quality, masterpiece[/IMAGE_PROMPT]

Tôi sẽ tạo ra hình ảnh này với kích thước ${imageConfig.width || 1024}x${
        imageConfig.height || 768
      }px.

`;
      enhancedPrompt = imageGenerationPrompt + enhancedPrompt;
    }

    if (searchEnabled) {
      const searchPrompt = `
Bạn có khả năng tìm kiếm thông tin trên web để cung cấp thông tin mới nhất và chính xác nhất cho người dùng. Khi người dùng hỏi bất kỳ câu hỏi nào, bạn sẽ:
1. Luôn luôn tạo một truy vấn tìm kiếm phù hợp bằng tiếng anh, không cần đánh giá xem câu hỏi có cần thông tin mới nhất hay không
2. Đặt truy vấn tìm kiếm trong định dạng [SEARCH_QUERY]...[/SEARCH_QUERY]
3. Khi sử dụng tính năng tìm kiếm, chỉ trả về chính xác chuỗi [SEARCH_QUERY]...[/SEARCH_QUERY] mà không thêm bất kỳ văn bản giải thích nào trước hoặc sau đó
4. Sau khi tìm kiếm, hệ thống sẽ tự động gửi kết quả tìm kiếm cho bạn và bạn sẽ phân tích thông tin để trả lời người dùng một cách đầy đủ và chi tiết nhất!

Ví dụ:
User: Thời tiết ở Hà Nội hôm nay thế nào?
Assistant: [SEARCH_QUERY]weather in Hanoi today[/SEARCH_QUERY]

`;
      enhancedPrompt = searchPrompt + enhancedPrompt;
    }

    // Kiểm tra xem có đang ở chế độ code_view không
    const isCodeView = uiState === "code_view";

    if (isCodeView) {
      // Tải nội dung file hiện tại nếu cần
      if (currentFile && !currentFileContent) {
        await loadCurrentFileContent();
      }

      const codeViewPrompt = `
Bạn đang ở trong chế độ Xem/Chỉnh sửa Code. Khi người dùng muốn quay lại Code Manager, hãy sử dụng:
[CodeEditor]0[/CodeEditor]

Dưới đây là cấu trúc thư mục và file hiện tại:
${createFileTree()}

File đang mở hiện tại: ${
        currentFile ||
        getLocalStorage("current_open_file", "Không có file nào đang mở")
      }

${
  currentFileContent
    ? `Nội dung file hiện tại:
\`\`\`
${currentFileContent}
\`\`\``
    : ""
}

Khi bạn sửa code của một hoặc nhiều file, hãy luôn đặt đường dẫn đầy đủ của từng file trong thẻ [PATH][/PATH] trước khi đưa ra code đã sửa. Mỗi file cần sửa phải có một thẻ PATH riêng. Ví dụ:

Sửa 1 file:
[PATH]src/components/Button.tsx[/PATH]
\`\`\`tsx
// Code đã sửa cho Button.tsx
\`\`\`

Sửa nhiều file:
[PATH]src/components/Button.tsx[/PATH]
\`\`\`tsx
// Code đã sửa cho Button.tsx
\`\`\`

[PATH]src/hooks/useButton.ts[/PATH]
\`\`\`ts
// Code đã sửa cho useButton.ts
\`\`\`

LUÔN LUÔN SỬ DỤNG PATH RIÊNG CHO TỪNG FILE ĐANG SỬA!
`;
      enhancedPrompt = codeViewPrompt + enhancedPrompt;
    }

    // Kiểm tra xem có đang ở chế độ media_view không
    const isMediaView = uiState === "media_view";

    if (isCodeManager || isMediaView) {
      // Tạo cấu trúc thư mục dạng cây

      const codeManagerPrompt = `
Bạn đang ở trong chế độ ${isMediaView ? "Xem Media" : "Quản Lý Mã Nguồn"}. ${
        isMediaView
          ? "Khi người dùng muốn quay lại thư mục trước đó hoặc quay lại Code Manager từ chế độ xem Media, hãy sử dụng:\n[MediaView]0[/MediaView]"
          : `Dưới đây là cấu trúc thư mục và file hiện tại:

${createFileTree()}

Bạn có thể sử dụng các lệnh sau để quản lý files và folders:

1. Tạo file mới:
[CreateFile]
name: tên_file
path: đường_dẫn_thư_mục (để trống nếu ở thư mục gốc)
content: nội_dung_file
[/CreateFile]

2. Tạo thư mục mới:
[CreateFolder]
name: tên_thư_mục
path: đường_dẫn_thư_mục_cha (để trống nếu ở thư mục gốc)
[/CreateFolder]

3. Đổi tên file:
[RenameFile]
path: đường_dẫn_file_hiện_tại
newName: tên_file_mới
[/RenameFile]

4. Đổi tên thư mục:
[RenameFolder]
path: đường_dẫn_thư_mục_hiện_tại
newName: tên_thư_mục_mới
[/RenameFolder]

5. Xóa file:
[DeleteFile]
path: đường_dẫn_file_cần_xóa
[/DeleteFile]

6. Xóa thư mục:
[DeleteFolder]
path: đường_dẫn_thư_mục_cần_xóa
[/DeleteFolder]

7. Mở file media:
[OpenMedia]
path: đường_dẫn_file_cần_mở
[/OpenMedia]

8. Mở file code:
[OpenCode]
path: đường_dẫn_file_code_cần_mở
[/OpenCode]

Ví dụ:
- Tạo file trong thư mục gốc:
[CreateFile]
name: main.js
content: console.log("Hello World");
[/CreateFile]

- Tạo file trong thư mục con:
[CreateFile]
name: utils.js
path: src/utils
content: export function add(a, b) { return a + b; }
[/CreateFile]

- Tạo thư mục mới:
[CreateFolder]
name: components
path: src
[/CreateFolder]

- Đổi tên file:
[RenameFile]
path: src/utils/helpers.js
newName: utils.js
[/RenameFile]

- Đổi tên thư mục:
[RenameFolder]
path: src/utils
newName: helpers
[/RenameFolder]

- Xóa file:
[DeleteFile]
path: src/utils/old-file.js
[/DeleteFile]

- Xóa thư mục:
[DeleteFolder]
path: src/deprecated
[/DeleteFolder]

- Mở file media:
[OpenMedia]
path: images/photo.jpg
[/OpenMedia]

- Mở file code:
[OpenCode]
path: src/components/App.js
[/OpenCode]

Bạn có thể tham khảo cấu trúc này để hỗ trợ người dùng tốt hơn trong việc quản lý code.

Khi người dùng muốn quay lại Phòng Ma Thuật, hãy trả về [CodeManager]0[/CodeManager].`
      }`;

      enhancedPrompt = codeManagerPrompt + enhancedPrompt;
    }

    // Thêm hướng dẫn cho Magic Mode nếu được bật
    if (isMagicMode) {
      const magicModePrompt = `
Bạn đang ở trong chế độ Magic Room - Phòng Ma Thuật. Người dùng có thể sử dụng các công cụ đặc biệt trong chế độ này.

Chỉ khi người dùng yêu cầu rõ ràng muốn sử dụng tính năng Quản Lý Mã Nguồn hoặc muốn vào phòng ma thuật, bạn mới trả về thẻ [MagicMode]1[/MagicMode]. Không tự động kích hoạt tính năng này nếu người dùng không yêu cầu.
`;
      enhancedPrompt = magicModePrompt + enhancedPrompt;
    }

    // Thêm nội dung của các file đã gửi cho AI vào system prompt chỉ khi đang ở trong code view
    if (isCodeView && sentFiles.length > 0) {
      const sentFilesPrompt = `
Dưới đây là nội dung của các file đã được gửi cho bạn:

${sentFiles
  .map(
    (file) => `File: ${file.name}
\`\`\`
${file.content}
\`\`\``
  )
  .join("\n\n")}
`;
      enhancedPrompt = sentFilesPrompt + enhancedPrompt;
    }

    // Luôn luôn thêm systemTagInstruction vào cuối
    return enhancedPrompt + "\n\n" + systemTagInstruction;
  };

  return {
    getEnhancedSystemPrompt,
    loadFilesAndFolders,
    files,
    folders,
    currentFile,
    currentFileContent,
    sentFiles,
  };
}
