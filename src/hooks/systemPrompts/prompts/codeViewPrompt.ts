import { getFileManagementPrompt } from "./fileManagementPrompt";

export const getCodeViewPrompt = (
  currentFile: string,
  currentFileContent: string,
  fileTree: string
) => `
Bạn đang ở trong chế độ Xem/Chỉnh sửa Code. Khi người dùng muốn quay lại Code Manager, hãy sử dụng:
[CodeEditor]0[/CodeEditor]

Dưới đây là cấu trúc thư mục và file hiện tại:
${fileTree}

File đang mở hiện tại: ${currentFile || "Không có file nào đang mở"}

${
  currentFileContent
    ? `Nội dung file hiện tại:
\`\`\`
${currentFileContent}
\`\`\``
    : ""
}

${getFileManagementPrompt()}

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
