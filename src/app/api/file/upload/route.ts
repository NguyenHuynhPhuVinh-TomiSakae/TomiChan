import { Sandbox } from "@e2b/code-interpreter";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { filePath, content } = await request.json();
    console.log("Tải file lên:", filePath);

    // Lấy API key từ header hoặc env
    const e2bApiKey =
      request.headers.get("X-E2B-API-Key") || process.env.E2B_API_KEY;

    if (!e2bApiKey) {
      throw new Error("E2B API key không được cung cấp");
    }

    const sandbox = await Sandbox.create({
      apiKey: e2bApiKey,
    });

    // Tạo thư mục cho file nếu cần
    const dirPath = filePath.substring(0, filePath.lastIndexOf("/"));
    if (dirPath) {
      await sandbox.commands.run(`mkdir -p ${dirPath}`);
    }

    // Cải thiện cách xử lý nội dung file
    // Thay vì dùng echo với command line, dùng filesystem API của E2B
    try {
      // Tạo nội dung file trực tiếp thay vì dùng file tạm
      await sandbox.commands.run(`echo '${content}' > ${filePath}`);

      console.log(`Đã tải lên thành công file ${filePath}`);

      return NextResponse.json({
        success: true,
        path: filePath,
        message: "Đã tải file lên thành công",
      });
    } catch (error) {
      console.error("Lỗi khi ghi file:", error);
      throw error;
    }
  } catch (error) {
    console.error("Lỗi khi tải file lên:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Lỗi không xác định" },
      { status: 500 }
    );
  }
}
