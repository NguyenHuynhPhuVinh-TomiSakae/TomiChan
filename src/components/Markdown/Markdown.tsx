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
import { useThemeContext } from "../../providers/ThemeProvider";
import {
  IconCopy,
  IconCheck,
  IconPlayerPlay,
  IconFilePlus,
  IconArrowLeft,
} from "@tabler/icons-react";
import "katex/dist/katex.min.css";
import { MathJaxContext, MathJax } from "better-react-mathjax";
import { emitter } from "../../lib/events";
import { MAGIC_EVENTS } from "../../lib/events";
import { CustomUIComponents } from "./MarkdownCustomComponents";
import { transformMarkdownContent } from "./lib/markdownTransformations";
import { CustomComponents } from "./types/markdown";

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
    "create-project",
    "update-project",
    "delete-project",
    "open-media",
    "media-view",
    "open-code",
    "code-editor",
    "file-path",
    "email-block",
    "tvu-schedule-block",
    "tvu-schedule-result",
    "tvu-score-block",
    "tvu-score-result",
  ],
};

export default function Markdown({ content, className = "" }: MarkdownProps) {
  const { theme } = useThemeContext();
  const [copied, setCopied] = useState(false);
  const isDarkMode =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const processedContent = transformMarkdownContent(content);

  const components: CustomComponents = {
    ...CustomUIComponents,

    // Giữ lại các components cơ bản
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

      const handleAcceptCode = () => {
        if (filePath && codeContent) {
          // Thay thế window.dispatchEvent bằng emitter
          emitter.emit(MAGIC_EVENTS.ACCEPT_CODE, {
            filePath: filePath,
            newContent: codeContent,
            projectId: projectId,
          });
        }
      };

      // Tìm file path từ nội dung gốc trước code block
      let filePath = "";
      let projectId: string | undefined = undefined;
      if (node?.position?.start?.offset) {
        // Lấy nội dung từ đầu đến vị trí bắt đầu của code block
        const previousText = content.substring(0, node.position.start.offset);

        // Tìm thẻ PATH cuối cùng trước code block
        const pathMatches = [
          ...previousText.matchAll(/\[PATH\](.*?)\[\/PATH\]/g),
        ];
        if (pathMatches.length > 0) {
          // Lấy thẻ PATH cuối cùng
          const lastPathMatch = pathMatches[pathMatches.length - 1];
          const pathContent = lastPathMatch[1].trim();

          // Kiểm tra xem có định dạng path|projectId không
          const pathParts = pathContent.split("|");
          filePath = pathParts[0].trim();

          // Nếu có projectId
          if (pathParts.length > 1) {
            projectId = pathParts[1].trim();
          }
        }
      }

      if (!inline && match) {
        const language = match[1];

        return (
          <div className="max-w-full border rounded-lg my-4 overflow-hidden">
            {filePath && (
              <div className="px-4 py-2 border-b border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-mono text-sm flex items-center">
                <IconFilePlus className="mr-2" size={16} />
                {filePath}
              </div>
            )}
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
            {/* Footer: Nút chấp nhận, sao chép và chạy code */}
            <div
              className="flex justify-between items-center gap-2 px-4 py-2 border-t"
              style={{ background: isDarkMode ? "#282c34" : "#f8f9fa" }}
            >
              <div className="flex items-center gap-2">
                {filePath && (
                  <button
                    onClick={handleAcceptCode}
                    className={`p-2 rounded-md transition-colors cursor-pointer flex items-center ${
                      isDarkMode
                        ? "bg-green-700 hover:bg-green-600 text-white"
                        : "bg-green-100 hover:bg-green-200 text-green-700"
                    }`}
                    aria-label="Chấp nhận"
                  >
                    <IconArrowLeft size={18} className="mr-1" />
                    <span className="text-sm">Chấp nhận</span>
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
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
                        className={
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }
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
