/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import {
  IconSchool,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";

interface TVUScoreResultProps {
  children: React.ReactNode;
}

export const TVUScoreResult: React.FC<TVUScoreResultProps> = ({ children }) => {
  const rawContent = React.Children.toArray(children)
    .map((child) => {
      if (typeof child === "string") return child;
      if (child && typeof child === "object" && "props" in child) {
        return (child as any).props.children;
      }
      return "";
    })
    .join("");

  // State để theo dõi trạng thái đóng/mở của từng học kỳ
  const [expandedSemesters, setExpandedSemesters] = useState<
    Record<string, boolean>
  >({});

  // Hàm chuyển đổi trạng thái đóng/mở của học kỳ
  const toggleSemester = (semesterId: string) => {
    setExpandedSemesters((prev) => ({
      ...prev,
      [semesterId]: !prev[semesterId],
    }));
  };

  const gpa10 = rawContent.match(/GPA10:\s*(.*?)(?=\n|$)/)?.[1]?.trim();
  const gpa4 = rawContent.match(/GPA4:\s*(.*?)(?=\n|$)/)?.[1]?.trim();
  const totalCredits = rawContent
    .match(/TOTAL_CREDITS:\s*(.*?)(?=\n|$)/)?.[1]
    ?.trim();

  // Parse semester information
  const semestersMatch = rawContent.match(/SEMESTERS:\s*(.*?)(?=\n)/);
  const semestersStr = semestersMatch?.[1]?.trim() || "[]";

  let semesters = [];
  try {
    semesters = JSON.parse(semestersStr);
  } catch (error) {
    console.error("Lỗi parse dữ liệu học kỳ:", error);
  }

  // Parse subjects from JSON string
  const subjectsMatch = rawContent.match(/SUBJECTS:\s*(.*?)(?=\n)/);
  const subjectsStr = subjectsMatch?.[1]?.trim() || "[]";

  let subjects = [];
  try {
    subjects = JSON.parse(subjectsStr);
  } catch (error) {
    console.error("Lỗi parse dữ liệu môn học:", error);
  }

  // LUÔN tạo subjectsBySemester từ subjects, bỏ qua chuỗi SUBJECTS_BY_SEMESTER từ API
  let subjectsBySemester = {};
  if (subjects && Array.isArray(subjects) && subjects.length > 0) {
    console.log("Đang tạo subjectsBySemester từ danh sách subjects...");
    subjectsBySemester = subjects.reduce((acc: any, subject: any) => {
      const id = subject.semesterId;
      if (!acc[id]) {
        acc[id] = [];
      }
      // Chỉ thêm các môn đã có điểm
      if (subject.avgScore && subject.avgScore !== "-") {
        acc[id].push(subject);
      }
      return acc;
    }, {});

    // Sắp xếp các môn học theo điểm từ cao xuống thấp
    Object.keys(subjectsBySemester).forEach((semId) => {
      (subjectsBySemester as any)[semId].sort((a: any, b: any) => {
        const scoreA = parseFloat(a.avgScore) || 0;
        const scoreB = parseFloat(b.avgScore) || 0;
        return scoreB - scoreA;
      });
    });

    console.log(
      "Đã tạo xong subjectsBySemester:",
      Object.keys(subjectsBySemester)
    );
  }

  console.log("Final SUBJECTS_BY_SEMESTER:", subjectsBySemester);

  return (
    <div className="my-4 p-4 rounded-lg border-2 border-green-500/30 bg-white dark:bg-gray-800 shadow-md">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
          <IconSchool
            className="text-green-500 dark:text-green-400"
            size={24}
          />
        </div>
        <div>
          <h3 className="font-semibold text-lg text-green-600 dark:text-green-400">
            Bảng Điểm Học Tập
          </h3>
        </div>
      </div>

      {/* GPA và Tín chỉ tích lũy */}
      <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Điểm TB tích lũy (hệ 10)
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {gpa10}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Điểm TB tích lũy (hệ 4)
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {gpa4}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Tín chỉ tích lũy
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {totalCredits}
            </div>
          </div>
        </div>
      </div>

      {/* Tổng quan từng học kỳ */}
      <div className="mb-4">
        <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
          Tổng quan học kỳ
        </h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Học kỳ
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Điểm TB (hệ 10)
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Điểm TB (hệ 4)
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Tín chỉ đạt
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Xếp loại
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {semesters.map((semester: any, index: number) => (
                <tr
                  key={index}
                  className={
                    index % 2 === 0 ? "bg-gray-50 dark:bg-gray-800/50" : ""
                  }
                >
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-300">
                    {semester.semesterName}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-center text-sm text-green-600 dark:text-green-400">
                    {semester.semesterGPA10}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-center text-sm text-green-600 dark:text-green-400">
                    {semester.semesterGPA4}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-center text-sm text-gray-500 dark:text-gray-400">
                    {semester.semesterCredits}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-center text-sm text-blue-600 dark:text-blue-400 font-medium">
                    {semester.classification}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Danh sách điểm theo học kỳ */}
      <div className="mt-6 space-y-4">
        <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
          Chi tiết điểm từng môn
        </h4>
        {semesters.map((semester: any) => {
          const semesterId = semester.semesterId;
          const semesterSubjects =
            (subjectsBySemester as any)[semesterId] || [];

          if (semesterSubjects.length === 0) return null;

          const isExpanded = expandedSemesters[semesterId] || false;

          return (
            <div key={semesterId} className="border rounded-lg overflow-hidden">
              <div
                className="bg-green-100 dark:bg-green-900/50 p-3 flex justify-between items-center cursor-pointer hover:bg-green-200 dark:hover:bg-green-800/50 transition-colors duration-200"
                onClick={() => toggleSemester(semesterId)}
              >
                <h4 className="font-medium text-green-800 dark:text-green-300">
                  {semester.semesterName} ({semesterSubjects.length} môn)
                </h4>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-green-700 dark:text-green-400">
                    <span className="font-medium">GPA:</span>{" "}
                    {semester.semesterGPA10} |
                    <span className="font-medium ml-2">TC:</span>{" "}
                    {semester.semesterCredits}
                  </div>
                  {isExpanded ? (
                    <IconChevronUp
                      size={20}
                      className="text-green-700 dark:text-green-400"
                    />
                  ) : (
                    <IconChevronDown
                      size={20}
                      className="text-green-700 dark:text-green-400"
                    />
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Môn học
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Mã môn
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          TC
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Điểm QT
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Điểm thi
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Điểm hệ 10
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Điểm hệ 4
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Điểm chữ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {semesterSubjects.map((subject: any, index: number) => (
                        <React.Fragment key={`${subject.subjectCode}-${index}`}>
                          <tr
                            className={
                              index % 2 === 0
                                ? "bg-gray-50 dark:bg-gray-800/50"
                                : ""
                            }
                          >
                            <td className="px-3 py-2 whitespace-normal text-sm text-gray-900 dark:text-gray-300">
                              {subject.subjectName}
                              {!subject.countedInGPA && (
                                <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                                  * {subject.notCountReason}
                                </div>
                              )}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-center text-sm text-gray-500 dark:text-gray-400">
                              {subject.subjectCode}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-center text-sm text-gray-500 dark:text-gray-400">
                              {subject.credits}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-center text-sm text-gray-500 dark:text-gray-400">
                              {subject.midtermScore}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-center text-sm text-gray-500 dark:text-gray-400">
                              {subject.finalScore}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-center text-sm font-medium">
                              <span
                                className={
                                  parseFloat(subject.avgScore) >= 7
                                    ? "text-green-600 dark:text-green-400"
                                    : parseFloat(subject.avgScore) >= 5
                                    ? "text-blue-600 dark:text-blue-400"
                                    : "text-red-600 dark:text-red-400"
                                }
                              >
                                {subject.avgScore}
                              </span>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-center text-sm font-medium">
                              <span
                                className={
                                  parseFloat(subject.numericGrade) >= 3
                                    ? "text-green-600 dark:text-green-400"
                                    : parseFloat(subject.numericGrade) >= 2
                                    ? "text-blue-600 dark:text-blue-400"
                                    : "text-red-600 dark:text-red-400"
                                }
                              >
                                {subject.numericGrade}
                              </span>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-center text-sm font-semibold">
                              <span
                                className={
                                  subject.letterGrade === "A" ||
                                  subject.letterGrade === "A+"
                                    ? "text-green-700 dark:text-green-300"
                                    : subject.letterGrade === "B+" ||
                                      subject.letterGrade === "B"
                                    ? "text-blue-700 dark:text-blue-300"
                                    : subject.letterGrade === "C+" ||
                                      subject.letterGrade === "C"
                                    ? "text-yellow-700 dark:text-yellow-300"
                                    : "text-red-700 dark:text-red-300"
                                }
                              >
                                {subject.letterGrade}
                              </span>
                            </td>
                          </tr>
                          {subject.componentScores &&
                            subject.componentScores.length > 0 && (
                              <tr className="bg-gray-100 dark:bg-gray-800/20">
                                <td colSpan={8} className="px-3 py-2">
                                  <div className="text-xs text-gray-600 dark:text-gray-400 pl-4">
                                    <p className="font-medium mb-1">
                                      Chi tiết điểm thành phần:
                                    </p>
                                    <div className="grid grid-cols-3 gap-2">
                                      {subject.componentScores.map(
                                        (component: any, idx: number) => (
                                          <div
                                            key={idx}
                                            className="flex items-center gap-1"
                                          >
                                            <span className="font-medium">
                                              {component.componentName}:
                                            </span>
                                            <span>{component.score}</span>
                                            <span className="text-gray-500 dark:text-gray-500">
                                              ({component.weight}%)
                                            </span>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
