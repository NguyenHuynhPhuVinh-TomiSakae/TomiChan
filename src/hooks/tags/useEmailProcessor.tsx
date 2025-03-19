import { useRef, useEffect } from "react";
import { Message } from "../../types";
import { getLocalStorage } from "@/utils/localStorage";
import emailjs from "emailjs-com";

interface EmailData {
  to: string;
  subject: string;
  content: string;
}

const extractEmailData = (messageContent: string): EmailData | null => {
  const emailRegex = /\[EMAIL\]([\s\S]*?)\[\/EMAIL\]/;
  const match = messageContent.match(emailRegex);

  if (!match) return null;

  const emailContent = match[1];
  const to = emailContent.match(/TO:\s*(.*)/)?.[1]?.trim();
  const subject = emailContent.match(/SUBJECT:\s*(.*)/)?.[1]?.trim();
  const contentMatch = emailContent.match(/CONTENT:\s*([\s\S]*?)$/);
  const emailBody = contentMatch?.[1]?.trim();

  if (!to || !subject || !emailBody) return null;

  return { to, subject, content: emailBody };
};

const sendEmail = async (emailData: EmailData) => {
  const fromEmail = getLocalStorage("tool:email:email", "");
  const appPassword = getLocalStorage("tool:email:password", "");
  const serviceId = getLocalStorage("tool:email:serviceId", "");
  const templateId = getLocalStorage("tool:email:templateId", "");
  const publicKey = getLocalStorage("tool:email:publicKey", "");

  if (!fromEmail || !appPassword || !serviceId || !templateId || !publicKey) {
    throw new Error(
      "Vui lòng cấu hình đầy đủ thông tin EmailJS trong phần cài đặt"
    );
  }

  try {
    const response = await emailjs.send(
      serviceId,
      templateId,
      {
        to_email: emailData.to,
        from_email: fromEmail,
        subject: emailData.subject,
        message: emailData.content,
        app_password: appPassword,
      },
      publicKey
    );

    if (!response || response.status !== 200) {
      throw new Error("Không thể gửi email: Lỗi kết nối với EmailJS");
    }
  } catch (error) {
    console.error("Lỗi khi gửi email:", error);
    let errorMessage = "Không thể gửi email";

    if (error instanceof Error) {
      errorMessage += ": " + (error.message || "Lỗi không xác định");
    } else if (typeof error === "object" && error !== null) {
      errorMessage += ": " + JSON.stringify(error);
    } else {
      errorMessage += ": Lỗi không xác định";
    }

    throw new Error(errorMessage);
  }
};

export function useEmailProcessor() {
  const emailDataRef = useRef<EmailData | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const processEmailTag = async (
    content: string,
    messageId: string,
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
    saveChat: (messages: Message[], chatId?: string, model?: string) => void,
    chatId?: string,
    model?: string
  ) => {
    if (content.includes("[EMAIL]") && content.includes("[/EMAIL]")) {
      const emailData = extractEmailData(content);

      if (
        emailData &&
        JSON.stringify(emailData) !== JSON.stringify(emailDataRef.current)
      ) {
        emailDataRef.current = emailData;

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(async () => {
          try {
            await sendEmail(emailData);

            setMessages((prev) => {
              const newMessages = [...prev];
              const targetIndex = newMessages.findIndex(
                (msg) => msg.id === messageId
              );

              if (targetIndex !== -1) {
                newMessages[targetIndex] = {
                  ...newMessages[targetIndex],
                  content: content + "\n\n✅ Email đã được gửi thành công!",
                };
                saveChat(newMessages, chatId, model);
              }
              return newMessages;
            });
          } catch (error) {
            setMessages((prev) => {
              const newMessages = [...prev];
              const targetIndex = newMessages.findIndex(
                (msg) => msg.id === messageId
              );

              if (targetIndex !== -1) {
                const errorMessage =
                  error instanceof Error ? error.message : "Lỗi không xác định";
                newMessages[targetIndex] = {
                  ...newMessages[targetIndex],
                  content: content + `\n\n❌ *${errorMessage}*`,
                };
                saveChat(newMessages, chatId, model);
              }
              return newMessages;
            });
          } finally {
            emailDataRef.current = null;
          }
        }, 1000);
      }
    }
  };

  return { processEmailTag };
}
