/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import ModalWrapper from "@/components/ProviderSettings/ModalWrapper";
import {
  IconMail,
  IconCalendar,
  IconMovie,
  IconChevronRight,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import { getLocalStorage, setLocalStorage } from "@/utils/localStorage";
import EmailToolModal from "./tools/EmailToolModal";
import TVUScheduleToolModal from "./tools/TVUScheduleToolModal";
import AnimeSearchToolModal from "./tools/AnimeSearchToolModal";

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
}

const defaultTools: Tool[] = [
  {
    id: "email",
    name: "Gửi Mail",
    description: "Hỗ trợ soạn và gửi email tự động với nội dung được tối ưu",
    icon: <IconMail size={24} stroke={1.5} />,
    enabled: false,
  },
  {
    id: "tvu_schedule",
    name: "Xem TKB TVU",
    description: "Tra cứu và quản lý thời khóa biểu Trường Đại học Trà Vinh",
    icon: <IconCalendar size={24} stroke={1.5} />,
    enabled: false,
  },
  {
    id: "anime_search",
    name: "Tra cứu Anime",
    description:
      "Tìm kiếm thông tin anime, manga và các bộ phim hoạt hình Nhật Bản",
    icon: <IconMovie size={24} stroke={1.5} />,
    enabled: false,
  },
];

interface ToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool?: (tool: Tool) => void;
}

export default function ToolsModal({
  isOpen,
  onClose,
  onSelectTool,
}: ToolsModalProps) {
  const [tools, setTools] = useState<Tool[]>(defaultTools);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);

  // Load danh sách tool đã bật từ localStorage
  useEffect(() => {
    const enabledToolIds = getLocalStorage("enabled_tools", "[]");
    try {
      const parsedToolIds = JSON.parse(enabledToolIds);
      setTools(
        tools.map((tool) => ({
          ...tool,
          enabled: parsedToolIds.includes(tool.id),
        }))
      );
    } catch (error) {
      console.error("Error parsing enabled tools:", error);
    }
  }, []);

  const handleToolClick = (tool: Tool) => {
    setSelectedTool(tool);
  };

  const handleToolEnable = (toolId: string) => {
    const updatedTools = tools.map((tool) =>
      tool.id === toolId ? { ...tool, enabled: true } : tool
    );
    setTools(updatedTools);

    // Lưu danh sách ID của các tool đã bật
    const enabledToolIds = updatedTools
      .filter((tool) => tool.enabled)
      .map((tool) => tool.id);
    setLocalStorage("enabled_tools", JSON.stringify(enabledToolIds));
  };

  const handleToolDisable = (toolId: string) => {
    const updatedTools = tools.map((tool) =>
      tool.id === toolId ? { ...tool, enabled: false } : tool
    );
    setTools(updatedTools);

    // Lưu danh sách ID của các tool đã bật
    const enabledToolIds = updatedTools
      .filter((tool) => tool.enabled)
      .map((tool) => tool.id);
    setLocalStorage("enabled_tools", JSON.stringify(enabledToolIds));
  };

  const handleCloseDetailModal = () => {
    setSelectedTool(null);
  };

  return (
    <>
      <ModalWrapper
        isOpen={isOpen}
        onClose={onClose}
        title="Danh Sách Công Cụ AI"
        maxWidth="xl"
      >
        <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-800">
          {tools.map((tool) => {
            const isInDevelopment = tool.id === "anime_search";
            return (
              <div
                key={tool.id}
                className={`flex items-center justify-between py-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors px-4 -mx-4 relative ${
                  isInDevelopment ? "opacity-50 pointer-events-none" : ""
                }`}
                onClick={() => handleToolClick(tool)}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="text-black dark:text-white p-2.5 bg-gray-100 dark:bg-gray-800 rounded-lg flex-shrink-0 ml-3">
                    {tool.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-black dark:text-white truncate">
                        {tool.name}
                      </h3>
                      {isInDevelopment && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full whitespace-nowrap">
                          Đang phát triển
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {tool.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                  {tool.enabled ? (
                    <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                      <IconCheck size={18} className="stroke-[1.5]" />
                      <span className="text-sm font-medium">Đã bật</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500">
                      <IconX size={18} className="stroke-[1.5]" />
                      <span className="text-sm font-medium">Chưa bật</span>
                    </div>
                  )}
                  <IconChevronRight
                    size={18}
                    className="text-gray-400 dark:text-gray-600"
                    stroke={1.5}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </ModalWrapper>

      {selectedTool && (
        <>
          {selectedTool.id === "email" && (
            <EmailToolModal
              isOpen={!!selectedTool}
              onClose={handleCloseDetailModal}
              onEnable={() => handleToolEnable(selectedTool.id)}
              onDisable={() => handleToolDisable(selectedTool.id)}
              isEnabled={selectedTool.enabled}
            />
          )}
          {selectedTool.id === "tvu_schedule" && (
            <TVUScheduleToolModal
              isOpen={!!selectedTool}
              onClose={handleCloseDetailModal}
              onEnable={() => handleToolEnable(selectedTool.id)}
              onDisable={() => handleToolDisable(selectedTool.id)}
              isEnabled={selectedTool.enabled}
            />
          )}
          {selectedTool.id === "anime_search" && (
            <AnimeSearchToolModal
              isOpen={!!selectedTool}
              onClose={handleCloseDetailModal}
              onEnable={() => handleToolEnable(selectedTool.id)}
              onDisable={() => handleToolDisable(selectedTool.id)}
              isEnabled={selectedTool.enabled}
            />
          )}
        </>
      )}
    </>
  );
}

// Export các công cụ đã được bật
export const getEnabledTools = () => {
  try {
    const enabledToolIds = JSON.parse(getLocalStorage("enabled_tools", "[]"));
    return defaultTools.filter((tool) => enabledToolIds.includes(tool.id));
  } catch (error) {
    console.error("Error getting enabled tools:", error);
    return [];
  }
};

export { defaultTools as tools };
