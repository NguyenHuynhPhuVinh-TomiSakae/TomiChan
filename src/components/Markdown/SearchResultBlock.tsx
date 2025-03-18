/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useRef, useEffect } from "react";
import { useThemeContext } from "../../providers/ThemeProvider";
import {
  IconSearch,
  IconChevronDown,
  IconExternalLink,
  IconWorld,
} from "@tabler/icons-react";
import Image from "next/image";

interface SearchResultBlockProps {
  children: React.ReactNode;
  id?: string;
}

const expandedStates: Record<string, boolean> = {};

export const SearchResultBlock = ({ children, id }: SearchResultBlockProps) => {
  const blockId = useRef(
    id || `search-${Math.random().toString(36).substring(2, 9)}`
  ).current;

  const [isExpanded, setIsExpanded] = useState(
    expandedStates[blockId] !== undefined ? expandedStates[blockId] : true
  );

  const { theme } = useThemeContext();
  const isDarkMode =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  useEffect(() => {
    expandedStates[blockId] = isExpanded;
  }, [isExpanded, blockId]);

  return (
    <div
      className={`my-4 rounded-lg ${
        isDarkMode ? "bg-blue-900/10" : "bg-blue-50"
      }`}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <span className="text-blue-500">
            <IconSearch size={20} stroke={1.5} />
          </span>
          <span className="font-medium text-blue-600">Kết quả tìm kiếm</span>
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
        <div className="p-4 pt-0">{children}</div>
      </div>
    </div>
  );
};

// Hàm lấy favicon từ domain
const getFaviconUrl = (url: string) => {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return null;
  }
};

export const SearchLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => {
  const { theme } = useThemeContext();
  const isDarkMode =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  const faviconUrl = getFaviconUrl(href);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 ${
        isDarkMode ? "text-blue-400" : "text-blue-600"
      } hover:underline`}
    >
      {faviconUrl ? (
        <Image
          src={faviconUrl}
          alt="site icon"
          className="w-4 h-4"
          width={16}
          height={16}
          onError={(e) => {
            // Nếu không load được favicon, hiển thị icon mặc định
            e.currentTarget.onerror = null;
            e.currentTarget.style.display = "none";
            const icon = document.createElement("span");
            icon.innerHTML = "<IconWorld size={16} />";
            e.currentTarget.parentNode?.insertBefore(icon, e.currentTarget);
          }}
        />
      ) : (
        <IconWorld size={16} />
      )}
      {children}
      <IconExternalLink size={16} />
    </a>
  );
};

interface SearchLinkBlockProps {
  content: string;
}

export const SearchLinkBlock = ({ content }: SearchLinkBlockProps) => {
  const { theme } = useThemeContext();
  const isDarkMode =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  // Xử lý nội dung để tách các link
  const links: string[] = [];

  // Tách nội dung thành các dòng
  const lines = content.split("\n");

  // Lọc và lấy các link
  lines.forEach((line) => {
    const match = line.match(/\[\d+\]\s*(https?:\/\/[^\s]+)/);
    if (match) {
      const [_, url] = match;
      links.push(url.trim());
    }
  });

  // Chỉ hiển thị block nếu có links
  if (links.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-blue-500">
          <IconWorld size={20} stroke={1.5} />
        </span>
        <span className="font-medium text-blue-600">Danh mục Web</span>
      </div>
      <div className="space-y-2">
        {links.map((link, index) => (
          <div key={index} className="flex">
            <div
              className={`inline-block rounded-lg ${
                isDarkMode ? "bg-blue-900/10" : "bg-blue-50"
              }`}
            >
              <div className="px-3 py-2">
                <SearchLink href={link}>{link}</SearchLink>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Thêm component SearchingBlock
export const SearchingBlock = () => {
  const { theme } = useThemeContext();
  const isDarkMode =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <div
      className={`my-4 rounded-lg ${
        isDarkMode ? "bg-blue-900/10" : "bg-blue-50"
      }`}
    >
      <div className="p-4 flex items-center gap-3">
        <span className="text-blue-500">
          <IconWorld size={20} stroke={1.5} className="animate-spin" />
        </span>
        <span className="font-medium text-blue-600 flex items-center">
          Đang tìm kiếm
          <span className="ml-1 flex">
            <span className="animate-bounce">.</span>
            <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>
              .
            </span>
            <span className="animate-bounce" style={{ animationDelay: "0.4s" }}>
              .
            </span>
          </span>
        </span>
      </div>
    </div>
  );
};
