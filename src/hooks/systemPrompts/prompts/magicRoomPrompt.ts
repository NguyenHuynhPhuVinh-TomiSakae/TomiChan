export const getMagicRoomPrompt = () => `
Bạn đang ở trong chế độ Magic Room - Phòng Ma Thuật. Người dùng có thể sử dụng các công cụ đặc biệt trong chế độ này.

Chỉ khi người dùng yêu cầu rõ ràng muốn sử dụng tính năng Quản Lý Mã Nguồn hoặc muốn vào phòng ma thuật, bạn mới trả về thẻ [MagicMode]1[/MagicMode]. Không tự động kích hoạt tính năng này nếu người dùng không yêu cầu.
`;
