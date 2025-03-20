/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useEffect } from "react";
import { Message } from "../../types";
import { getLocalStorage } from "@/utils/localStorage";
import axios from "axios";

interface TVUScheduleData {
  action: string;
  date?: string;
  week?: string;
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
  const week = scheduleContent.match(/WEEK:\s*(.*)/)?.[1]?.trim();

  if (!action) {
    return null;
  }

  return { action, date, week };
};

// Thêm hàm helper để lấy ngày đầu và cuối tuần
const getWeekDates = (
  date: Date,
  offset: number = 0
): { startDate: string; endDate: string } => {
  const currentDate = new Date(date);
  currentDate.setDate(currentDate.getDate() + offset * 7); // Dịch chuyển số tuần

  const day = currentDate.getDay();
  const diff = currentDate.getDate() - day + (day === 0 ? -6 : 1); // Điều chỉnh khi chủ nhật
  const startDate = new Date(currentDate.setDate(diff));
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);

  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
  };
};

// Cập nhật lại hàm getScheduleFromAPI
const getScheduleFromAPI = async (
  studentId: string,
  password: string,
  date: string,
  isWeekView: boolean = false,
  weekOffset: number = 0,
  week?: string
): Promise<string> => {
  try {
    const response = await axios.post("/api/tvu/schedule", {
      studentId,
      password,
      date,
      isWeekView,
      weekOffset,
      week,
    });

    // Xử lý response từ API local
    if (response.data?.subjects) {
      if (response.data.subjects.length === 0) {
        return `Không có lịch học trong khoảng thời gian này.`;
      }

      if (isWeekView) {
        // Format dữ liệu theo tuần
        const weekInfo = response.data.weekInfo;
        let result = `📅 ${weekInfo.thong_tin_tuan}\n\n`;

        // Nhóm các môn học theo ngày
        const subjectsByDay = response.data.subjects.reduce(
          (acc: any, subject: any) => {
            const day = new Date(subject.ngay_hoc).getDay();
            if (!acc[day]) acc[day] = [];
            acc[day].push(subject);
            return acc;
          },
          {}
        );

        // Tên các ngày trong tuần
        const dayNames = [
          "Chủ nhật",
          "Thứ hai",
          "Thứ ba",
          "Thứ tư",
          "Thứ năm",
          "Thứ sáu",
          "Thứ bảy",
        ];

        // In lịch học theo từng ngày
        for (let i = 1; i <= 7; i++) {
          if (subjectsByDay[i]) {
            result += `\n📌 ${dayNames[i]}:\n`;
            subjectsByDay[i].forEach((subject: any) => {
              result += `📚 ${subject.ten_mon}\n`;
              result += `👨‍🏫 GV: ${subject.ten_giang_vien}\n`;
              result += `🏢 Phòng: ${subject.ma_phong}\n`;
              result += `⏰ Tiết ${subject.tiet_bat_dau}-${subject.so_tiet}\n\n`;
            });
          }
        }
        return result;
      }

      // Format dữ liệu theo ngày (giữ nguyên logic cũ)
      return response.data.subjects
        .map(
          (subject: any) =>
            `📚 ${subject.ten_mon}\n👨‍🏫 GV: ${subject.ten_giang_vien}\n🏢 Phòng: ${subject.ma_phong}\n⏰ Tiết ${subject.tiet_bat_dau}-${subject.so_tiet}`
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
            let isWeekView = false;
            let weekOffset = 0;

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
              case "xem_tuan_nay":
                const currentWeek = getWeekDates(new Date());
                targetDate = currentWeek.startDate;
                isWeekView = true;
                break;
              case "xem_tuan_truoc":
                const lastWeek = getWeekDates(new Date(), -1);
                targetDate = lastWeek.startDate;
                isWeekView = true;
                weekOffset = -1;
                break;
              case "xem_tuan_sau":
                const nextWeek = getWeekDates(new Date(), 1);
                targetDate = nextWeek.startDate;
                isWeekView = true;
                weekOffset = 1;
                break;
              case "xem_theo_tuan":
                if (!scheduleData.week) {
                  throw new Error(
                    "Vui lòng cung cấp số tuần để xem thời khóa biểu."
                  );
                }
                // Sử dụng ngày hiện tại và truyền số tuần vào API
                targetDate = formatDate(new Date());
                isWeekView = true;
                // Đặt weekOffset = 0 vì đang xem tuần cụ thể theo số tuần
                // Thông tin về tuần sẽ được truyền qua tham số week
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
              targetDate,
              isWeekView,
              weekOffset,
              scheduleData.week
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

                // Tạo nội dung mới với kết quả
                let resultContent =
                  cleanContent +
                  "\n\n[TVU_SCHEDULE_RESULT]\n" +
                  `DATE: ${targetDate}\n` +
                  `ACTION: ${scheduleData.action}\n`;

                // Thêm thông tin về tuần nếu đang xem theo tuần cụ thể
                if (
                  scheduleData.action === "xem_theo_tuan" &&
                  scheduleData.week
                ) {
                  resultContent += `WEEK: ${scheduleData.week}\n`;
                }

                resultContent += scheduleResult + "\n[/TVU_SCHEDULE_RESULT]";

                newMessages[targetIndex] = {
                  ...newMessages[targetIndex],
                  content: resultContent,
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
