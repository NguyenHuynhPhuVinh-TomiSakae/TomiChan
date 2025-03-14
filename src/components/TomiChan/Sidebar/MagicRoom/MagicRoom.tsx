import React from "react";
import { motion } from "framer-motion";
import {
  IconX,
  IconWand,
  IconBook,
  IconLanguage,
  IconListCheck,
} from "@tabler/icons-react";

interface MagicRoomProps {
  onToggleMagicMode?: () => void;
}

export default function MagicRoom({ onToggleMagicMode }: MagicRoomProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-transparent bg-clip-text">
            Phòng Ma Thuật
          </h2>
          <button
            onClick={onToggleMagicMode}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors cursor-pointer"
          >
            <IconX size={24} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Hero Section */}
        <div className="p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto text-center"
          >
            <IconWand className="w-16 h-16 mx-auto text-purple-500 mb-4" />
            <h1 className="text-3xl font-bold mb-4">
              Công Cụ Ma Thuật Hỗ Trợ AI
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Tối ưu hóa quy trình làm việc của bạn với sự hỗ trợ của trí tuệ
              nhân tạo
            </p>
          </motion.div>
        </div>

        {/* Tools Grid */}
        <div className="p-6 space-y-4">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full p-6 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 border border-purple-500/20 flex items-center gap-4 transition-all"
          >
            <IconWand className="text-purple-500 w-8 h-8" />
            <div className="text-left">
              <h3 className="text-lg font-semibold">Quản Lý Mã Nguồn</h3>
              <p className="text-gray-600 dark:text-gray-400">
                AI hỗ trợ viết code, debug và tối ưu hóa
              </p>
            </div>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full p-6 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 hover:from-blue-500/20 hover:to-cyan-500/20 border border-blue-500/20 flex items-center gap-4 transition-all"
          >
            <IconBook className="text-blue-500 w-8 h-8" />
            <div className="text-left">
              <h3 className="text-lg font-semibold">Sáng Tạo Truyện</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Công cụ hỗ trợ sáng tác và phát triển cốt truyện
              </p>
            </div>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full p-6 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 hover:from-green-500/20 hover:to-emerald-500/20 border border-green-500/20 flex items-center gap-4 transition-all"
          >
            <IconLanguage className="text-green-500 w-8 h-8" />
            <div className="text-left">
              <h3 className="text-lg font-semibold">Dịch Truyện</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Dịch thuật thông minh với độ chính xác cao
              </p>
            </div>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="w-full p-6 rounded-xl bg-gradient-to-r from-amber-500/10 to-yellow-500/10 hover:from-amber-500/20 hover:to-yellow-500/20 border border-amber-500/20 flex items-center gap-4 transition-all"
          >
            <IconListCheck className="text-amber-500 w-8 h-8" />
            <div className="text-left">
              <h3 className="text-lg font-semibold">Quản Lý Công Việc</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Lập kế hoạch và theo dõi tiến độ thông minh
              </p>
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
