import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const { studentId, password, date } = await req.json();

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
    scheduleFormData.append("additional[paging][limit]", "100");
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
      // Chuyển đổi tất cả các định dạng ngày về dạng YYYY-MM-DD
      const date = new Date(dateStr);
      return new Date(
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
      )
        .toISOString()
        .split("T")[0];
    };

    for (const week of schedule.data.ds_tuan_tkb) {
      if (!week.ds_thoi_khoa_bieu) continue;

      for (const subject of week.ds_thoi_khoa_bieu) {
        const subjectDate = parseDate(subject.ngay_hoc);
        const targetDate = parseDate(date);

        if (subjectDate === targetDate) {
          subjects.push({
            tenMon: subject.ten_mon,
            giangVien: subject.ten_giang_vien,
            phong: subject.ma_phong,
            tietBatDau: subject.tiet_bat_dau,
            soTiet: subject.so_tiet,
          });
        }
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
