/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const { studentId, password } = await req.json();

    if (!studentId || !password) {
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

    // 2. Lấy điểm
    const scoreFormData = new URLSearchParams();
    scoreFormData.append("hien_thi_mon_theo_hkdk", "false");

    const scoreResponse = await axios.post(
      "https://ttsv.tvu.edu.vn/api/srm/w-locdsdiemsinhvien",
      scoreFormData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // 3. Xử lý dữ liệu
    const scoreData = scoreResponse.data;

    // Thêm log để debug
    console.log(
      "Dữ liệu trả về từ API TVU:",
      JSON.stringify(scoreData, null, 2)
    );

    // Check đúng cấu trúc dữ liệu
    if (!scoreData?.data?.ds_diem_hocky) {
      console.error("Cấu trúc dữ liệu không hợp lệ từ TVU:", {
        fullResponse: scoreData,
        statusCode: scoreResponse.status,
      });
      return NextResponse.json(
        { error: "Dữ liệu điểm không hợp lệ" },
        { status: 500 }
      );
    }

    // Lấy tất cả các môn từ các học kỳ
    const allSubjects: any[] = [];
    let latestGPA = "0";
    let latestGPA4 = "0";
    let latestCredits = "0";

    // Học kỳ được sắp xếp theo thứ tự mới nhất trước
    const semesters = scoreData.data.ds_diem_hocky || [];

    // Thêm thông tin về từng học kỳ và điểm hệ 4
    const semesterInfos: any[] = [];

    if (semesters.length > 0) {
      // Lấy GPA & số tín chỉ từ học kỳ gần nhất
      latestGPA = semesters[0].dtb_tich_luy_he_10 || "0";
      latestGPA4 = semesters[0].dtb_tich_luy_he_4 || "0";
      latestCredits = semesters[0].so_tin_chi_dat_tich_luy || "0";

      // Thêm thông tin từng học kỳ
      semesters.forEach((semester: any) => {
        semesterInfos.push({
          semesterName: semester.ten_hoc_ky,
          semesterId: semester.hoc_ky,
          semesterGPA10: semester.dtb_hk_he10 || "-",
          semesterGPA4: semester.dtb_hk_he4 || "-",
          semesterCredits: semester.so_tin_chi_dat_hk || "-",
          classification: semester.xep_loai_tkb_hk || "-",
        });
      });

      // Xử lý dữ liệu từ tất cả học kỳ
      semesters.forEach((semester: any) => {
        const semesterName = semester.ten_hoc_ky;
        const semesterId = semester.hoc_ky;

        (semester.ds_diem_mon_hoc || []).forEach((subject: any) => {
          // Xử lý điểm thành phần
          const detailScores = subject.ds_diem_thanh_phan || [];
          const componentScores = detailScores.map((detail: any) => ({
            componentName: detail.ten_thanh_phan,
            weight: detail.trong_so,
            score: detail.diem_thanh_phan,
          }));

          // Tạo đối tượng chi tiết môn học
          const subjectDetails = {
            subjectName: subject.ten_mon,
            subjectCode: subject.ma_mon,
            credits: subject.so_tin_chi,
            midtermScore: subject.diem_giua_ky || "-",
            finalScore: subject.diem_thi || "-",
            avgScore: subject.diem_tk || "-",
            letterGrade: subject.diem_tk_chu || "-",
            numericGrade: subject.diem_tk_so || "-",
            semester: semesterName,
            semesterId: semesterId,
            countedInGPA: subject.khong_tinh_diem_tbtl === 0,
            status: subject.ket_qua === 1 ? "Đạt" : "Chưa đạt",
            componentScores: componentScores,
            notCountReason: subject.ly_do_khong_tinh_diem_tbtl || "",
          };

          // Thêm tất cả môn học, kể cả chưa có điểm
          allSubjects.push(subjectDetails);
        });
      });
    }

    // Tính điểm trung bình tích lũy
    const gpaData = {
      gpa10: latestGPA,
      gpa4: latestGPA4,
      totalCredits: latestCredits,
      semesters: semesterInfos,
      subjects: allSubjects,
    };

    return NextResponse.json(gpaData);
  } catch (error) {
    console.error("Lỗi API TVU (điểm):", error);

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
