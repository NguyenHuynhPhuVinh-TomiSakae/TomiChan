/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import ModalWrapper from "@/components/ProviderSettings/ModalWrapper";
import {
  IconMail,
  IconCalendar,
  IconMovie,
  IconToggleRight,
  IconToggleLeft,
} from "@tabler/icons-react";
import { getLocalStorage, setLocalStorage } from "@/utils/localStorage";

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

  const handleToggleTool = (toolId: string) => {
    const updatedTools = tools.map((tool) =>
      tool.id === toolId ? { ...tool, enabled: !tool.enabled } : tool
    );
    setTools(updatedTools);

    // Lưu danh sách ID của các tool đã bật
    const enabledToolIds = updatedTools
      .filter((tool) => tool.enabled)
      .map((tool) => tool.id);
    setLocalStorage("enabled_tools", JSON.stringify(enabledToolIds));
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Chọn công cụ"
      maxWidth="md"
    >
      <div className="grid grid-cols-1 gap-4">
        {tools.map((tool) => (
          <div
            key={tool.id}
            className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-black dark:text-white">{tool.icon}</div>
                <div>
                  <h3 className="font-medium text-black dark:text-white">
                    {tool.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {tool.description}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleToggleTool(tool.id)}
                className="relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:ring-offset-black"
                style={{
                  backgroundColor: tool.enabled
                    ? "rgb(59 130 246)"
                    : "rgb(229 231 235)",
                }}
              >
                <span
                  className={`pointer-events-none relative inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    tool.enabled ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ModalWrapper>
  );
}

// Sửa lại hàm getEnabledTools
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
