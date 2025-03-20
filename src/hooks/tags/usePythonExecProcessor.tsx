/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useEffect } from "react";
import { Message } from "../../types";
import { getApiKey } from "@/utils/getApiKey";

interface PythonExecData {
  code: string;
}

const extractPythonCode = (messageContent: string): PythonExecData | null => {
  const codeRegex = /\[python_exec\]([\s\S]*?)\[\/python_exec\]/;
  const match = messageContent.match(codeRegex);

  if (!match) return null;
  return {
    code: match[1].trim(),
  };
};

const executePythonCode = async (
  code: string
): Promise<{
  output?: string;
  error?: string;
  images?: string[];
}> => {
  try {
    const e2bApiKey = await getApiKey("e2b", "e2b_api_key");
    const response = await fetch("/api/code", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-E2B-API-Key": e2bApiKey,
      },
      body: JSON.stringify({
        code,
        language: "python",
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      output: data.output,
      error: data.error,
      images: data.images,
    };
  } catch (error) {
    console.error("Lỗi khi gọi API thực thi Python:", error);
    throw error;
  }
};

const createResultBlock = (
  output: string,
  error?: string,
  images?: string[]
): string => {
  if (error) {
    return `[python_result]\n❌ Lỗi:\n${error}\n[/python_result]`;
  }

  let result = `[python_result]`;
  // Thêm output nếu có
  if (output) {
    result += `\n${output}`;
  }
  // Thêm images dưới dạng JSON string để UI có thể parse
  if (images && images.length > 0) {
    result += `\n[python_images]${JSON.stringify(images)}[/python_images]`;
  }
  result += "\n[/python_result]";
  return result;
};

export function usePythonExecProcessor() {
  const pythonCodeRef = useRef<PythonExecData | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const processPythonExecTag = async (
    content: string,
    messageId: string,
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
    saveChat: (messages: Message[], chatId?: string, model?: string) => void,
    chatId?: string,
    model?: string
  ) => {
    if (
      content.includes("[python_exec]") &&
      content.includes("[/python_exec]")
    ) {
      const execData = extractPythonCode(content);
      console.log("Phát hiện mã Python cần thực thi:", execData);

      if (
        execData &&
        JSON.stringify(execData) !== JSON.stringify(pythonCodeRef.current)
      ) {
        pythonCodeRef.current = execData;

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(async () => {
          try {
            console.log("Bắt đầu thực thi mã Python...");

            const { output, error, images } = await executePythonCode(
              execData.code
            );

            // Tạo khối kết quả với output và images
            const resultBlock = createResultBlock(output || "", error, images);

            // Cập nhật tin nhắn với kết quả
            setMessages((prev) => {
              const newMessages = [...prev];
              const targetIndex = newMessages.findIndex(
                (msg) => msg.id === messageId
              );

              if (targetIndex !== -1) {
                const message = newMessages[targetIndex];
                const execTagRegex =
                  /\[python_exec\]([\s\S]*?)\[\/python_exec\]/;
                const execMatch = message.content.match(execTagRegex);

                if (execMatch) {
                  const tagPosition = message.content.indexOf(execMatch[0]);
                  const thinkMatch = /<think>([\s\S]*?)<\/think>/.exec(
                    message.content
                  );

                  // Kiểm tra xem tag có nằm trong think không
                  if (thinkMatch) {
                    const thinkStart = message.content.indexOf(thinkMatch[0]);
                    const thinkEnd = thinkStart + thinkMatch[0].length;

                    // Nếu tag nằm trong think thì bỏ qua
                    if (tagPosition > thinkStart && tagPosition < thinkEnd) {
                      return newMessages;
                    }
                  }

                  // Nếu tag không nằm trong think, xử lý bình thường
                  const beforeTag = message.content.slice(0, tagPosition);
                  const afterTag = message.content.slice(
                    tagPosition + execMatch[0].length
                  );

                  newMessages[targetIndex] = {
                    ...message,
                    content: beforeTag + resultBlock + afterTag,
                  };
                  saveChat(newMessages, chatId, model);
                }
              }
              return newMessages;
            });
          } catch (error) {
            console.error("Lỗi trong quá trình thực thi:", error);
            const errorMessage =
              error instanceof Error ? error.message : "Lỗi không xác định";

            setMessages((prev) => {
              const newMessages = [...prev];
              const targetIndex = newMessages.findIndex(
                (msg) => msg.id === messageId
              );

              if (targetIndex !== -1) {
                newMessages[targetIndex] = {
                  ...newMessages[targetIndex],
                  content: content + createResultBlock("", errorMessage),
                };
                saveChat(newMessages, chatId, model);
              }
              return newMessages;
            });
          } finally {
            pythonCodeRef.current = null;
            console.log("Hoàn thành quá trình thực thi");
          }
        }, 1000);
      }
    }
  };

  return { processPythonExecTag };
}
