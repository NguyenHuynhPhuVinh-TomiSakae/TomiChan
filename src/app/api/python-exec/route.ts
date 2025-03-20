import { Sandbox } from "@e2b/code-interpreter";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { code } = await request.json();
    if (!code) {
      return NextResponse.json(
        { error: "Không có mã Python để thực thi" },
        { status: 400 }
      );
    }

    const e2bApiKey = request.headers.get("X-E2B-API-Key");
    if (!e2bApiKey) {
      throw new Error("E2B API key không được cung cấp");
    }

    // Tạo sandbox instance với E2B framework
    const sandbox = await Sandbox.create({ apiKey: e2bApiKey });

    // Thực thi mã Python
    const execution = await sandbox.runCode(code);

    // Lấy output và error từ logs
    const output = execution.logs.stdout.join("\n").trim() || "";
    const error = execution.logs.stderr.join("\n").trim() || "";

    // Kiểm tra có kết quả matplotlib không
    const images = (execution.results || [])
      .filter((result) => result.png)
      .map((result) => result.png);

    return NextResponse.json({
      output: error ? error : output,
      images: images,
    });
  } catch (error) {
    console.error("Lỗi khi thực thi mã Python:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Lỗi không xác định",
      },
      { status: 500 }
    );
  }
}
