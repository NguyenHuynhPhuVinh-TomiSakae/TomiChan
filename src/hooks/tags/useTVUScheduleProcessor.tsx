/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useEffect } from "react";
import { Message } from "../../types";
import { getLocalStorage } from "@/utils/localStorage";
import axios from "axios";

interface TVUScheduleData {
  action: string;
  date?: string;
}

// Trích xuất thông tin TVU_SCHEDULE tag từ nội dung tin nhắn
const extractTVUScheduleData = (
  messageContent: string
): TVUScheduleData | null => {
  const scheduleRegex = /\[TVU_SCHEDULE\]([\s\S]*?)\[\/TVU_SCHEDULE\]/;
  const match = messageContent.match(scheduleRegex);

  if (!match) {
    return null;
  }

  const scheduleContent = match[1];
  const action = scheduleContent.match(/ACTION:\s*(.*)/)?.[1]?.trim();
  const date = scheduleContent.match(/DATE:\s*(.*)/)?.[1]?.trim();

  if (!action) {
    return null;
  }

  return { action, date };
};

// Cập nhật lại hàm getScheduleFromAPI
const getScheduleFromAPI = async (
  studentId: string,
  password: string,
  date: string
): Promise<string> => {
  try {
    const response = await axios.post("/api/tvu/schedule", {
      studentId,
      password,
      date,
    });

    // Xử lý response từ API local
    if (response.data?.subjects) {
      if (response.data.subjects.length === 0) {
        return `Không có lịch học vào ngày ${date}.`;
      }

      return response.data.subjects
        .map(
          (subject: any) =>
            `📚 ${subject.tenMon}\n👨‍🏫 GV: ${subject.giangVien}\n🏢 Phòng: ${subject.phong}\n⏰ Tiết ${subject.tietBatDau}-${subject.soTiet}`
        )
        .join("\n\n");
    }

    // Xử lý các loại lỗi từ API local
    const errorMessage = response.data?.error || "Lỗi không xác định";
    throw new Error(errorMessage);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || error.message);
    }
    throw new Error("Không thể kết nối đến hệ thống TVU");
  }
};

// Sửa hàm formatDate để đảm bảo đúng múi giờ Việt Nam
const formatDate = (date: Date): string => {
  // Tính toán chênh lệch giữa múi giờ hiện tại và UTC+7
  const localOffset = date.getTimezoneOffset() * 60000; // Đổi sang milliseconds
  const utc = date.getTime() + localOffset;
  const vietnamTime = new Date(utc + 7 * 60 * 60 * 1000); // UTC+7

  // Định dạng ngày tháng năm theo chuẩn YYYY-MM-DD
  const year = vietnamTime.getFullYear();
  const month = String(vietnamTime.getMonth() + 1).padStart(2, "0");
  const day = String(vietnamTime.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function useTVUScheduleProcessor() {
  const scheduleDataRef = useRef<TVUScheduleData | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const processTVUScheduleTag = async (
    content: string,
    messageId: string,
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
    saveChat: (messages: Message[], chatId?: string, model?: string) => void,
    chatId?: string,
    model?: string
  ) => {
    if (
      content.includes("[TVU_SCHEDULE]") &&
      content.includes("[/TVU_SCHEDULE]")
    ) {
      const scheduleData = extractTVUScheduleData(content);

      if (
        scheduleData &&
        JSON.stringify(scheduleData) !== JSON.stringify(scheduleDataRef.current)
      ) {
        scheduleDataRef.current = scheduleData;

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(async () => {
          try {
            const studentId = getLocalStorage(
              "tool:tvu_schedule:student_id",
              ""
            );
            const password = getLocalStorage("tool:tvu_schedule:password", "");

            if (!studentId || !password) {
              throw new Error(
                "Vui lòng cấu hình thông tin đăng nhập TTSV trong phần công cụ AI"
              );
            }

            let targetDate = "";

            switch (scheduleData.action) {
              case "xem_hom_nay":
                targetDate = formatDate(new Date());
                break;
              case "xem_ngay_mai":
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                targetDate = formatDate(tomorrow);
                break;
              case "xem_theo_ngay":
                if (!scheduleData.date) {
                  throw new Error(
                    "Vui lòng cung cấp ngày để xem thời khóa biểu."
                  );
                }
                targetDate = scheduleData.date;
                break;
              case "xem_lich_thi":
                throw new Error("Chức năng xem lịch thi đang được phát triển.");
              default:
                throw new Error("Hành động không hợp lệ.");
            }

            // CHỈ SỬ DỤNG API LOCAL Ở ĐÂY
            const scheduleResult = await getScheduleFromAPI(
              studentId,
              password,
              targetDate
            );

            // Cập nhật tin nhắn với kết quả
            setMessages((prev) => {
              const newMessages = [...prev];
              const targetIndex = newMessages.findIndex(
                (msg) => msg.id === messageId
              );

              if (targetIndex !== -1) {
                // Xóa tag TVU_SCHEDULE từ nội dung
                const cleanContent = content.replace(
                  /\[TVU_SCHEDULE\]([\s\S]*?)\[\/TVU_SCHEDULE\]/g,
                  ""
                );

                newMessages[targetIndex] = {
                  ...newMessages[targetIndex],
                  content:
                    cleanContent +
                    "\n\n[TVU_SCHEDULE_RESULT]\n" +
                    `DATE: ${targetDate}\n` +
                    `ACTION: ${scheduleData.action}\n` +
                    scheduleResult +
                    "\n[/TVU_SCHEDULE_RESULT]",
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
            scheduleDataRef.current = null;
          }
        }, 1000);
      }
    }
  };

  return { processTVUScheduleTag };
}
