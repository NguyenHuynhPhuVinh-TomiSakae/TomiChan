import { Sandbox } from "@e2b/code-interpreter";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { oldDirectoryPath, newDirectoryPath } = await request.json();

    // Kiểm tra các tham số đầu vào
    if (!oldDirectoryPath || !newDirectoryPath) {
      return NextResponse.json(
        { error: "Vui lòng cung cấp oldDirectoryPath và newDirectoryPath" },
        { status: 400 }
      );
    }

    // Lấy API key từ header hoặc env
    const e2bApiKey =
      request.headers.get("X-E2B-API-Key") || process.env.E2B_API_KEY;

    if (!e2bApiKey) {
      return NextResponse.json(
        { error: "E2B API key không được cung cấp" },
        { status: 400 }
      );
    }

    // Tạo sandbox
    const sandbox = await Sandbox.create({
      apiKey: e2bApiKey,
    });

    try {
      // Kiểm tra xem thư mục mới đã tồn tại chưa
      await sandbox.commands.run(`[ -d "${newDirectoryPath}" ]`);
      return NextResponse.json(
        { error: `Thư mục "${newDirectoryPath}" đã tồn tại` },
        { status: 400 }
      );
    } catch {
      // Thư mục đích chưa tồn tại, tiếp tục
    }

    // Tạo thư mục mới
    await sandbox.commands.run(`mkdir -p "${newDirectoryPath}"`);

    // Di chuyển nội dung từ thư mục cũ sang thư mục mới
    await sandbox.commands.run(
      `cp -r "${oldDirectoryPath}"/* "${newDirectoryPath}"/`
    );

    // Xóa thư mục cũ
    await sandbox.commands.run(`rm -rf "${oldDirectoryPath}"`);

    return NextResponse.json({
      success: true,
      message: `Đã đổi tên thư mục từ "${oldDirectoryPath}" thành "${newDirectoryPath}"`,
    });
  } catch (error) {
    console.error("Lỗi khi đổi tên thư mục:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Lỗi không xác định" },
      { status: 500 }
    );
  }
}
