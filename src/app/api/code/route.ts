import { Sandbox } from "@e2b/code-interpreter";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Đọc request.json() một lần duy nhất
    const { code, language, isTerminalCommand } = await request.json();
    console.log("Received:", { code, language, isTerminalCommand });

    // Lấy API key từ header hoặc env
    const e2bApiKey =
      request.headers.get("X-E2B-API-Key") || process.env.E2B_API_KEY;

    if (!e2bApiKey) {
      throw new Error("E2B API key không được cung cấp");
    }

    const sandbox = await Sandbox.create({
      apiKey: e2bApiKey,
    });

    if (isTerminalCommand) {
      const output = await sandbox.commands.run(code);
      return NextResponse.json({ output: output.stdout });
    } else {
      // Chạy code với language tương ứng
      const execution = await sandbox.runCode(code, {
        language: language === "python" ? undefined : language,
      });

      const output = execution.logs.stdout.join("\n").trim() || "";
      const error = execution.logs.stderr.join("\n").trim() || "";

      // Thêm xử lý cho kết quả matplotlib
      const results = execution.results || [];
      const images = results
        .filter((result) => result.png)
        .map((result) => result.png);

      return NextResponse.json({
        output: error ? error : output,
        images: images,
      });
    }
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Lỗi không xác định" },
      { status: 500 }
    );
  }
}
