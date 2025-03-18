import { Sandbox } from "@e2b/code-interpreter";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { oldFilePath, newFilePath } = await request.json();

    // Kiểm tra các tham số đầu vào
    if (!oldFilePath || !newFilePath) {
      return NextResponse.json(
        { error: "Vui lòng cung cấp oldFilePath và newFilePath" },
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
      // Kiểm tra xem file mới đã tồn tại chưa
      await sandbox.commands.run(`[ -f "${newFilePath}" ]`);
      return NextResponse.json(
        { error: `File "${newFilePath}" đã tồn tại` },
        { status: 400 }
      );
    } catch {
      // File đích chưa tồn tại, tiếp tục
    }

    // Di chuyển file (đổi tên)
    await sandbox.commands.run(`mv "${oldFilePath}" "${newFilePath}"`);

    return NextResponse.json({
      success: true,
      message: `Đã đổi tên file từ "${oldFilePath}" thành "${newFilePath}"`,
    });
  } catch (error) {
    console.error("Lỗi khi đổi tên file:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Lỗi không xác định" },
      { status: 500 }
    );
  }
}
