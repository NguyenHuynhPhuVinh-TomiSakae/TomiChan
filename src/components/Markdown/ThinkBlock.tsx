import { useState, useRef, useEffect } from "react";
import { useThemeContext } from "../../providers/ThemeProvider";
import { IconBrain, IconChevronDown } from "@tabler/icons-react";

interface ThinkBlockProps {
  children: React.ReactNode;
  id?: string;
}

// Lưu trạng thái mở/đóng của các ThinkBlock
const expandedStates: Record<string, boolean> = {};

export const ThinkBlock = ({ children, id }: ThinkBlockProps) => {
  // Tạo ID ngẫu nhiên nếu không được cung cấp
  const blockId = useRef(
    id || `think-${Math.random().toString(36).substring(2, 9)}`
  ).current;
  // Khởi tạo mở by mặc định (true) nếu chưa được lưu trạng thái
  const [isExpanded, setIsExpanded] = useState(
    expandedStates[blockId] !== undefined ? expandedStates[blockId] : true
  );
  const { theme } = useThemeContext();
  const isDarkMode =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  // Cập nhật trạng thái toàn cục khi trạng thái cục bộ thay đổi
  useEffect(() => {
    expandedStates[blockId] = isExpanded;
  }, [isExpanded, blockId]);

  return (
    <div
      className={`my-4 rounded-lg ${
        isDarkMode ? "bg-purple-900/10" : "bg-purple-50"
      }`}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <span className="text-purple-500">
            <IconBrain size={20} stroke={1.5} />
          </span>
          <span className="font-medium text-purple-600">Suy luận của AI</span>
        </div>
        <span
          className={`transform transition-transform duration-200 ${
            isExpanded ? "rotate-180" : ""
          }`}
        >
          <IconChevronDown size={20} stroke={1.5} />
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          isExpanded ? "opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-4 pt-0 italic text-gray-600">{children}</div>
      </div>
    </div>
  );
};
