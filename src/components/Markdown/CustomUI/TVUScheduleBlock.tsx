/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { IconCalendar, IconLoader2 } from "@tabler/icons-react";

interface TVUScheduleBlockProps {
  children: React.ReactNode;
}

export const TVUScheduleBlock: React.FC<TVUScheduleBlockProps> = ({
  children,
}) => {
  // Chuyển đổi children thành string một cách an toàn
  const rawContent = React.Children.toArray(children)
    .map((child) => {
      if (typeof child === "string") return child;
      if (child && typeof child === "object" && "props" in child) {
        return (child as any).props.children;
      }
      return "";
    })
    .join("");

  // Tách thông tin từ nội dung
  const action = rawContent.match(/ACTION:\s*(.*?)(?=\n|$)/)?.[1]?.trim();
  const date = rawContent.match(/DATE:\s*(.*?)(?=\n|$)/)?.[1]?.trim();

  // Xác định tiêu đề dựa trên action
  let title = "";
  let subtitle = "";
  switch (action) {
    case "xem_hom_nay":
      title = "Thời Khóa Biểu Hôm Nay";
      subtitle = new Date().toLocaleDateString("vi-VN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      break;
    case "xem_ngay_mai":
      title = "Thời Khóa Biểu Ngày Mai";
      subtitle = new Date(Date.now() + 86400000).toLocaleDateString("vi-VN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      break;
    case "xem_theo_ngay":
      title = "Thời Khóa Biểu Theo Ngày";
      subtitle = new Date(date || "").toLocaleDateString("vi-VN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      break;
    case "xem_lich_thi":
      title = "Lịch Thi";
      subtitle = "Danh sách các môn thi";
      break;
  }

  // Kiểm tra xem có kết quả hay chưa bằng cách tìm thẻ TVU_SCHEDULE_RESULT trong nội dung gốc
  const hasResult = rawContent.includes("[TVU_SCHEDULE_RESULT]");

  return (
    <div className="my-4 p-4 rounded-lg border-2 border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
          <IconCalendar
            className="text-blue-500 dark:text-blue-400"
            size={24}
          />
        </div>
        <div>
          <h3 className="font-semibold text-lg bg-gradient-to-r from-blue-400 via-cyan-500 to-blue-500 text-transparent bg-clip-text">
            {title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
        </div>
      </div>

      {/* Loading indicator - chỉ hiển thị khi chưa có kết quả */}
      {!hasResult && (
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <IconLoader2 className="animate-spin" size={16} />
          <span>Đang tải thời khóa biểu...</span>
        </div>
      )}
    </div>
  );
};
