/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { JSX, useState } from "react";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import Image from "next/image";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneLight,
  oneDark,
} from "react-syntax-highlighter/dist/cjs/styles/prism";
import { useThemeContext } from "../providers/ThemeProvider";
import { ThinkBlock } from "./ThinkBlock";
import {
  IconCopy,
  IconCheck,
  IconPlayerPlay,
  IconExternalLink,
  IconWand,
  IconFilePlus,
  IconFolderPlus,
  IconArrowLeft,
} from "@tabler/icons-react";
import "katex/dist/katex.min.css";
import { MathJaxContext, MathJax } from "better-react-mathjax";
import { SearchResultBlock } from "./SearchResultBlock";
import { SearchLinkBlock } from "./SearchResultBlock";
import { SearchingBlock } from "./SearchResultBlock";

interface MarkdownProps {
  content: string;
  className?: string;
}

// Mở rộng schema để cho phép cả tag think và search-result
const customSchema = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames || []),
    "think",
    "search-result",
    "search-link",
    "search-block",
    "magic-mode",
    "code-manager",
    "create-file",
    "create-folder",
    "rename-file",
    "rename-folder",
    "delete-file",
    "delete-folder",
    "open-media",
    "media-view",
    "open-code",
  ],
};

// Mở rộng interface cho components
interface CustomComponents extends Components {
  think: ({
    node,
    children,
  }: {
    node: any;
    children: React.ReactNode;
  }) => JSX.Element;
  "search-result": ({
    node,
    children,
  }: {
    node: any;
    children: React.ReactNode;
  }) => JSX.Element;
  math: ({ value }: { value: string }) => JSX.Element;
  inlineMath: ({ value }: { value: string }) => JSX.Element;
  "search-link": ({
    node,
    children,
  }: {
    node: any;
    children: React.ReactNode;
  }) => JSX.Element;
  "search-block": ({
    node,
    children,
  }: {
    node: any;
    children: React.ReactNode;
  }) => JSX.Element;
  "magic-mode": ({
    node,
    children,
  }: {
    node: any;
    children: React.ReactNode;
  }) => JSX.Element | null;
  "code-manager": ({
    node,
    children,
  }: {
    node: any;
    children: React.ReactNode;
  }) => JSX.Element | null;
  "create-file": ({ children }: { children: React.ReactNode }) => JSX.Element;
  "create-folder": ({ children }: { children: React.ReactNode }) => JSX.Element;
  "rename-file": ({
    node,
    children,
  }: {
    node: any;
    children: React.ReactNode;
  }) => JSX.Element;
  "rename-folder": ({
    node,
    children,
  }: {
    node: any;
    children: React.ReactNode;
  }) => JSX.Element;
  "delete-file": ({
    node,
    children,
  }: {
    node: any;
    children: React.ReactNode;
  }) => JSX.Element;
  "delete-folder": ({
    node,
    children,
  }: {
    node: any;
    children: React.ReactNode;
  }) => JSX.Element;
  "open-media": ({
    node,
    children,
  }: {
    node: any;
    children: React.ReactNode;
  }) => JSX.Element;
  "media-view": ({
    node,
    children,
  }: {
    node: any;
    children: React.ReactNode;
  }) => JSX.Element;
  "open-code": ({
    node,
    children,
  }: {
    node: any;
    children: React.ReactNode;
  }) => JSX.Element;
}

export default function Markdown({ content, className = "" }: MarkdownProps) {
  const { theme } = useThemeContext();
  const [copied, setCopied] = useState(false);
  const isDarkMode =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  // Tiền xử lý content để chuyển đổi cả [SEARCH_RESULT] và [SEARCH_LINK] thành thẻ HTML
  const processedContent = content
    .replace(
      /\[SEARCH_RESULT\]([\s\S]*?)\[\/SEARCH_RESULT\]/g,
      (_, p1) => `<search-result>${p1}</search-result>`
    )
    .replace(
      /\[SEARCH_LINK\]([\s\S]*?)\[\/SEARCH_LINK\]/g,
      (_, p1) => `<search-link>${p1}</search-link>`
    )
    .replace(
      /\[SEARCH_BLOCK\]([\s\S]*?)\[\/SEARCH_BLOCK\]/g,
      (_, p1) => `<search-block>${p1}</search-block>`
    )
    .replace(
      /\[MagicMode\]([\s\S]*?)\[\/MagicMode\]/g,
      (_, p1) => `<magic-mode>${p1}</magic-mode>`
    )
    .replace(
      /\[CodeManager\]([\s\S]*?)\[\/CodeManager\]/g,
      (_, p1) => `<code-manager>${p1}</code-manager>`
    )
    .replace(
      /\[CreateFile\]([\s\S]*?)\[\/CreateFile\]/g,
      (_, p1) => `<create-file>${p1}</create-file>`
    )
    .replace(
      /\[CreateFolder\]([\s\S]*?)\[\/CreateFolder\]/g,
      (_, p1) => `<create-folder>${p1}</create-folder>`
    )
    .replace(
      /\[RenameFile\]([\s\S]*?)\[\/RenameFile\]/g,
      (_, p1) => `<rename-file>${p1}</rename-file>`
    )
    .replace(
      /\[RenameFolder\]([\s\S]*?)\[\/RenameFolder\]/g,
      (_, p1) => `<rename-folder>${p1}</rename-folder>`
    )
    .replace(
      /\[DeleteFile\]([\s\S]*?)\[\/DeleteFile\]/g,
      (_, p1) => `<delete-file>${p1}</delete-file>`
    )
    .replace(
      /\[DeleteFolder\]([\s\S]*?)\[\/DeleteFolder\]/g,
      (_, p1) => `<delete-folder>${p1}</delete-folder>`
    )
    .replace(
      /\[OpenMedia\]([\s\S]*?)\[\/OpenMedia\]/g,
      (_, p1) => `<open-media>${p1}</open-media>`
    )
    .replace(
      /\[MediaView\]([\s\S]*?)\[\/MediaView\]/g,
      (_, p1) => `<media-view>${p1}</media-view>`
    )
    .replace(
      /\[OpenCode\]([\s\S]*?)\[\/OpenCode\]/g,
      (_, p1) => `<open-code>${p1}</open-code>`
    );

  const components: CustomComponents = {
    "search-result": ({ children }) => {
      return <SearchResultBlock>{children}</SearchResultBlock>;
    },

    "search-link": ({ children }) => {
      return <SearchLinkBlock content={children?.toString() || ""} />;
    },

    "search-block": () => {
      return <SearchingBlock />;
    },

    "magic-mode": ({ children }) => {
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

    "code-manager": ({ children }) => {
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

    "create-file": ({ children }) => {
      const content = children?.toString() || "";
      return (
        <div className="my-4 p-4 rounded-lg border-2 border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
          <div className="flex items-center gap-2 mb-2">
            <IconFilePlus className="text-blue-500" size={20} />
            <span className="font-semibold bg-gradient-to-r from-blue-400 via-cyan-500 to-blue-500 text-transparent bg-clip-text">
              Tạo File Mới
            </span>
          </div>
          <pre className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
            {content}
          </pre>
        </div>
      );
    },

    "create-folder": ({ children }) => {
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

    "rename-file": ({ children }) => {
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

    "rename-folder": ({ children }) => {
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

    "delete-file": ({ children }) => {
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

    "delete-folder": ({ children }) => {
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

    "open-media": ({ children }) => {
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

    "open-code": ({ children }) => {
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

    "media-view": ({ children }) => {
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

    think: ({ children }) => {
      return <ThinkBlock>{children}</ThinkBlock>;
    },

    code({
      node,
      inline,
      className,
      children,
      ...props
    }: {
      node?: any;
      inline?: boolean;
      className?: string;
      children?: React.ReactNode;
    }) {
      const match = /language-(\w+)/.exec(className || "");

      const getStringContent = (child: any): string => {
        if (typeof child === "string") return child;
        if (!child) return "";
        if (typeof child === "object") {
          if (child.props?.children) {
            if (Array.isArray(child.props.children)) {
              return child.props.children.map(getStringContent).join("");
            }
            return getStringContent(child.props.children);
          }
          if ("type" in child && "value" in child) {
            return child.value;
          }
        }
        return "";
      };

      const codeContent = Array.isArray(children)
        ? children.map(getStringContent).join("")
        : getStringContent(children);

      const handleCopy = () => {
        navigator.clipboard.writeText(codeContent.replace(/\n$/, ""));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      };

      const handleRunCode = () => {
        const newWindow = window.open("", "_blank");
        if (newWindow) {
          newWindow.document.write(codeContent);
          newWindow.document.close();
        }
      };

      if (!inline && match) {
        const language = match[1];

        return (
          <div className="max-w-full border rounded-lg overflow-hidden">
            {/* Header: Hiển thị tên ngôn ngữ */}
            <div
              className={`px-4 py-2 text-sm font-medium ${
                isDarkMode
                  ? "bg-gray-700 text-gray-200"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {language.toUpperCase()}
            </div>
            <div className="overflow-x-auto" style={{ width: "100%" }}>
              <SyntaxHighlighter
                style={isDarkMode ? oneDark : oneLight}
                language={language}
                PreTag="div"
                className="rounded-none"
                wrapLongLines={false}
                customStyle={{
                  margin: 0,
                  padding: "1rem",
                  background: isDarkMode ? "#282c34" : "#f8f9fa",
                  width: "100%",
                  minWidth: "fit-content",
                }}
              >
                {codeContent.replace(/\n$/, "")}
              </SyntaxHighlighter>
            </div>
            {/* Footer: Nút sao chép và chạy code */}
            <div
              className="flex justify-end items-center gap-2 px-4 py-2 border-t"
              style={{ background: isDarkMode ? "#282c34" : "#f8f9fa" }}
            >
              {language.toLowerCase() === "html" && (
                <button
                  onClick={handleRunCode}
                  className={`p-2 rounded-md transition-colors cursor-pointer ${
                    isDarkMode
                      ? "bg-gray-700 hover:bg-gray-600"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                  aria-label="Run code"
                >
                  <div className="flex items-center">
                    <IconPlayerPlay
                      size={18}
                      className={isDarkMode ? "text-gray-300" : "text-gray-700"}
                    />
                    <span className="ml-1 text-sm">Chạy</span>
                  </div>
                </button>
              )}
              <button
                onClick={handleCopy}
                className={`p-2 rounded-md transition-colors cursor-pointer ${
                  isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
                aria-label="Copy code"
              >
                {copied ? (
                  <div className="flex items-center">
                    <IconCheck
                      size={18}
                      className={
                        isDarkMode ? "text-green-400" : "text-green-600"
                      }
                    />
                    <span className="ml-1 text-sm">Đã sao chép!</span>
                  </div>
                ) : (
                  <IconCopy
                    size={18}
                    className={isDarkMode ? "text-gray-300" : "text-gray-700"}
                  />
                )}
              </button>
            </div>
          </div>
        );
      }

      // Trường hợp inline code hoặc không có language
      return (
        <code
          className={`${
            isDarkMode
              ? "bg-gray-800 text-gray-200"
              : "bg-gray-100 text-gray-800"
          } px-1 py-0.5 rounded`}
          {...props}
        >
          {children}
        </code>
      );
    },

    h1: ({ children }) => (
      <h1 className="text-3xl font-bold mb-4 mt-6">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-2xl font-bold mb-3 mt-5">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl font-bold mb-2 mt-4">{children}</h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-lg font-bold mb-2 mt-3">{children}</h4>
    ),
    h5: ({ children }) => (
      <h5 className="text-base font-bold mb-2 mt-2">{children}</h5>
    ),
    h6: ({ children }) => (
      <h6 className="text-sm font-bold mb-2 mt-1">{children}</h6>
    ),

    table: ({ children }) => (
      <div className="overflow-x-auto my-4">
        <table
          className={`min-w-full border-collapse border ${
            isDarkMode ? "border-gray-700" : "border-gray-300"
          }`}
        >
          {children}
        </table>
      </div>
    ),
    th: ({ children }) => (
      <th
        className={`border px-4 py-2 ${
          isDarkMode
            ? "border-gray-700 bg-gray-800"
            : "border-gray-300 bg-gray-100"
        }`}
      >
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td
        className={`border px-4 py-2 ${
          isDarkMode ? "border-gray-700" : "border-gray-300"
        }`}
      >
        {children}
      </td>
    ),

    blockquote: ({ children }) => (
      <blockquote
        className={`border-l-4 pl-4 my-4 italic ${
          isDarkMode ? "border-gray-700" : "border-gray-300"
        }`}
      >
        {children}
      </blockquote>
    ),

    ul: ({ children }) => (
      <ul className="list-disc ml-4 my-2 space-y-1">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal ml-4 my-2 space-y-1">{children}</ol>
    ),

    a: ({ href, children }) => (
      <a
        href={href}
        className={`${
          isDarkMode ? "text-blue-400" : "text-blue-600"
        } hover:underline`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),

    img: ({ src, alt }) => {
      if (!src) return null;

      return (
        <div className="relative w-full h-[400px] my-4">
          <Image
            src={src}
            alt={alt || ""}
            fill
            className="object-contain rounded-lg"
            loading="lazy"
          />
        </div>
      );
    },

    p: ({ children }) => {
      // Xử lý các paragraph thông thường
      const processedContent = React.Children.toArray(children).map((child) => {
        if (typeof child === "string") {
          return child
            .replace(/\[SYSTEM\].*?\[\/SYSTEM\]/g, "")
            .replace(/\[SEARCH_QUERY\].*?\[\/SEARCH_QUERY\]/g, "")
            .replace(/\[IMAGE_PROMPT\].*?\[\/IMAGE_PROMPT\]/g, "");
        }
        return child;
      });

      if (processedContent.every((item) => item === "")) {
        return null;
      }

      return <p className="my-2">{processedContent}</p>;
    },

    math: ({ value }) => (
      <MathJax>
        <div className="flex justify-center my-4">
          <div
            className={`${
              isDarkMode ? "text-gray-100" : "text-gray-900"
            } text-lg`}
          >
            {"\\[" + value + "\\]"}
          </div>
        </div>
      </MathJax>
    ),

    inlineMath: ({ value }) => (
      <MathJax>
        <span className={`${isDarkMode ? "text-gray-100" : "text-gray-900"}`}>
          {"\\(" + value + "\\)"}
        </span>
      </MathJax>
    ),
  };

  return (
    <MathJaxContext>
      <div
        className={`prose ${
          isDarkMode ? "prose-invert" : ""
        } max-w-none ${className}`}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[
            rehypeRaw,
            [rehypeSanitize, customSchema],
            rehypeHighlight,
            [rehypeKatex, { output: "html" }],
          ]}
          components={components}
        >
          {processedContent}
        </ReactMarkdown>
      </div>
    </MathJaxContext>
  );
}
