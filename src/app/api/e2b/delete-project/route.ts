import { Sandbox } from "@e2b/code-interpreter";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { projectId } = await request.json();
    const e2bApiKey =
      request.headers.get("X-E2B-API-Key") || process.env.E2B_API_KEY;

    if (!e2bApiKey) {
      throw new Error("E2B API key không được cung cấp");
    }

    const sandbox = await Sandbox.create({ apiKey: e2bApiKey });

    // Xóa thư mục của project cụ thể
    await sandbox.files.remove(`/home/user/project_${projectId}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Lỗi không xác định" },
      { status: 500 }
    );
  }
}
