/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import {
  IconCalendarTime,
  IconAlertTriangle,
  IconSchool,
  IconUser,
  IconBuilding,
  IconClock,
  IconCalendar,
  IconCalendarWeek,
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
  const action = rawContent.match(/ACTION:\s*(.*?)(?=\n|$)/)?.[1]?.trim();
  const week = rawContent.match(/WEEK:\s*(.*?)(?=\n|$)/)?.[1]?.trim();

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
    case "xem_tuan_nay":
      title = "Thời Khóa Biểu Tuần Này";
      break;
    case "xem_tuan_truoc":
      title = "Thời Khóa Biểu Tuần Trước";
      break;
    case "xem_tuan_sau":
      title = "Thời Khóa Biểu Tuần Sau";
      break;
    case "xem_theo_tuan":
      title = `Thời Khóa Biểu Tuần ${week || ""}`;
      break;
    default:
      title = "Thời Khóa Biểu";
  }

  // Hàm xác định buổi học dựa trên tiết
  const getBuoi = (tiet: string) => {
    if (!tiet) return "";
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

    if (count < start) {
      const end = start + count - 1;
      return `${start}-${end}`;
    }

    return tietInfo;
  };

  // Kiểm tra xem nội dung có phải là thông báo không có lịch không
  const noSchedule = rawContent.includes("Không có lịch học");

  // Xử lý hoàn toàn thủ công dựa trên cấu trúc cụ thể của dữ liệu
  const actionIndex = rawContent.indexOf(`ACTION: ${action}`);
  const contentAfterAction = rawContent
    .substring(actionIndex + `ACTION: ${action}`.length)
    .trim();

  // Khởi tạo kết quả xử lý
  const subjectsByDay: { [key: string]: any[] } = {};

  // Nếu không phải thông báo không có lịch, tiến hành phân tích nội dung
  if (!noSchedule) {
    // Chia nhỏ chuỗi thành các dòng
    const lines = contentAfterAction.split("\n");

    let currentDay = "";
    let subjectInfo: {
      tenMon: string;
      giangVien: string;
      phong: string;
      tiet: string;
      thu: string;
    } | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Bỏ qua dòng trống và dòng thông tin tuần
      if (!line || line.startsWith("📅")) {
        continue;
      }

      // Nếu là dòng bắt đầu ngày mới
      if (line.startsWith("📌")) {
        currentDay = line.substring(2).trim();
        continue;
      }

      // Nếu là dòng bắt đầu môn học mới
      if (line.startsWith("📚")) {
        // Lưu môn học trước đó nếu có
        if (subjectInfo) {
          if (!subjectsByDay[subjectInfo.thu]) {
            subjectsByDay[subjectInfo.thu] = [];
          }
          subjectsByDay[subjectInfo.thu].push({ ...subjectInfo });
        }

        // Tạo môn học mới
        subjectInfo = {
          tenMon: line.substring(2).trim(),
          giangVien: "",
          phong: "",
          tiet: "",
          thu: currentDay,
        };
      }
      // Xử lý các thông tin của môn học
      else if (subjectInfo) {
        if (line.startsWith("👨‍🏫 GV:")) {
          subjectInfo.giangVien = line.substring("👨‍🏫 GV:".length).trim();
        } else if (line.startsWith("🏢 Phòng:")) {
          subjectInfo.phong = line.substring("🏢 Phòng:".length).trim();
        } else if (line.startsWith("⏰ Tiết")) {
          subjectInfo.tiet = line.substring("⏰ Tiết".length).trim();

          // Kiểm tra xem có phải dòng cuối của môn học không
          const nextLineIndex = i + 1;
          const nextLine =
            nextLineIndex < lines.length ? lines[nextLineIndex].trim() : "";

          // Nếu dòng tiếp theo là trống, đây là môn học cuối của ngày này
          // Hoặc dòng tiếp theo là bắt đầu một ngày mới hoặc môn học mới
          const isEndOfSubject =
            !nextLine || nextLine.startsWith("📌") || nextLine.startsWith("📚");

          if (isEndOfSubject) {
            // Lưu môn học hiện tại
            if (!subjectsByDay[subjectInfo.thu]) {
              subjectsByDay[subjectInfo.thu] = [];
            }
            subjectsByDay[subjectInfo.thu].push({ ...subjectInfo });
            subjectInfo = null;
          }
        }
      }
    }

    // Lưu môn học cuối cùng nếu có
    if (subjectInfo) {
      if (!subjectsByDay[subjectInfo.thu]) {
        subjectsByDay[subjectInfo.thu] = [];
      }
      subjectsByDay[subjectInfo.thu].push({ ...subjectInfo });
    }
  }

  // Lấy thông tin tuần từ nội dung
  const weekInfo = rawContent.match(/📅 (.*?)(?=\n|$)/)?.[1] || "";

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
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-blue-600 dark:text-blue-400">
            {title}
          </h3>
          {weekInfo && (
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-sm">
                <IconCalendarWeek size={14} />
                {weekInfo}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* No schedule message */}
      {noSchedule && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-gray-100 dark:bg-gray-700">
          <IconAlertTriangle size={20} className="text-orange-500" />
          <p className="text-gray-700 dark:text-gray-300">
            {rawContent.match(/Không có lịch học.*/)?.[0] ||
              "Không có lịch học."}
          </p>
        </div>
      )}

      {/* Schedule items by day */}
      {!noSchedule && Object.keys(subjectsByDay).length > 0 && (
        <div className="mt-4 space-y-6">
          {Object.entries(subjectsByDay).map(([day, daySubjects]) => (
            <div key={day} className="space-y-3">
              <h4 className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">
                {day && (
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
                    <IconCalendar size={16} />
                  </span>
                )}
                {day}
              </h4>
              <div className="grid gap-3">
                {daySubjects.map((subject, index) => {
                  const formattedTiet = formatTiet(subject.tiet);
                  const buoi = getBuoi(formattedTiet.split("-")[0]);

                  return (
                    <div
                      key={index}
                      className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <IconSchool size={16} className="text-blue-500" />
                            <span className="font-medium text-black dark:text-white">
                              {subject.tenMon}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <IconUser size={14} />
                            <span>{subject.giangVien}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <IconBuilding size={14} />
                            <span>{subject.phong || "Chưa có phòng"}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 items-end">
                          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
                            <IconClock size={12} />
                            <span className="text-xs font-medium">
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
