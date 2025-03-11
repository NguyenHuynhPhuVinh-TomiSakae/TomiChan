import { useState } from "react";
import { useThemeContext } from "../providers/ThemeProvider";
import { IconBrain, IconChevronDown } from "@tabler/icons-react";

interface ThinkBlockProps {
  children: React.ReactNode;
}

export const ThinkBlock = ({ children }: ThinkBlockProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { theme } = useThemeContext();
  const isDarkMode =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

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
          isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-4 pt-0 italic text-gray-600">{children}</div>
      </div>
    </div>
  );
};
