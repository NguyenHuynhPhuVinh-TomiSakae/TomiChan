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
} from "@tabler/icons-react";
import React from "react";
import { SearchResultBlock } from "./CustomUI/SearchResultBlock";
import { SearchLinkBlock } from "./CustomUI/SearchResultBlock";
import { SearchingBlock } from "./CustomUI/SearchResultBlock";
import { ThinkBlock } from "./CustomUI/ThinkBlock";
import { FileCreationPreview } from "./CustomUI/FileCreationPreview";
import { TVUScheduleBlock } from "./CustomUI/TVUScheduleBlock";
import { TVUScheduleResult } from "./CustomUI/TVUScheduleResult";
import { TVUScoreBlock } from "./CustomUI/TVUScoreBlock";
import { TVUScoreResult } from "./CustomUI/TVUScoreResult";

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
    return <TVUScheduleBlock>{children}</TVUScheduleBlock>;
  },

  "tvu-schedule-result": ({ children }: CustomUIComponentsProps) => {
    return <TVUScheduleResult>{children}</TVUScheduleResult>;
  },

  "tvu-score-block": ({ children }: CustomUIComponentsProps) => {
    return <TVUScoreBlock>{children}</TVUScoreBlock>;
  },

  "tvu-score-result": ({ children }: CustomUIComponentsProps) => {
    return <TVUScoreResult>{children}</TVUScoreResult>;
  },
};
