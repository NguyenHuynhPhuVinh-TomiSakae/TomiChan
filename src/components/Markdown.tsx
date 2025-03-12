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
import { IconCopy, IconCheck } from "@tabler/icons-react";

interface MarkdownProps {
  content: string;
  className?: string;
}

// Mở rộng schema để cho phép tag <think> không bị loại bỏ
const customSchema = {
  ...defaultSchema,
  // Cho phép các tag đã có và thêm tag "think"
  tagNames: [...(defaultSchema.tagNames || []), "think"],
};

// Định nghĩa interface mở rộng cho ReactMarkdown components để xử lý tag <think>
interface CustomComponents extends Components {
  think: ({
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

  // Không thực hiện thay thế <think>...</think> nữa, truyền content trực tiếp.
  // VN: Nội dung bao gồm thẻ <think>... sẽ được xử lý bởi rehypeRaw ở bước sau

  const components: CustomComponents = {
    // Mapping tag "think" thành component ThinkBlock
    think: ({ node, children }) => {
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

    p: ({ children }) => <p className="my-2">{children}</p>,
  };

  return (
    <div
      className={`prose ${
        isDarkMode ? "prose-invert" : ""
      } max-w-none ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        // Cho phép raw HTML (rehypeRaw) và sử dụng customSchema chứa tag think
        rehypePlugins={[
          rehypeRaw,
          [rehypeSanitize, customSchema],
          rehypeHighlight,
          rehypeKatex,
        ]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
