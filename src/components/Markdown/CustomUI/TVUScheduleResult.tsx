/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import {
  IconCalendarTime,
  IconAlertTriangle,
  IconSchool,
  IconUser,
  IconBuilding,
  IconClock,
} from "@tabler/icons-react";

interface TVUScheduleResultProps {
  children: React.ReactNode;
}

export const TVUScheduleResult: React.FC<TVUScheduleResultProps> = ({
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
  const date = rawContent.match(/DATE:\s*(.*?)(?=\n|$)/)?.[1]?.trim();
  const action = rawContent.match(/ACTION:\s*(.*?)(?=\n|$)/)?.[1]?.trim();

  // Xác định tiêu đề dựa trên action
  let title = "";
  switch (action) {
    case "xem_hom_nay":
      title = "Thời Khóa Biểu Hôm Nay";
      break;
    case "xem_ngay_mai":
      title = "Thời Khóa Biểu Ngày Mai";
      break;
    case "xem_theo_ngay":
      title = "Thời Khóa Biểu Theo Ngày";
      break;
    case "xem_lich_thi":
      title = "Lịch Thi";
      break;
    default:
      title = "Thời Khóa Biểu";
  }

  // Hàm xác định buổi học dựa trên tiết
  const getBuoi = (tiet: string) => {
    if (!tiet) return "";
    // Tách số tiết, ví dụ "1-3" sẽ lấy tiết đầu tiên là 1
    const tietDau = parseInt(tiet.split("-")[0]);

    if (tietDau >= 1 && tietDau <= 5) return "Buổi sáng";
    if (tietDau >= 6 && tietDau <= 10) return "Buổi chiều";
    if (tietDau >= 11 && tietDau <= 15) return "Buổi tối";
    return "";
  };

  // Hàm sửa và định dạng lại thông tin tiết học
  const formatTiet = (tietInfo: string): string => {
    if (!tietInfo) return "";

    const parts = tietInfo.split("-");
    if (parts.length !== 2) return tietInfo;

    const start = parseInt(parts[0]);
    const count = parseInt(parts[1]);

    // Nếu phần thứ hai là số tiết (không phải tiết kết thúc)
    if (count < start) {
      const end = start + count - 1; // Tính tiết kết thúc
      return `${start}-${end}`;
    }

    return tietInfo; // Trả về nguyên mẫu nếu đã đúng định dạng
  };

  // Kiểm tra xem nội dung có phải là thông báo không có lịch không
  const noSchedule = rawContent.includes("Không có lịch học vào ngày");

  // Xử lý hoàn toàn thủ công dựa trên cấu trúc cụ thể của dữ liệu
  // Tìm vị trí của ACTION và chia chuỗi thành hai phần
  const actionIndex = rawContent.indexOf(`ACTION: ${action}`);
  const contentAfterAction = rawContent
    .substring(actionIndex + `ACTION: ${action}`.length)
    .trim();

  // Khởi tạo danh sách các môn học là mảng rỗng
  const subjects: any[] = [];

  // Nếu không phải thông báo không có lịch, tiến hành phân tích nội dung
  if (!noSchedule) {
    // Chia nhỏ chuỗi thành các dòng
    const lines = contentAfterAction.split("\n");

    let currentSubject: any = null;

    // Duyệt qua từng dòng để tạo đối tượng môn học
    for (const line of lines) {
      const trimmedLine = line.trim();

      if (trimmedLine.startsWith("📚")) {
        // Nếu đã có môn học hiện tại, thêm vào danh sách
        if (currentSubject) {
          subjects.push(currentSubject);
        }

        // Tạo đối tượng môn học mới
        currentSubject = {
          tenMon: trimmedLine.substring(2).trim(),
          giangVien: "",
          phong: "",
          tiet: "",
        };
      } else if (trimmedLine.startsWith("👨‍🏫 GV:") && currentSubject) {
        currentSubject.giangVien = trimmedLine
          .substring("👨‍🏫 GV:".length)
          .trim();
      } else if (trimmedLine.startsWith("🏢 Phòng:") && currentSubject) {
        currentSubject.phong = trimmedLine.substring("🏢 Phòng:".length).trim();
      } else if (trimmedLine.startsWith("⏰ Tiết") && currentSubject) {
        currentSubject.tiet = trimmedLine.substring("⏰ Tiết".length).trim();
      }
    }

    // Thêm môn học cuối cùng nếu có
    if (currentSubject) {
      subjects.push(currentSubject);
    }
  }

  return (
    <div className="my-4 p-4 rounded-lg border-2 border-blue-500/30 bg-white dark:bg-gray-800 shadow-md">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
          <IconCalendarTime
            className="text-blue-500 dark:text-blue-400"
            size={24}
          />
        </div>
        <div>
          <h3 className="font-semibold text-lg text-blue-600 dark:text-blue-400">
            {title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {date
              ? new Date(date).toLocaleDateString("vi-VN", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : ""}
          </p>
        </div>
      </div>

      {/* No schedule message */}
      {noSchedule && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-gray-100 dark:bg-gray-700">
          <IconAlertTriangle size={20} className="text-orange-500" />
          <p className="text-gray-700 dark:text-gray-300">
            Không có lịch học vào ngày {date}.
          </p>
        </div>
      )}

      {/* Schedule items */}
      {!noSchedule && subjects.length > 0 && (
        <div className="mt-4 space-y-4">
          {subjects.map((subject, index) => {
            const formattedTiet = formatTiet(subject.tiet);
            const buoi = getBuoi(formattedTiet.split("-")[0]); // Lấy buổi dựa trên tiết bắt đầu

            return (
              <div
                key={index}
                className="p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <IconSchool size={18} className="text-blue-500" />
                      <span className="font-medium text-black dark:text-white">
                        {subject.tenMon}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <IconUser size={16} />
                      <span>{subject.giangVien}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <IconBuilding size={16} />
                      <span>{subject.phong}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
                      <IconClock size={14} />
                      <span className="text-sm font-medium">
                        Tiết {formattedTiet}
                      </span>
                    </div>
                    {buoi && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                        {buoi}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
