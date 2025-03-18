import { getFileManagementPrompt } from "./fileManagementPrompt";

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

${getFileManagementPrompt()}

Bạn có thể tham khảo cấu trúc này để hỗ trợ người dùng tốt hơn trong việc quản lý code.

Khi người dùng muốn quay lại Phòng Ma Thuật, hãy trả về [CodeManager]0[/CodeManager].`
  }`;
};
