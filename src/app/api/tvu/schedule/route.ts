import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const { studentId, password, date, isWeekView, weekOffset } =
      await req.json();

    if (!studentId || !password || !date) {
      return NextResponse.json(
        { error: "Thiếu thông tin bắt buộc" },
        { status: 400 }
      );
    }

    // 1. Đăng nhập để lấy token
    const loginFormData = new URLSearchParams();
    loginFormData.append("username", studentId);
    loginFormData.append("password", password);
    loginFormData.append("grant_type", "password");

    const loginResponse = await axios.post(
      "https://ttsv.tvu.edu.vn/api/auth/login",
      loginFormData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    if (!loginResponse.data?.access_token) {
      return NextResponse.json(
        { error: "Đăng nhập thất bại" },
        { status: 401 }
      );
    }

    const token = loginResponse.data.access_token;

    // 2. Lấy thời khóa biểu
    const scheduleFormData = new URLSearchParams();
    scheduleFormData.append("filter[hoc_ky]", "20242");
    scheduleFormData.append("filter[ten_hoc_ky]", "");
    scheduleFormData.append("additional[paging][limit]", "1000");
    scheduleFormData.append("additional[paging][page]", "1");

    const scheduleResponse = await axios.post(
      "https://ttsv.tvu.edu.vn/api/sch/w-locdstkbtuanusertheohocky",
      scheduleFormData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // 3. Xử lý dữ liệu
    const schedule = scheduleResponse.data;
    const subjects = [];

    // Kiểm tra cấu trúc dữ liệu
    if (!schedule?.data?.ds_tuan_tkb) {
      console.error("Cấu trúc dữ liệu không hợp lệ từ TVU");
      return NextResponse.json(
        { error: "Dữ liệu thời khóa biểu không hợp lệ" },
        { status: 500 }
      );
    }

    // Thêm hàm xử lý ngày tháng
    const parseDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return new Date(
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
      )
        .toISOString()
        .split("T")[0];
    };

    // Tìm tuần học hiện tại
    const targetDate = parseDate(date);
    let currentWeek = null;
    let weekIndex = 0;

    for (let i = 0; i < schedule.data.ds_tuan_tkb.length; i++) {
      const week = schedule.data.ds_tuan_tkb[i];
      const weekStart = parseDate(
        week.ngay_bat_dau.split("/").reverse().join("-")
      );
      const weekEnd = parseDate(
        week.ngay_ket_thuc.split("/").reverse().join("-")
      );

      if (targetDate >= weekStart && targetDate <= weekEnd) {
        currentWeek = week;
        weekIndex = i;
        break;
      }
    }

    if (!currentWeek) {
      return NextResponse.json({
        date: date,
        subjects: [],
      });
    }

    // Nếu là xem theo tuần, lấy tất cả môn học trong tuần
    if (isWeekView) {
      // Tính toán tuần cần lấy dựa trên weekOffset
      const targetWeekIndex = weekIndex + weekOffset;
      if (
        targetWeekIndex < 0 ||
        targetWeekIndex >= schedule.data.ds_tuan_tkb.length
      ) {
        return NextResponse.json({
          date: date,
          subjects: [],
          weekInfo: {
            thong_tin_tuan: "Không có dữ liệu cho tuần này",
          },
        });
      }

      const targetWeek = schedule.data.ds_tuan_tkb[targetWeekIndex];
      const weekSubjects = targetWeek.ds_thoi_khoa_bieu || [];

      return NextResponse.json({
        date: date,
        subjects: weekSubjects,
        weekInfo: {
          thong_tin_tuan: targetWeek.thong_tin_tuan,
          ngay_bat_dau: targetWeek.ngay_bat_dau,
          ngay_ket_thuc: targetWeek.ngay_ket_thuc,
        },
      });
    }

    // Nếu là xem theo ngày, lọc môn học theo ngày
    for (const subject of currentWeek.ds_thoi_khoa_bieu) {
      const subjectDate = parseDate(subject.ngay_hoc);
      if (subjectDate === targetDate) {
        subjects.push({
          ten_mon: subject.ten_mon,
          ten_giang_vien: subject.ten_giang_vien,
          ma_phong: subject.ma_phong,
          tiet_bat_dau: subject.tiet_bat_dau,
          so_tiet: subject.so_tiet,
          ngay_hoc: subject.ngay_hoc,
        });
      }
    }

    return NextResponse.json({
      date: date,
      subjects: subjects,
    });
  } catch (error) {
    console.error("Lỗi API TVU:", error);

    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        {
          error: "Lỗi kết nối hệ thống TVU",
          message: error.message,
          status: error.response?.status || 500,
        },
        { status: error.response?.status || 500 }
      );
    }

    return NextResponse.json({ error: "Lỗi máy chủ nội bộ" }, { status: 500 });
  }
}
