import { Sandbox } from "@e2b/code-interpreter";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { directoryPath } = await request.json();
    console.log("Xóa thư mục:", directoryPath);

    // Lấy API key từ header hoặc env
    const e2bApiKey =
      request.headers.get("X-E2B-API-Key") || process.env.E2B_API_KEY;

    if (!e2bApiKey) {
      throw new Error("E2B API key không được cung cấp");
    }

    const sandbox = await Sandbox.create({
      apiKey: e2bApiKey,
    });

    // Xóa thư mục trên E2B
    await sandbox.commands.run(`rm -rf ${directoryPath}`);

    return NextResponse.json({
      success: true,
      path: directoryPath,
      message: "Đã xóa thư mục thành công",
    });
  } catch (error) {
    console.error("Lỗi khi xóa thư mục:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Lỗi không xác định" },
      { status: 500 }
    );
  }
}
