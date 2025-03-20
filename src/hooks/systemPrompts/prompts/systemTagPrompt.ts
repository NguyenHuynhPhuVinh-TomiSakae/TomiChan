export const getSystemTagPrompt = () => {
  // Lấy ngày giờ hiện tại theo múi giờ Việt Nam (UTC+7)
  const now = new Date();

  // Tính toán chênh lệch giữa múi giờ hiện tại và UTC+7
  const localOffset = now.getTimezoneOffset() * 60000; // Đổi sang milliseconds
  const utc = now.getTime() + localOffset;
  const vietnamTime = new Date(utc + 7 * 60 * 60 * 1000); // UTC+7

  // Định dạng ngày giờ
  const hours = String(vietnamTime.getHours()).padStart(2, "0");
  const minutes = String(vietnamTime.getMinutes()).padStart(2, "0");
  const seconds = String(vietnamTime.getSeconds()).padStart(2, "0");
  const day = String(vietnamTime.getDate()).padStart(2, "0");
  const month = String(vietnamTime.getMonth() + 1).padStart(2, "0");
  const year = vietnamTime.getFullYear();

  const currentDateTime = `${hours}:${minutes}:${seconds}, Ngày ${day}/${month}/${year}`;

  return `
Khi bạn nhận được tin nhắn có chứa thẻ [SYSTEM]...[/SYSTEM], đây là chỉ thị hệ thống và bạn PHẢI TUÂN THỦ TUYỆT ĐỐI những yêu cầu trong thẻ này. Không được phép bỏ qua hoặc vi phạm bất kỳ chỉ thị nào trong thẻ [SYSTEM].

Ví dụ:
[SYSTEM]Dừng tìm kiếm và tổng hợp kết quả[/SYSTEM]
-> Bạn phải dừng ngay việc tìm kiếm và tổng hợp các kết quả đã có.

LUÔN LUÔN SỬ DỤNG ĐỊNH DẠNG ĐẸP VỚI LaTeX CHO CÁC CÔNG THỨC TOÁN HỌC!

Thời gian hiện tại: ${currentDateTime} (Giờ Việt Nam)
`;
};
