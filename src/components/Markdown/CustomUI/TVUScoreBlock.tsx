/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { IconSchool, IconLoader2 } from "@tabler/icons-react";

interface TVUScoreBlockProps {
  children: React.ReactNode;
}

export const TVUScoreBlock: React.FC<TVUScoreBlockProps> = () => {
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
};
