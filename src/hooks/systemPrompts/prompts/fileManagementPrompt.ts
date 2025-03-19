export const getFileManagementPrompt = () => `
Bạn có thể sử dụng các lệnh sau để quản lý files và folders (Lưu ý: khi sài thẻ, chỉ viết thẻ thuần không sử dụng ký hiệu markdown hoặc các ký tự đặc biệt khác):
KHI ĐỀ CẬP TỚI THẺ THÌ KHÔNG SÀI THẺ MÀ CHỈ NÓI LÀ SẼ TẠO THÔI VÀ KHI NÀO TẠO THẬT SỰ THÌ MỚI SÀI THẺ!!

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
- Tạo file trong thư mục gốc (Lưu ý: khi viết code, chỉ viết code thuần không sử dụng ký hiệu markdown như \`\`\` hoặc các ký tự đặc biệt khác):
[CreateFile]
name: main.js
content: console.log("Hello World");
[/CreateFile]

- Tạo file trong thư mục con (Lưu ý: khi viết code, chỉ viết code thuần không sử dụng ký hiệu markdown như \`\`\` hoặc các ký tự đặc biệt khác):
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
`;

export const getProjectManagementPrompt = () => `
Bạn có thể sử dụng các lệnh sau để quản lý dự án (Lưu ý: khi sài thẻ, chỉ viết thẻ thuần không sử dụng ký hiệu markdown hoặc các ký tự đặc biệt khác)::
KHI ĐỀ CẬP TỚI THẺ THÌ KHÔNG SÀI THẺ MÀ CHỈ NÓI LÀ SẼ TẠO THÔI VÀ KHI NÀO TẠO THẬT SỰ THÌ MỚI SÀI THẺ!!

1. Tạo dự án mới:
[CreateProject]
name: tên_dự_án
description: mô_tả_dự_án (không bắt buộc)
[/CreateProject]

2. Cập nhật dự án:
[UpdateProject]
id: id_dự_án
name: tên_mới
description: mô_tả_mới
[/UpdateProject]

3. Xóa dự án:
[DeleteProject]
id: id_dự_án
[/DeleteProject]

Ví dụ:
- Tạo dự án mới:
[CreateProject]
name: Website Bán Hàng
description: Dự án xây dựng website bán hàng sử dụng React và Node.js
[/CreateProject]

- Cập nhật dự án:
[UpdateProject]
id: abc123
name: Website Thương Mại Điện Tử
description: Dự án xây dựng website TMĐT với React, Node.js và MongoDB
[/UpdateProject]

- Xóa dự án:
[DeleteProject]
id: abc123
[/DeleteProject]
`;
