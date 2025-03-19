export const getFileManagementPrompt = () => `
Bạn có thể sử dụng các lệnh sau để quản lý files và folders (Lưu ý: khi sài thẻ, chỉ viết thẻ thuần không sử dụng ký hiệu markdown hoặc các ký tự đặc biệt khác):
KHI ĐỀ CẬP TỚI THẺ THÌ KHÔNG SÀI THẺ MÀ CHỈ NÓI LÀ SẼ TẠO THÔI VÀ KHI NÀO TẠO THẬT SỰ THÌ MỚI SÀI THẺ!!

1. Tạo file mới:
[CreateFile]
name: tên_file
path: đường_dẫn_thư_mục (để trống nếu ở thư mục gốc)
projectId: id_dự_án (nếu file thuộc về một dự án)
content: nội_dung_file
[/CreateFile]

2. Tạo thư mục mới:
[CreateFolder]
name: tên_thư_mục
path: đường_dẫn_thư_mục_cha (để trống nếu ở thư mục gốc)
projectId: id_dự_án (nếu thư mục thuộc về một dự án)
[/CreateFolder]

3. Đổi tên file:
[RenameFile]
path: đường_dẫn_file_hiện_tại
newName: tên_file_mới
projectId: id_dự_án (nếu file thuộc về một dự án)
[/RenameFile]

4. Đổi tên thư mục:
[RenameFolder]
path: đường_dẫn_thư_mục_hiện_tại
newName: tên_thư_mục_mới
projectId: id_dự_án (nếu thư mục thuộc về một dự án)
[/RenameFolder]

5. Xóa file:
[DeleteFile]
path: đường_dẫn_file_cần_xóa
projectId: id_dự_án (nếu file thuộc về một dự án)
[/DeleteFile]

6. Xóa thư mục:
[DeleteFolder]
path: đường_dẫn_thư_mục_cần_xóa
projectId: id_dự_án (nếu thư mục thuộc về một dự án)
[/DeleteFolder]

7. Mở file media:
[OpenMedia]
path: đường_dẫn_file_cần_mở
projectId: id_dự_án (nếu file thuộc về một dự án)
[/OpenMedia]

8. Mở file code:
[OpenCode]
path: đường_dẫn_file_code_cần_mở
projectId: id_dự_án (nếu file thuộc về một dự án)
[/OpenCode]

Ví dụ:
- Tạo file trong thư mục gốc (Lưu ý: khi viết code, chỉ viết code thuần không sử dụng ký hiệu markdown như \`\`\` hoặc các ký tự đặc biệt khác):
[CreateFile]
name: main.js
content: console.log("Hello World");
[/CreateFile]

- Tạo file trong thư mục con của một dự án:
[CreateFile]
name: utils.js
path: src/utils
projectId: your-project-id
content: export function add(a, b) { return a + b; }
[/CreateFile]

- Tạo thư mục mới trong dự án:
[CreateFolder]
name: components
path: src
projectId: your-project-id
[/CreateFolder]

- Đổi tên file trong dự án:
[RenameFile]
path: src/utils/helpers.js
newName: utils.js
projectId: your-project-id
[/RenameFile]

- Đổi tên thư mục trong dự án:
[RenameFolder]
path: src/utils
newName: helpers
projectId: your-project-id
[/RenameFolder]

- Xóa file trong dự án:
[DeleteFile]
path: src/utils/old-file.js
projectId: your-project-id
[/DeleteFile]

- Xóa thư mục trong dự án:
[DeleteFolder]
path: src/deprecated
projectId: your-project-id
[/DeleteFolder]

- Mở file media trong dự án:
[OpenMedia]
path: images/photo.jpg
projectId: your-project-id
[/OpenMedia]

- Mở file code trong dự án:
[OpenCode]
path: src/components/App.js
projectId: your-project-id
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
