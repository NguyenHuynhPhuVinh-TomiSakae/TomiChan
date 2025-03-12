/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import { Components } from "react-markdown";
import Image from "next/image";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneLight,
  oneDark,
} from "react-syntax-highlighter/dist/cjs/styles/prism";
import { useThemeContext } from "../providers/ThemeProvider";
import { ThinkBlock } from "./ThinkBlock";
import { IconCopy, IconCheck } from "@tabler/icons-react";

interface MarkdownProps {
  content: string;
  className?: string;
}

export default function Markdown({ content, className = "" }: MarkdownProps) {
  const { theme } = useThemeContext();
  const [copied, setCopied] = useState(false);
  const isDarkMode =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  // Sửa lại cách xử lý thẻ think
  const processedContent = content.replace(
    /<think>([\s\S]*?)<\/think>/g,
    (_, thinkContent) => {
      // Thêm marker đặc biệt để nhận dạng nội dung think
      return `:::think\n${thinkContent.trim()}\n:::`;
    }
  );

  const components: Components = {
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

        // Xử lý đặc biệt cho các phần tử HTML
        if (typeof child === "object") {
          if (child.props?.children) {
            if (Array.isArray(child.props.children)) {
              return child.props.children.map(getStringContent).join("");
            }
            return getStringContent(child.props.children);
          }
          // Xử lý trường hợp object có type và value
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

      return !inline && match ? (
        <div className="relative max-w-full">
          <div
            className="overflow-x-auto"
            style={{
              maxWidth: "100%",
              width: "100%",
            }}
          >
            <div className="absolute top-2 right-2">
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
            <SyntaxHighlighter
              style={isDarkMode ? oneDark : oneLight}
              language={match[1]}
              PreTag="div"
              className="rounded-lg"
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
        </div>
      ) : (
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

    p: ({ children, node }) => {
      // Kiểm tra xem đoạn văn có nằm giữa :::think và ::: không
      const currentLineNumber = node?.position?.start?.line;
      const lines = processedContent.split("\n");
      let isThinkContent = false;
      let thinkContents: React.ReactNode[] = [];
      let startLine = -1;

      if (currentLineNumber) {
        // Tìm marker :::think gần nhất phía trước
        let searchIndex = currentLineNumber - 1;
        while (searchIndex >= 0) {
          const line = lines[searchIndex]?.trim();
          if (line === ":::") break;
          if (line === ":::think") {
            isThinkContent = true;
            startLine = searchIndex;
            break;
          }
          searchIndex--;
        }
      }

      // Nếu đây là dòng đầu tiên của think block, gom tất cả nội dung
      if (isThinkContent && currentLineNumber === startLine + 1) {
        let endLine = currentLineNumber;
        while (endLine < lines.length && lines[endLine]?.trim() !== ":::") {
          endLine++;
        }

        const thinkContent = lines.slice(currentLineNumber, endLine).join("\n");

        // Tạo ID duy nhất dựa trên nội dung
        const thinkId = `think-${Buffer.from(
          thinkContent.substring(0, 50)
        ).toString("base64")}`;

        return <ThinkBlock id={thinkId}>{thinkContent}</ThinkBlock>;
      } else if (isThinkContent) {
        return null;
      }

      return <p className="my-2">{children}</p>;
    },
  };

  return (
    <div
      className={`prose ${
        isDarkMode ? "prose-invert" : ""
      } max-w-none ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[
          rehypeRaw,
          rehypeSanitize,
          rehypeHighlight,
          rehypeKatex,
        ]}
        components={components}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}
