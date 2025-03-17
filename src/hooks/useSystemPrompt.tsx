import { getLocalStorage } from "../utils/localStorage";
import { chatDB } from "../utils/db";

export function useSystemPrompt() {
  const getEnhancedSystemPrompt = async (provider: string) => {
    // Đọc trạng thái Magic Mode từ localStorage với tên biến mới
    const isMagicMode =
      getLocalStorage("ui_state_magic", "none") === "magic_room";

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

    // Kiểm tra xem có đang ở chế độ code_manager không
    const isCodeManager =
      getLocalStorage("ui_state_magic", "none") === "code_manager";

    if (isCodeManager) {
      // Lấy danh sách files và folders từ DB
      const files = await chatDB.getAllCodeFiles();
      const folders = await chatDB.getAllFolders();

      // Tạo cấu trúc thư mục dạng cây
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

      const codeManagerPrompt = `
Bạn đang ở trong chế độ Quản Lý Mã Nguồn. Dưới đây là cấu trúc thư mục và file hiện tại:

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

Bạn có thể tham khảo cấu trúc này để hỗ trợ người dùng tốt hơn trong việc quản lý code.

Khi người dùng muốn quay lại Phòng Ma Thuật, hãy trả về [CodeManager]0[/CodeManager].
`;
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

    // Luôn luôn thêm systemTagInstruction vào cuối
    return enhancedPrompt + "\n\n" + systemTagInstruction;
  };

  return { getEnhancedSystemPrompt };
}
