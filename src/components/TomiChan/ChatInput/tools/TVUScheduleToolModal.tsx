import React, { useState, useEffect } from "react";
import ModalWrapper from "@/components/ProviderSettings/ModalWrapper";
import { IconCalendar, IconInfoCircle } from "@tabler/icons-react";
import { getLocalStorage, setLocalStorage } from "@/utils/localStorage";

interface TVUScheduleToolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnable: () => void;
  onDisable: () => void;
  isEnabled: boolean;
}

export default function TVUScheduleToolModal({
  isOpen,
  onClose,
  onEnable,
  onDisable,
  isEnabled,
}: TVUScheduleToolModalProps) {
  // Hàm lấy học kỳ mặc định dựa vào thời gian hiện tại
  const getDefaultSemester = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // getMonth() trả về 0-11

    // Học kỳ 1: từ tháng 9 đến tháng 1 năm sau
    // Học kỳ 2: từ tháng 2 đến tháng 6
    if (currentMonth >= 9) {
      // Học kỳ 1 của năm học mới
      return `${currentYear}1`;
    } else if (currentMonth >= 2 && currentMonth <= 6) {
      // Học kỳ 2 của năm học hiện tại
      return `${currentYear - 1}2`;
    } else {
      // Các tháng còn lại (7,8) thì vẫn giữ học kỳ 2 của năm học trước
      return `${currentYear - 1}2`;
    }
  };

  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [semester, setSemester] = useState(getDefaultSemester());
  const [semesters, setSemesters] = useState<
    { value: string; label: string }[]
  >([
    {
      value: getDefaultSemester(),
      label: `Học kỳ ${getDefaultSemester().slice(-1)} năm ${parseInt(
        getDefaultSemester().slice(0, 4)
      )}-${parseInt(getDefaultSemester().slice(0, 4)) + 1}`,
    },
  ]);

  // Hàm tạo danh sách học kỳ dựa vào MSSV
  const generateSemesters = (mssv: string) => {
    // Lấy số năm từ MSSV (vị trí 5-6, ví dụ: 110122203 -> 22)
    const yearMatch = mssv.match(/^1101(\d{2})/);
    if (!yearMatch) return;

    const startYear = 2000 + parseInt(yearMatch[1]);
    const endYear = startYear + 5; // Giới hạn 6 năm (từ năm bắt đầu đến năm thứ 6)
    const currentYear = new Date().getFullYear();

    // Nếu năm hiện tại vượt quá 6 năm kể từ năm bắt đầu, lấy endYear
    // Ngược lại lấy năm hiện tại
    const maxYear = Math.min(endYear, currentYear);

    const semesterList = [];

    // Tạo danh sách học kỳ từ năm bắt đầu đến năm kết thúc
    for (let year = startYear; year <= maxYear; year++) {
      // Thêm học kỳ 1
      semesterList.unshift({
        value: `${year}1`,
        label: `Học kỳ 1 năm ${year}-${year + 1}`,
      });
      // Thêm học kỳ 2
      semesterList.unshift({
        value: `${year}2`,
        label: `Học kỳ 2 năm ${year}-${year + 1}`,
      });
    }

    setSemesters(semesterList);

    // Nếu học kỳ hiện tại không nằm trong danh sách học kỳ của sinh viên
    // thì chọn học kỳ gần nhất
    const currentSemester = getDefaultSemester();
    const hasSemester = semesterList.some(
      (sem) => sem.value === currentSemester
    );
    if (!hasSemester && semesterList.length > 0) {
      setSemester(semesterList[0].value);
    }
  };

  // Load cấu hình từ localStorage khi mở modal
  useEffect(() => {
    const savedStudentId = getLocalStorage("tool:tvu_schedule:student_id", "");
    const savedPassword = getLocalStorage("tool:tvu_schedule:password", "");
    const savedSemester = getLocalStorage(
      "tool:tvu_schedule:semester",
      "20242"
    );
    setStudentId(savedStudentId);
    setPassword(savedPassword);
    setSemester(savedSemester);

    // Tạo danh sách học kỳ nếu có MSSV
    if (savedStudentId) {
      generateSemesters(savedStudentId);
    }
  }, []);

  // Tự động tạo danh sách học kỳ khi MSSV thay đổi
  useEffect(() => {
    if (studentId.trim()) {
      setLocalStorage("tool:tvu_schedule:student_id", studentId);
      generateSemesters(studentId);
    }
  }, [studentId]);

  useEffect(() => {
    if (password.trim()) {
      setLocalStorage("tool:tvu_schedule:password", password);
    }
  }, [password]);

  useEffect(() => {
    if (semester.trim()) {
      setLocalStorage("tool:tvu_schedule:semester", semester);
    }
  }, [semester]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim() || !password.trim()) return;

    // Bật công cụ
    onEnable();
    onClose();
  };

  const handleDisable = () => {
    // Không xóa cấu hình khi tắt công cụ nữa
    onDisable();
    onClose();
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Cấu hình Xem TKB TVU"
      maxWidth="xl"
    >
      <div className="flex flex-col gap-6">
        {/* Phần header */}
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
            <IconCalendar
              size={32}
              className="text-blue-600 dark:text-blue-400"
              stroke={1.5}
            />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-black dark:text-white">
              Xem TKB TVU
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Tra cứu và quản lý thời khóa biểu Trường Đại học Trà Vinh
            </p>
          </div>
        </div>

        {/* Phần mô tả */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
          <h3 className="font-medium text-black dark:text-white mb-2">
            Mô tả chi tiết
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Công cụ Xem TKB TVU giúp bạn truy cập thông tin học tập tại Đại học
            Trà Vinh qua tài khoản TTSV. Bạn có thể:
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>Tra cứu thời khóa biểu cá nhân theo ngày</li>
              <li>
                Xem thời khóa biểu theo tuần (tuần này, tuần trước, tuần sau)
              </li>
              <li>
                Tra cứu thời khóa biểu theo số tuần cụ thể (tuần 37, tuần
                38,...)
              </li>
              <li>Xem điểm số các học phần, điểm tổng kết</li>
              <li>Tra cứu điểm theo học kỳ và năm học cụ thể</li>
            </ul>
            Công cụ được kết nối trực tiếp với API của hệ thống TTSV để đảm bảo
            thông tin chính xác.
          </p>
        </div>

        {/* Phần hướng dẫn */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
          <h3 className="font-medium text-black dark:text-white mb-2">
            Hướng dẫn sử dụng
          </h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p>1. Nhập mã số sinh viên của bạn</p>
            <p>2. Nhập mật khẩu TTSV</p>
            <p>3. Nhấn nút bật để kích hoạt công cụ</p>
            <p>4. Yêu cầu AI thông tin bằng các câu hỏi như:</p>
            <ul className="list-disc ml-8 mt-1 space-y-1">
              <li>&quot;Xem thời khóa biểu hôm nay&quot;</li>
              <li>&quot;Thời khóa biểu ngày mai của tôi&quot;</li>
              <li>&quot;Cho tôi xem thời khóa biểu tuần này&quot;</li>
              <li>&quot;Xem thời khóa biểu tuần trước&quot;</li>
              <li>&quot;Thời khóa biểu tuần sau của tôi&quot;</li>
              <li>
                &quot;Xem thời khóa biểu tuần 37&quot; (tra cứu theo số tuần cụ
                thể)
              </li>
              <li>&quot;Xem điểm của tôi&quot;</li>
              <li>
                &quot;Xem điểm học kỳ 2 năm 2023-2024&quot; (tra cứu điểm theo
                kỳ cụ thể)
              </li>
            </ul>
          </div>
        </div>

        {/* Phần cấu hình */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="font-medium text-black dark:text-white">
            Cấu hình đăng nhập TTSV
          </h3>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Mã số sinh viên
            </label>
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="Nhập mã số sinh viên của bạn"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              required
            />
            <div className="flex items-start gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
              <IconInfoCircle size={16} className="mt-0.5 flex-shrink-0" />
              <p>
                Mã số sinh viên là một chuỗi số được cấp khi bạn nhập học tại
                trường TVU. Ví dụ: 110120XXX, 110121XXX, ...
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Mật khẩu TTSV
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu hệ thống TTSV"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              required
            />
            <div className="flex items-start gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
              <IconInfoCircle size={16} className="mt-0.5 flex-shrink-0" />
              <p>
                Sử dụng mật khẩu bạn đăng nhập vào hệ thống TTSV (hệ thống đào
                tạo trực tuyến)
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Học kỳ
            </label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              {semesters.map((sem) => (
                <option key={sem.value} value={sem.value}>
                  {sem.label}
                </option>
              ))}
            </select>
            <div className="flex items-start gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
              <IconInfoCircle size={16} className="mt-0.5 flex-shrink-0" />
              <p>
                Chọn học kỳ bạn muốn xem thời khóa biểu. Danh sách học kỳ được
                tạo tự động dựa vào năm bắt đầu học của bạn.
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            * Thông tin đăng nhập sẽ được tự động lưu khi bạn nhập
          </p>

          <div className="flex justify-between items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors cursor-pointer"
            >
              Đóng
            </button>
            {isEnabled ? (
              <button
                type="button"
                onClick={handleDisable}
                className="px-6 py-2 rounded-lg text-sm font-medium transition-colors bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 cursor-pointer"
              >
                Tắt công cụ
              </button>
            ) : (
              <button
                type="submit"
                disabled={!studentId.trim() || !password.trim()}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                  studentId.trim() && password.trim()
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 cursor-pointer"
                    : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed"
                }`}
              >
                Bật công cụ
              </button>
            )}
          </div>
        </form>
      </div>
    </ModalWrapper>
  );
}
