/* eslint-disable @typescript-eslint/no-unused-vars */
import { Sandbox } from "@e2b/code-interpreter";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { directoryPath } = await request.json();
    console.log("Kiểm tra thư mục:", directoryPath);

    // Lấy API key từ header hoặc env
    const e2bApiKey =
      request.headers.get("X-E2B-API-Key") || process.env.E2B_API_KEY;

    if (!e2bApiKey) {
      throw new Error("E2B API key không được cung cấp");
    }

    const sandbox = await Sandbox.create({
      apiKey: e2bApiKey,
    });

    // Kiểm tra thư mục có tồn tại không bằng cách thực hiện lệnh ls
    try {
      await sandbox.commands.run(`ls -la ${directoryPath}`);
      return NextResponse.json({ exists: true, path: directoryPath });
    } catch (error) {
      // Nếu lệnh ls thất bại, thư mục không tồn tại
      return NextResponse.json({ exists: false, path: directoryPath });
    }
  } catch (error) {
    console.error("Lỗi khi kiểm tra thư mục:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Lỗi không xác định" },
      { status: 500 }
    );
  }
}
