import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  IconX,
  IconWand,
  IconBook,
  IconLanguage,
  IconListCheck,
} from "@tabler/icons-react";
import CodeAssistant from "./CodeManager/CodeManager";
import { setSessionStorage } from "../../../../utils/sessionStorage";
import { emitter, MAGIC_EVENTS } from "../../../../lib/events";

interface MagicRoomProps {
  onToggleMagicMode?: () => void;
}

export default function MagicRoom({ onToggleMagicMode }: MagicRoomProps) {
  const [showCodeAssistant, setShowCodeAssistant] = useState(false);

  useEffect(() => {
    emitter.on(MAGIC_EVENTS.OPEN_CODE_ASSISTANT, () => {
      setShowCodeAssistant(true);
    });

    return () => {
      emitter.off(MAGIC_EVENTS.OPEN_CODE_ASSISTANT);
    };
  }, []);

  if (showCodeAssistant) {
    return (
      <CodeAssistant
        onClose={() => {
          setShowCodeAssistant(false);
          setSessionStorage("ui_state_magic", "magic_room");
        }}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-transparent bg-clip-text">
            Phòng Ma Thuật
          </h2>
          <button
            onClick={() => {
              setSessionStorage("ui_state_magic", "none");
              if (onToggleMagicMode) onToggleMagicMode();
            }}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors cursor-pointer"
          >
            <IconX size={24} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Hero Section */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <IconWand className="w-12 h-12 mx-auto text-purple-500 mb-3" />
            <h1 className="text-2xl font-semibold mb-2">
              Công Cụ Ma Thuật Hỗ Trợ AI
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Tối ưu hóa quy trình làm việc của bạn với sự hỗ trợ của trí tuệ
              nhân tạo
            </p>
          </motion.div>
        </div>

        {/* Tools Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => {
              setSessionStorage("ui_state_magic", "code_manager");
              setShowCodeAssistant(true);
            }}
            className="w-full p-5 rounded-xl bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-gray-900 border border-gray-200 dark:border-gray-700 flex items-center gap-4 transition-colors cursor-pointer"
          >
            <IconWand className="text-purple-500 w-8 h-8" />
            <div className="text-left flex-1">
              <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
                Quản Lý Mã Nguồn
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                AI hỗ trợ viết code, debug và tối ưu hóa
              </p>
            </div>
            <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
              Không ổn định
            </span>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full p-5 rounded-xl bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-gray-900 border border-gray-200 dark:border-gray-700 flex items-center gap-4 transition-colors"
          >
            <IconBook className="text-blue-500 w-8 h-8" />
            <div className="text-left flex-1">
              <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
                Sáng Tạo Truyện
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Công cụ hỗ trợ sáng tác, phát triển cốt truyện
              </p>
            </div>
            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
              Đang phát triển
            </span>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full p-5 rounded-xl bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-gray-900 border border-gray-200 dark:border-gray-700 flex items-center gap-4 transition-colors"
          >
            <IconLanguage className="text-green-500 w-8 h-8" />
            <div className="text-left flex-1">
              <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
                Dịch Truyện
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Dịch thuật thông minh với độ chính xác cao
              </p>
            </div>
            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
              Đang phát triển
            </span>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="w-full p-5 rounded-xl bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-gray-900 border border-gray-200 dark:border-gray-700 flex items-center gap-4 transition-colors"
          >
            <IconListCheck className="text-amber-500 w-8 h-8" />
            <div className="text-left flex-1">
              <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
                Quản Lý Công Việc
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Lập kế hoạch và theo dõi tiến độ thông minh
              </p>
            </div>
            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
              Đang phát triển
            </span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
