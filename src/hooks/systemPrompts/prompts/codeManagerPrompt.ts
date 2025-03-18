export const getCodeManagerPrompt = (
  createFileTree: () => string,
  isMediaView: boolean
) => {
  return `Bạn đang ở trong chế độ ${
    isMediaView ? "Xem Media" : "Quản Lý Mã Nguồn"
  }. ${
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
};
