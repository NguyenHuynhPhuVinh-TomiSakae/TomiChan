/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
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

interface MarkdownProps {
  content: string;
  className?: string;
}

export default function Markdown({ content, className = "" }: MarkdownProps) {
  const { theme } = useThemeContext();
  const isDarkMode =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

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

      let codeContent = "";
      if (children) {
        if (typeof children === "string") {
          codeContent = children;
        } else if (Array.isArray(children)) {
          codeContent = children
            .map((child) =>
              typeof child === "string"
                ? child
                : child &&
                  typeof child === "object" &&
                  "props" in child &&
                  child.props?.children
                ? String(child.props.children)
                : ""
            )
            .join("");
        } else if (typeof children === "object" && children !== null) {
          const childObj = children as any;
          if ("props" in childObj && childObj.props?.children) {
            codeContent = String(childObj.props.children);
          } else {
            console.log("Không thể trích xuất nội dung code:", children);
            codeContent = JSON.stringify(children, null, 2);
          }
        }
      }

      return !inline && match ? (
        <SyntaxHighlighter
          style={isDarkMode ? oneDark : oneLight}
          language={match[1]}
          PreTag="div"
          className="rounded-lg"
        >
          {codeContent.replace(/\n$/, "")}
        </SyntaxHighlighter>
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
        {content}
      </ReactMarkdown>
    </div>
  );
}
