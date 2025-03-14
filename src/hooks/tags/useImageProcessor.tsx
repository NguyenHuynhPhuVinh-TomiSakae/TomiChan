import { useRef, useEffect } from "react";
import { Message } from "../../types";
import { generateImage, extractImagePrompt } from "../../lib/together";

export function useImageProcessor() {
  const imagePromptRef = useRef<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const processImageTag = (
    content: string,
    messageId: string,
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
    saveChat: (messages: Message[], chatId?: string, model?: string) => void,
    chatId?: string,
    model?: string,
    setIsGeneratingImage?: React.Dispatch<React.SetStateAction<boolean>>,
    messageIndex?: number
  ) => {
    // Xử lý IMAGE_PROMPT
    if (
      content.includes("[IMAGE_PROMPT]") &&
      content.includes("[/IMAGE_PROMPT]")
    ) {
      const imagePrompt = extractImagePrompt(content);
      if (imagePrompt && imagePrompt !== imagePromptRef.current) {
        imagePromptRef.current = imagePrompt;
        setIsGeneratingImage?.(true);

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          generateImage(imagePrompt)
            .then((imageBase64) => {
              setMessages((prev) => {
                const newMessages = [...prev];
                const targetIndex =
                  messageIndex !== undefined
                    ? messageIndex
                    : newMessages.findIndex((msg) => msg.id === messageId);

                if (targetIndex !== -1) {
                  newMessages[targetIndex] = {
                    ...newMessages[targetIndex],
                    images: [
                      {
                        url: "generated-image.png",
                        data: `data:image/png;base64,${imageBase64}`,
                      },
                    ],
                  };
                  saveChat(newMessages, chatId, model);
                }
                return newMessages;
              });
            })
            .catch((error) => {
              // Bỏ qua nếu là lỗi Too Many Requests
              if (
                error instanceof Error &&
                (error.message.includes("429") ||
                  error.message.includes("Too Many Requests"))
              ) {
                return;
              }

              setMessages((prev) => {
                const newMessages = [...prev];
                const targetIndex =
                  messageIndex !== undefined
                    ? messageIndex
                    : newMessages.findIndex((msg) => msg.id === messageId);

                if (targetIndex !== -1) {
                  const errorMessage =
                    error instanceof Error
                      ? error.message
                      : "Lỗi không xác định khi tạo ảnh";

                  newMessages[targetIndex] = {
                    ...newMessages[targetIndex],
                    content: content + `\n\n*Lỗi: ${errorMessage}*`,
                    images: undefined,
                  };
                  saveChat(newMessages, chatId, model);
                }
                return newMessages;
              });
            })
            .finally(() => {
              setIsGeneratingImage?.(false);
              imagePromptRef.current = null;
            });
        }, 1000);
      }
    }
  };

  return { processImageTag };
}
