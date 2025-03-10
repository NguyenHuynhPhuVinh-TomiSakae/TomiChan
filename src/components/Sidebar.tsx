import React from "react";
import {
  IconMessage,
  IconSettings,
  IconLayoutSidebarLeftCollapse,
} from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";
import { Message } from "../types";

interface SidebarProps {
  onNewChat: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  messages: Message[];
}

export default function Sidebar({
  onNewChat,
  isCollapsed,
  onToggleCollapse,
  messages,
}: SidebarProps) {
  const [isFirstRender, setIsFirstRender] = React.useState(true);

  React.useEffect(() => {
    setIsFirstRender(false);
  }, []);

  return (
    <div
      className={`${isCollapsed ? "w-16" : "w-64"} ${
        messages.length > 0 ? "fixed" : "relative"
      } left-0 top-0 bottom-0 bg-white border-r border-black flex flex-col transition-all duration-300`}
    >
      {/* Header with Title and Collapse button */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={isFirstRender ? { opacity: 1 } : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0 } }}
                transition={{ delay: 0.3 }}
                className="font-semibold text-2xl truncate"
              >
                TomiChan
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button
          onClick={onToggleCollapse}
          className="p-2 hover:bg-gray-100 rounded-full cursor-pointer flex-shrink-0"
        >
          <IconLayoutSidebarLeftCollapse
            size={24}
            className={isCollapsed ? "rotate-180" : ""}
          />
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={onNewChat}
          className={`w-full py-2 bg-black text-white cursor-pointer rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors ${
            isCollapsed ? "px-2" : "px-4"
          }`}
        >
          <IconMessage size={20} className="flex-shrink-0" />
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.span
                initial={
                  isFirstRender ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }
                }
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10, transition: { duration: 0 } }}
                transition={{ delay: 0.3 }}
                className="ml-2 truncate"
              >
                Cuộc trò chuyện mới
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-grow overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={isFirstRender ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0 } }}
              transition={{ delay: 0.3 }}
              className="text-sm text-gray-500 mb-2"
            >
              Lịch sử trò chuyện
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Settings Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          className={`w-full py-2 cursor-pointer text-gray-700 rounded-lg flex items-center hover:bg-gray-200 transition-colors ${
            isCollapsed ? "px-2 justify-center" : "px-4"
          }`}
        >
          <IconSettings size={20} className="flex-shrink-0" />
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.span
                initial={
                  isFirstRender ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }
                }
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10, transition: { duration: 0 } }}
                transition={{ delay: 0.3 }}
                className="ml-2 truncate"
              >
                Cài đặt
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );
}
