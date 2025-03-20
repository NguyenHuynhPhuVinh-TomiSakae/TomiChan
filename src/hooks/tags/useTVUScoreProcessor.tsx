/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useEffect } from "react";
import { Message } from "../../types";
import { getLocalStorage } from "@/utils/localStorage";
import axios from "axios";

interface TVUScoreData {
  action: string;
}

// Trích xuất thông tin TVU_SCORE tag từ nội dung tin nhắn
const extractTVUScoreData = (messageContent: string): TVUScoreData | null => {
  const scoreRegex = /\[TVU_SCORE\]([\s\S]*?)\[\/TVU_SCORE\]/;
  const match = messageContent.match(scoreRegex);

  if (!match) {
    return null;
  }

  const scoreContent = match[1];
  const action = scoreContent.match(/ACTION:\s*(.*)/)?.[1]?.trim();

  if (!action) {
    return null;
  }

  return { action };
};

// Lấy dữ liệu điểm từ API
const getScoreFromAPI = async (
  studentId: string,
  password: string
): Promise<any> => {
  try {
    const response = await axios.post("/api/tvu/score", {
      studentId,
      password,
    });

    // Xử lý response từ API local
    if (response.data?.subjects) {
      if (response.data.subjects.length === 0) {
        return `Không tìm thấy dữ liệu điểm.`;
      }

      return response.data;
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

export function useTVUScoreProcessor() {
  const scoreDataRef = useRef<TVUScoreData | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const processTVUScoreTag = async (
    content: string,
    messageId: string,
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
    saveChat: (messages: Message[], chatId?: string, model?: string) => void,
    chatId?: string,
    model?: string
  ) => {
    if (content.includes("[TVU_SCORE]") && content.includes("[/TVU_SCORE]")) {
      const scoreData = extractTVUScoreData(content);

      if (
        scoreData &&
        JSON.stringify(scoreData) !== JSON.stringify(scoreDataRef.current)
      ) {
        scoreDataRef.current = scoreData;

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

            switch (scoreData.action) {
              case "xem_diem":
                // Lấy dữ liệu điểm
                const scoreResult = await getScoreFromAPI(studentId, password);

                // Cập nhật tin nhắn với kết quả
                setMessages((prev) => {
                  const newMessages = [...prev];
                  const targetIndex = newMessages.findIndex(
                    (msg) => msg.id === messageId
                  );

                  if (targetIndex !== -1) {
                    // Sắp xếp học kỳ theo thứ tự mới nhất đầu tiên
                    const sortedSemesters = [...scoreResult.semesters].sort(
                      (a, b) => b.semesterId.localeCompare(a.semesterId)
                    );

                    // Nhóm môn học theo học kỳ để hiển thị UI
                    const subjectsBySemester = scoreResult.subjects.reduce(
                      (acc: any, subject: any) => {
                        if (!acc[subject.semesterId]) {
                          acc[subject.semesterId] = [];
                        }
                        // Chỉ lấy các môn học đã có điểm tổng kết
                        if (subject.avgScore && subject.avgScore !== "-") {
                          acc[subject.semesterId].push(subject);
                        }
                        return acc;
                      },
                      {}
                    );

                    // Sắp xếp các môn học trong mỗi học kỳ theo điểm và mã môn
                    Object.keys(subjectsBySemester).forEach((semId) => {
                      subjectsBySemester[semId].sort((a: any, b: any) => {
                        // Sắp xếp theo điểm giảm dần
                        const scoreA = parseFloat(a.avgScore) || 0;
                        const scoreB = parseFloat(b.avgScore) || 0;
                        if (scoreB !== scoreA) return scoreB - scoreA;

                        // Nếu điểm bằng nhau, sắp xếp theo mã môn
                        return a.subjectCode.localeCompare(b.subjectCode);
                      });
                    });

                    // Xóa tag TVU_SCORE từ nội dung
                    const cleanContent = content.replace(
                      /\[TVU_SCORE\]([\s\S]*?)\[\/TVU_SCORE\]/g,
                      ""
                    );

                    newMessages[targetIndex] = {
                      ...newMessages[targetIndex],
                      content:
                        cleanContent +
                        "\n\n[TVU_SCORE_RESULT]\n" +
                        `ACTION: ${scoreData.action}\n` +
                        `GPA10: ${scoreResult.gpa10}\n` +
                        `GPA4: ${scoreResult.gpa4}\n` +
                        `TOTAL_CREDITS: ${scoreResult.totalCredits}\n` +
                        `SEMESTERS: ${JSON.stringify(sortedSemesters)}\n` +
                        `SUBJECTS: ${JSON.stringify(scoreResult.subjects)}\n` +
                        `SUBJECTS_BY_SEMESTER: ${JSON.stringify(
                          subjectsBySemester
                        )}\n` +
                        "[/TVU_SCORE_RESULT]",
                    };
                    saveChat(newMessages, chatId, model);
                  }
                  return newMessages;
                });
                break;
              default:
                throw new Error("Hành động không hợp lệ.");
            }
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
            scoreDataRef.current = null;
          }
        }, 1000);
      }
    }
  };

  return { processTVUScoreTag };
}
