/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  IconFilePlus,
  IconFolderPlus,
  IconPlayerPlay,
  IconWand,
  IconArrowLeft,
  IconBuildingSkyscraper,
  IconPencil,
  IconTrash,
  IconMail,
  IconSend,
  IconCalendar,
  IconClock,
  IconSchool,
  IconUser,
  IconBuilding,
  IconLoader2,
  IconCalendarTime,
  IconAlertTriangle,
} from "@tabler/icons-react";
import React from "react";
import { SearchResultBlock } from "./SearchResultBlock";
import { SearchLinkBlock } from "./SearchResultBlock";
import { SearchingBlock } from "./SearchResultBlock";
import { ThinkBlock } from "./ThinkBlock";
import { FileCreationPreview } from "./FileCreationPreview";

interface CustomUIComponentsProps {
  children: React.ReactNode;
}

export const CustomUIComponents = {
  "search-result": ({ children }: CustomUIComponentsProps) => {
    return <SearchResultBlock>{children}</SearchResultBlock>;
  },
  "search-link": ({ children }: CustomUIComponentsProps) => {
    return <SearchLinkBlock content={children?.toString() || ""} />;
  },

  "search-block": () => {
    return <SearchingBlock />;
  },

  "magic-mode": ({ children }: CustomUIComponentsProps) => {
    // Xử lý thẻ MagicMode
    const modeNumber = children?.toString() || "0";

    // Kiểm tra xem có phải là mode quản lý code không (mode 1)
    if (modeNumber === "1") {
      return (
        <div className="my-4 p-4 rounded-lg border-2 border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
          <div className="flex items-center gap-2 mb-2">
            <IconWand className="text-purple-500" size={20} />
            <span className="font-semibold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-transparent bg-clip-text">
              Quản Lý Mã Nguồn
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Đã kích hoạt tính năng Quản Lý Mã Nguồn. Bạn có thể yêu cầu AI hỗ
            trợ viết code, debug và tối ưu hóa.
          </p>
        </div>
      );
    }

    return null;
  },

  "code-manager": ({ children }: CustomUIComponentsProps) => {
    // Xử lý thẻ MagicMode
    const modeNumber = children?.toString() || "0";

    // Kiểm tra xem có phải là mode quay về magic room không (mode 0)
    if (modeNumber === "0") {
      return (
        <div className="my-4 p-4 rounded-lg border-2 border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
          <div className="flex items-center gap-2 mb-2">
            <IconWand className="text-purple-500" size={20} />
            <span className="font-semibold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-transparent bg-clip-text">
              Quay về Phòng Ma Thuật
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Đã kích hoạt tính năng Quay về Phòng Ma Thuật.
          </p>
        </div>
      );
    }

    return null;
  },

  "create-file": ({ children }: CustomUIComponentsProps) => {
    const content = children?.toString() || "";
    return <FileCreationPreview content={content} />;
  },

  "create-folder": ({ children }: CustomUIComponentsProps) => {
    const content = children?.toString() || "";
    return (
      <div className="my-4 p-4 rounded-lg border-2 border-green-500/30 bg-gradient-to-r from-green-500/10 to-emerald-500/10">
        <div className="flex items-center gap-2 mb-2">
          <IconFolderPlus className="text-green-500" size={20} />
          <span className="font-semibold bg-gradient-to-r from-green-400 via-emerald-500 to-green-500 text-transparent bg-clip-text">
            Tạo Thư Mục Mới
          </span>
        </div>
        <pre className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
          {content}
        </pre>
      </div>
    );
  },

  "create-project": ({ children }: CustomUIComponentsProps) => {
    const content = children?.toString() || "";
    const name = content.match(/name:\s*(.*)/)?.[1]?.trim();
    const description = content.match(/description:\s*(.*)/)?.[1]?.trim() || "";

    return (
      <div className="my-4 p-4 rounded-lg border-2 border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
        <div className="flex items-center gap-2 mb-2">
          <IconBuildingSkyscraper className="text-blue-500" size={20} />
          <span className="font-semibold bg-gradient-to-r from-blue-400 via-purple-500 to-blue-500 text-transparent bg-clip-text">
            Tạo Dự Án Mới
          </span>
        </div>
        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
          <div>
            <strong>Tên dự án:</strong> {name}
          </div>
          {description && (
            <div>
              <strong>Mô tả:</strong> {description}
            </div>
          )}
        </div>
      </div>
    );
  },

  "update-project": ({ children }: CustomUIComponentsProps) => {
    const content = children?.toString() || "";
    const id = content.match(/id:\s*(.*)/)?.[1]?.trim();
    const name = content.match(/name:\s*(.*)/)?.[1]?.trim();
    const description = content.match(/description:\s*(.*)/)?.[1]?.trim() || "";

    return (
      <div className="my-4 p-4 rounded-lg border-2 border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10">
        <div className="flex items-center gap-2 mb-2">
          <IconPencil className="text-amber-500" size={20} />
          <span className="font-semibold bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 text-transparent bg-clip-text">
            Cập Nhật Dự Án
          </span>
        </div>
        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
          <div>
            <strong>ID dự án:</strong> {id}
          </div>
          <div>
            <strong>Tên mới:</strong> {name}
          </div>
          {description && (
            <div>
              <strong>Mô tả mới:</strong> {description}
            </div>
          )}
        </div>
      </div>
    );
  },

  "delete-project": ({ children }: CustomUIComponentsProps) => {
    const content = children?.toString() || "";
    const id = content.match(/id:\s*(.*)/)?.[1]?.trim();

    return (
      <div className="my-4 p-4 rounded-lg border-2 border-red-500/30 bg-gradient-to-r from-red-500/10 to-pink-500/10">
        <div className="flex items-center gap-2 mb-2">
          <IconTrash className="text-red-500" size={20} />
          <span className="font-semibold bg-gradient-to-r from-red-400 via-pink-500 to-red-500 text-transparent bg-clip-text">
            Xóa Dự Án
          </span>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <div>
            <strong>ID dự án:</strong> {id}
          </div>
        </div>
      </div>
    );
  },

  "rename-file": ({ children }: CustomUIComponentsProps) => {
    const content = children?.toString() || "";
    return (
      <div className="my-4 p-4 rounded-lg border-2 border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
        <div className="flex items-center gap-2 mb-2">
          <IconFilePlus className="text-yellow-500" size={20} />
          <span className="font-semibold bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-500 text-transparent bg-clip-text">
            Đổi Tên File
          </span>
        </div>
        <pre className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
          {content}
        </pre>
      </div>
    );
  },

  "rename-folder": ({ children }: CustomUIComponentsProps) => {
    const content = children?.toString() || "";
    return (
      <div className="my-4 p-4 rounded-lg border-2 border-orange-500/30 bg-gradient-to-r from-orange-500/10 to-red-500/10">
        <div className="flex items-center gap-2 mb-2">
          <IconFolderPlus className="text-orange-500" size={20} />
          <span className="font-semibold bg-gradient-to-r from-orange-400 via-red-500 to-orange-500 text-transparent bg-clip-text">
            Đổi Tên Thư Mục
          </span>
        </div>
        <pre className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
          {content}
        </pre>
      </div>
    );
  },

  "delete-file": ({ children }: CustomUIComponentsProps) => {
    const content = children?.toString() || "";
    return (
      <div className="my-4 p-4 rounded-lg border-2 border-red-500/30 bg-gradient-to-r from-red-500/10 to-pink-500/10">
        <div className="flex items-center gap-2 mb-2">
          <IconFilePlus className="text-red-500" size={20} />
          <span className="font-semibold bg-gradient-to-r from-red-400 via-pink-500 to-red-500 text-transparent bg-clip-text">
            Xóa File
          </span>
        </div>
        <pre className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
          {content}
        </pre>
      </div>
    );
  },

  "delete-folder": ({ children }: CustomUIComponentsProps) => {
    const content = children?.toString() || "";
    return (
      <div className="my-4 p-4 rounded-lg border-2 border-pink-500/30 bg-gradient-to-r from-pink-500/10 to-purple-500/10">
        <div className="flex items-center gap-2 mb-2">
          <IconFolderPlus className="text-pink-500" size={20} />
          <span className="font-semibold bg-gradient-to-r from-pink-400 via-purple-500 to-pink-500 text-transparent bg-clip-text">
            Xóa Thư Mục
          </span>
        </div>
        <pre className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
          {content}
        </pre>
      </div>
    );
  },

  "open-media": ({ children }: CustomUIComponentsProps) => {
    const content = children?.toString() || "";
    const path = content.match(/path:\s*(.*)/)?.[1]?.trim();

    if (!path) return <></>;

    return (
      <div className="my-4 p-4 rounded-lg border-2 border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
        <div className="flex items-center gap-2 mb-2">
          <IconPlayerPlay className="text-blue-500" size={20} />
          <span className="font-semibold bg-gradient-to-r from-blue-400 via-cyan-500 to-blue-500 text-transparent bg-clip-text">
            Mở File Media
          </span>
        </div>
        <pre className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
          {path}
        </pre>
      </div>
    );
  },

  "open-code": ({ children }: CustomUIComponentsProps) => {
    const content = children?.toString() || "";
    const path = content.match(/path:\s*(.*)/)?.[1]?.trim();

    if (!path) return <></>;

    return (
      <div className="my-4 p-4 rounded-lg border-2 border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
        <div className="flex items-center gap-2 mb-2">
          <IconFilePlus className="text-indigo-500" size={20} />
          <span className="font-semibold bg-gradient-to-r from-indigo-400 via-purple-500 to-indigo-500 text-transparent bg-clip-text">
            Mở File Code
          </span>
        </div>
        <pre className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
          {path}
        </pre>
      </div>
    );
  },

  "media-view": ({ children }: CustomUIComponentsProps) => {
    const content = children?.toString() || "";
    if (content !== "0") return <></>;

    return (
      <div className="my-4 p-4 rounded-lg border-2 border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
        <div className="flex items-center gap-2 mb-2">
          <IconArrowLeft className="text-purple-500" size={20} />
          <span className="font-semibold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-transparent bg-clip-text">
            Quay về Code Manager
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Đã kích hoạt tính năng quay về Code Manager.
        </p>
      </div>
    );
  },

  "code-editor": ({ children }: CustomUIComponentsProps) => {
    const content = children?.toString() || "";
    if (content !== "0") return <></>;

    return (
      <div className="my-4 p-4 rounded-lg border-2 border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
        <div className="flex items-center gap-2 mb-2">
          <IconArrowLeft className="text-indigo-500" size={20} />
          <span className="font-semibold bg-gradient-to-r from-indigo-400 via-purple-500 to-indigo-500 text-transparent bg-clip-text">
            Quay về Code Manager
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Đã kích hoạt tính năng quay về Code Manager.
        </p>
      </div>
    );
  },

  "file-path": ({ children }: CustomUIComponentsProps) => {
    // Component này chỉ để xử lý thẻ, không hiển thị gì cả
    return <></>;
  },

  think: ({ children }: CustomUIComponentsProps) => {
    return <ThinkBlock>{children}</ThinkBlock>;
  },

  "email-block": ({ children }: CustomUIComponentsProps) => {
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

    // Tách nội dung email bằng regex
    const to = rawContent.match(/TO:\s*(.*?)(?=\n|$)/)?.[1]?.trim();
    const subject = rawContent.match(/SUBJECT:\s*(.*?)(?=\n|$)/)?.[1]?.trim();
    const contentMatch = rawContent.match(
      /CONTENT:\s*([\s\S]*?)(?=\[\/EMAIL\]|$)/
    );
    const emailContent = contentMatch?.[1]?.trim();

    return (
      <div className="my-4 p-4 rounded-lg border-2 border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
        <div className="flex items-center gap-2 mb-3">
          <IconMail className="text-blue-500" size={20} />
          <span className="font-semibold bg-gradient-to-r from-blue-400 via-cyan-500 to-blue-500 text-transparent bg-clip-text">
            Gửi Email
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <span className="font-medium text-sm text-gray-700 dark:text-gray-300 w-20">
              Đến:
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400 flex-1">
              {to}
            </span>
          </div>

          <div className="flex items-start gap-2">
            <span className="font-medium text-sm text-gray-700 dark:text-gray-300 w-20">
              Tiêu đề:
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400 flex-1">
              {subject}
            </span>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
            <div className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">
              Nội dung:
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap pl-2 border-l-2 border-gray-200 dark:border-gray-700">
              {emailContent}
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <div className="text-xs text-gray-500 dark:text-gray-400 italic flex items-center gap-1">
            <IconSend size={12} />
            Email sẽ được gửi tự động...
          </div>
        </div>
      </div>
    );
  },

  "tvu-schedule-block": ({ children }: CustomUIComponentsProps) => {
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
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {subtitle}
            </p>
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
  },

  "tvu-schedule-result": ({ children }: CustomUIComponentsProps) => {
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
      // Tách số tiết, ví dụ "1-3" sẽ lấy tiết đầu tiên là 1
      const tietDau = parseInt(tiet.split("-")[0]);

      if (tietDau >= 1 && tietDau <= 5) return "Buổi sáng";
      if (tietDau >= 6 && tietDau <= 10) return "Buổi chiều";
      if (tietDau >= 11 && tietDau <= 15) return "Buổi tối";
      return "";
    };

    // Lấy phần nội dung sau các thông tin header
    const contentStart =
      rawContent.indexOf(action || "") + (action || "").length;
    const scheduleContent = rawContent.slice(contentStart).trim();

    // Kiểm tra xem nội dung có phải là thông báo không có lịch không
    const noSchedule = scheduleContent.includes("Không có lịch học vào ngày");

    // Phân tích nội dung thành các môn học (mỗi môn cách nhau bởi dòng trống)
    const subjects = !noSchedule
      ? scheduleContent.split("\n\n").filter(Boolean)
      : [];

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
              {scheduleContent}
            </p>
          </div>
        )}

        {/* Schedule items */}
        {!noSchedule && (
          <div className="mt-4 space-y-4">
            {subjects.map((subject, index) => {
              // Phân tích thông tin môn học
              const tenMon = subject.match(/📚 (.*?)(?=\n|$)/)?.[1]?.trim();
              const giangVien = subject
                .match(/👨‍🏫 GV: (.*?)(?=\n|$)/)?.[1]
                ?.trim();
              const phong = subject
                .match(/🏢 Phòng: (.*?)(?=\n|$)/)?.[1]
                ?.trim();
              const tiet = subject.match(/⏰ Tiết (.*?)(?=\n|$)/)?.[1]?.trim();
              const buoi = getBuoi(tiet || "");

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
                          {tenMon}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <IconUser size={16} />
                        <span>{giangVien}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <IconBuilding size={16} />
                        <span>{phong}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
                        <IconClock size={14} />
                        <span className="text-sm font-medium">Tiết {tiet}</span>
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
  },

  "tvu-score-block": ({ children }: CustomUIComponentsProps) => {
    const rawContent = React.Children.toArray(children)
      .map((child) => {
        if (typeof child === "string") return child;
        if (child && typeof child === "object" && "props" in child) {
          return (child as any).props.children;
        }
        return "";
      })
      .join("");

    const action = rawContent.match(/ACTION:\s*(.*?)(?=\n|$)/)?.[1]?.trim();

    return (
      <div className="my-4 p-4 rounded-lg border-2 border-green-500/30 bg-gradient-to-r from-green-500/10 to-emerald-500/10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
            <IconSchool
              className="text-green-500 dark:text-green-400"
              size={24}
            />
          </div>
          <div>
            <h3 className="font-semibold text-lg bg-gradient-to-r from-green-400 via-emerald-500 to-green-500 text-transparent bg-clip-text">
              Điểm Học Tập TVU
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Tra cứu bảng điểm sinh viên
            </p>
          </div>
        </div>

        {/* Loading indicator */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <IconLoader2 className="animate-spin" size={16} />
          <span>Đang tải dữ liệu điểm...</span>
        </div>
      </div>
    );
  },

  "tvu-score-result": ({ children }: CustomUIComponentsProps) => {
    const rawContent = React.Children.toArray(children)
      .map((child) => {
        if (typeof child === "string") return child;
        if (child && typeof child === "object" && "props" in child) {
          return (child as any).props.children;
        }
        return "";
      })
      .join("");

    const action = rawContent.match(/ACTION:\s*(.*?)(?=\n|$)/)?.[1]?.trim();
    const gpa10 = rawContent.match(/GPA10:\s*(.*?)(?=\n|$)/)?.[1]?.trim();
    const gpa4 = rawContent.match(/GPA4:\s*(.*?)(?=\n|$)/)?.[1]?.trim();
    const totalCredits = rawContent
      .match(/TOTAL_CREDITS:\s*(.*?)(?=\n|$)/)?.[1]
      ?.trim();

    // Parse semester information
    const semestersMatch = rawContent.match(/SEMESTERS:\s*(.*?)(?=\n)/);
    const semestersStr = semestersMatch?.[1]?.trim() || "[]";

    let semesters = [];
    try {
      semesters = JSON.parse(semestersStr);
    } catch (error) {
      console.error("Lỗi parse dữ liệu học kỳ:", error);
    }

    // Parse subjects from JSON string
    const subjectsMatch = rawContent.match(/SUBJECTS:\s*(.*?)(?=\n)/);
    const subjectsStr = subjectsMatch?.[1]?.trim() || "[]";

    let subjects = [];
    try {
      subjects = JSON.parse(subjectsStr);
    } catch (error) {
      console.error("Lỗi parse dữ liệu môn học:", error);
    }

    // LUÔN tạo subjectsBySemester từ subjects, bỏ qua chuỗi SUBJECTS_BY_SEMESTER từ API
    let subjectsBySemester = {};
    if (subjects && Array.isArray(subjects) && subjects.length > 0) {
      console.log("Đang tạo subjectsBySemester từ danh sách subjects...");
      subjectsBySemester = subjects.reduce((acc: any, subject: any) => {
        const id = subject.semesterId;
        if (!acc[id]) {
          acc[id] = [];
        }
        // Chỉ thêm các môn đã có điểm
        if (subject.avgScore && subject.avgScore !== "-") {
          acc[id].push(subject);
        }
        return acc;
      }, {});

      // Sắp xếp các môn học theo điểm từ cao xuống thấp
      Object.keys(subjectsBySemester).forEach((semId) => {
        (subjectsBySemester as any)[semId].sort((a: any, b: any) => {
          const scoreA = parseFloat(a.avgScore) || 0;
          const scoreB = parseFloat(b.avgScore) || 0;
          return scoreB - scoreA;
        });
      });

      console.log(
        "Đã tạo xong subjectsBySemester:",
        Object.keys(subjectsBySemester)
      );
    }

    console.log("Final SUBJECTS_BY_SEMESTER:", subjectsBySemester);

    return (
      <div className="my-4 p-4 rounded-lg border-2 border-green-500/30 bg-white dark:bg-gray-800 shadow-md">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
            <IconSchool
              className="text-green-500 dark:text-green-400"
              size={24}
            />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-green-600 dark:text-green-400">
              Bảng Điểm Học Tập
            </h3>
          </div>
        </div>

        {/* GPA và Tín chỉ tích lũy */}
        <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Điểm TB tích lũy (hệ 10)
              </div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {gpa10}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Điểm TB tích lũy (hệ 4)
              </div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {gpa4}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Tín chỉ tích lũy
              </div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {totalCredits}
              </div>
            </div>
          </div>
        </div>

        {/* Tổng quan từng học kỳ */}
        <div className="mb-4">
          <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
            Tổng quan học kỳ
          </h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Học kỳ
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Điểm TB (hệ 10)
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Điểm TB (hệ 4)
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Tín chỉ đạt
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Xếp loại
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {semesters.map((semester: any, index: number) => (
                  <tr
                    key={index}
                    className={
                      index % 2 === 0 ? "bg-gray-50 dark:bg-gray-800/50" : ""
                    }
                  >
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-300">
                      {semester.semesterName}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-center text-sm text-green-600 dark:text-green-400">
                      {semester.semesterGPA10}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-center text-sm text-green-600 dark:text-green-400">
                      {semester.semesterGPA4}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-center text-sm text-gray-500 dark:text-gray-400">
                      {semester.semesterCredits}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-center text-sm text-blue-600 dark:text-blue-400 font-medium">
                      {semester.classification}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Danh sách điểm theo học kỳ */}
        <div className="mt-6 space-y-6">
          <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
            Chi tiết điểm từng môn
          </h4>
          {semesters.map((semester: any) => {
            const semesterId = semester.semesterId;
            const semesterSubjects =
              (subjectsBySemester as any)[semesterId] || [];

            if (semesterSubjects.length === 0) return null;

            return (
              <div
                key={semesterId}
                className="border rounded-lg overflow-hidden mb-6"
              >
                <div className="bg-green-100 dark:bg-green-900/50 p-3 flex justify-between items-center">
                  <h4 className="font-medium text-green-800 dark:text-green-300">
                    {semester.semesterName}
                  </h4>
                  <div className="text-sm text-green-700 dark:text-green-400">
                    <span className="font-medium">GPA:</span>{" "}
                    {semester.semesterGPA10} |
                    <span className="font-medium ml-2">TC:</span>{" "}
                    {semester.semesterCredits}
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Môn học
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Mã môn
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          TC
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Điểm QT
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Điểm thi
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Điểm hệ 10
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Điểm hệ 4
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Điểm chữ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {semesterSubjects.map((subject: any, index: number) => (
                        <React.Fragment key={`${subject.subjectCode}-${index}`}>
                          <tr
                            className={
                              index % 2 === 0
                                ? "bg-gray-50 dark:bg-gray-800/50"
                                : ""
                            }
                          >
                            <td className="px-3 py-2 whitespace-normal text-sm text-gray-900 dark:text-gray-300">
                              {subject.subjectName}
                              {!subject.countedInGPA && (
                                <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                                  * {subject.notCountReason}
                                </div>
                              )}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-center text-sm text-gray-500 dark:text-gray-400">
                              {subject.subjectCode}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-center text-sm text-gray-500 dark:text-gray-400">
                              {subject.credits}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-center text-sm text-gray-500 dark:text-gray-400">
                              {subject.midtermScore}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-center text-sm text-gray-500 dark:text-gray-400">
                              {subject.finalScore}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-center text-sm font-medium">
                              <span
                                className={
                                  parseFloat(subject.avgScore) >= 7
                                    ? "text-green-600 dark:text-green-400"
                                    : parseFloat(subject.avgScore) >= 5
                                    ? "text-blue-600 dark:text-blue-400"
                                    : "text-red-600 dark:text-red-400"
                                }
                              >
                                {subject.avgScore}
                              </span>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-center text-sm font-medium">
                              <span
                                className={
                                  parseFloat(subject.numericGrade) >= 3
                                    ? "text-green-600 dark:text-green-400"
                                    : parseFloat(subject.numericGrade) >= 2
                                    ? "text-blue-600 dark:text-blue-400"
                                    : "text-red-600 dark:text-red-400"
                                }
                              >
                                {subject.numericGrade}
                              </span>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-center text-sm font-semibold">
                              <span
                                className={
                                  subject.letterGrade === "A" ||
                                  subject.letterGrade === "A+"
                                    ? "text-green-700 dark:text-green-300"
                                    : subject.letterGrade === "B+" ||
                                      subject.letterGrade === "B"
                                    ? "text-blue-700 dark:text-blue-300"
                                    : subject.letterGrade === "C+" ||
                                      subject.letterGrade === "C"
                                    ? "text-yellow-700 dark:text-yellow-300"
                                    : "text-red-700 dark:text-red-300"
                                }
                              >
                                {subject.letterGrade}
                              </span>
                            </td>
                          </tr>
                          {subject.componentScores &&
                            subject.componentScores.length > 0 && (
                              <tr className="bg-gray-100 dark:bg-gray-800/20">
                                <td colSpan={8} className="px-3 py-2">
                                  <div className="text-xs text-gray-600 dark:text-gray-400 pl-4">
                                    <p className="font-medium mb-1">
                                      Chi tiết điểm thành phần:
                                    </p>
                                    <div className="grid grid-cols-3 gap-2">
                                      {subject.componentScores.map(
                                        (component: any, idx: number) => (
                                          <div
                                            key={idx}
                                            className="flex items-center gap-1"
                                          >
                                            <span className="font-medium">
                                              {component.componentName}:
                                            </span>
                                            <span>{component.score}</span>
                                            <span className="text-gray-500 dark:text-gray-500">
                                              ({component.weight}%)
                                            </span>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
};
