import { Sandbox } from "@e2b/code-interpreter";
import { NextResponse } from "next/server";
import { CodeFile } from "@/types";

export async function POST(request: Request) {
  try {
    const { code, language, isTerminalCommand, projectData } =
      await request.json();
    console.log("Received:", { code, language, isTerminalCommand });

    const e2bApiKey =
      request.headers.get("X-E2B-API-Key") || process.env.E2B_API_KEY;
    if (!e2bApiKey) {
      throw new Error("E2B API key không được cung cấp");
    }

    const sandbox = await Sandbox.create({ apiKey: e2bApiKey });

    // Upload project files nếu có
    let projectPath = "/home/user";

    if (projectData) {
      try {
        // Kiểm tra projectId
        const projectId = projectData.projectId;

        if (!projectId) {
          console.error("projectId là undefined:", projectData);
          throw new Error("projectId không được cung cấp trong projectData");
        }

        const { files, folders } = projectData;
        projectPath = `/home/user/project_${projectId}`;

        console.log(
          `Đang upload project ${projectId} lên đường dẫn ${projectPath}`
        );

        // Tạo thư mục project nếu chưa tồn tại
        try {
          await sandbox.files.makeDir(projectPath);
          console.log(`Đã tạo thư mục: ${projectPath}`);
        } catch (dirError) {
          console.error(`Lỗi khi tạo thư mục project: ${dirError}`);
          // Nếu thư mục đã tồn tại, không sao cả, tiếp tục xử lý
        }

        // Upload files ở thư mục gốc của project
        const rootFiles = files.filter((f: CodeFile) => !f.folderId);
        console.log(`Số lượng root files: ${rootFiles.length}`);

        for (const file of rootFiles) {
          try {
            await sandbox.files.write(
              `${projectPath}/${file.name}`,
              file.content
            );
            console.log(`Đã upload file: ${projectPath}/${file.name}`);
          } catch (fileError) {
            console.error(`Lỗi khi upload file ${file.name}: ${fileError}`);
            throw new Error(
              `Lỗi khi upload file ${file.name}: ${
                (fileError as Error).message
              }`
            );
          }
        }

        // Upload files trong các thư mục
        for (const folder of folders) {
          const folderPath = `${projectPath}/${folder.name}`;
          try {
            await sandbox.files.makeDir(folderPath);
            console.log(`Đã tạo thư mục: ${folderPath}`);
          } catch (folderError) {
            console.error(`Lỗi khi tạo thư mục ${folder.name}: ${folderError}`);
            // Nếu thư mục đã tồn tại, không sao
          }

          const filesInFolder = files.filter(
            (f: CodeFile) => f.folderId === folder.id
          );

          for (const file of filesInFolder) {
            try {
              await sandbox.files.write(
                `${folderPath}/${file.name}`,
                file.content
              );
              console.log(`Đã upload file: ${folderPath}/${file.name}`);
            } catch (fileError) {
              console.error(
                `Lỗi khi upload file ${file.name} vào thư mục ${folder.name}: ${fileError}`
              );
              throw new Error(
                `Lỗi khi upload file ${file.name} vào thư mục ${folder.name}: ${
                  (fileError as Error).message
                }`
              );
            }
          }
        }
      } catch (projectError) {
        console.error("Lỗi khi xử lý project files:", projectError);
        throw new Error(
          `Lỗi khi xử lý project files: ${(projectError as Error).message}`
        );
      }
    }

    if (isTerminalCommand) {
      const output = await sandbox.commands.run(code, {
        cwd: projectData ? projectPath : undefined,
      });
      return NextResponse.json({ output: output.stdout });
    } else {
      let output = "";
      let error = "";
      let images: (string | undefined)[] = [];

      if (projectData) {
        // Khi có projectData, chạy code trong thư mục project bằng cách:
        // 1. Tạo file tạm thời chứa code
        // 2. Chạy file đó với lệnh tương ứng với ngôn ngữ
        const tempFileName = `temp_code_${Date.now()}.${language || "py"}`;
        const tempFilePath = `${projectPath}/${tempFileName}`;

        try {
          // Tạo file tạm thời chứa code
          await sandbox.files.write(tempFilePath, code);

          let cmdResult;
          if (!language || language === "python") {
            cmdResult = await sandbox.commands.run(`python ${tempFileName}`, {
              cwd: projectPath,
            });
          } else if (language === "javascript" || language === "js") {
            cmdResult = await sandbox.commands.run(`node ${tempFileName}`, {
              cwd: projectPath,
            });
          } else {
            // Xử lý các ngôn ngữ khác nếu cần
            throw new Error(
              `Ngôn ngữ ${language} không được hỗ trợ khi chạy trong project`
            );
          }

          output = cmdResult.stdout;
          error = cmdResult.stderr;

          // Xóa file tạm sau khi chạy xong
          try {
            await sandbox.files.remove(tempFilePath);
          } catch (removeError) {
            console.warn(
              `Không thể xóa file tạm: ${tempFilePath}`,
              removeError
            );
          }
        } catch (runError) {
          error = (runError as Error).message;
        }
      } else {
        // Khi không có projectData, sử dụng runCode như bình thường
        const execution = await sandbox.runCode(code, {
          language: language === "python" ? undefined : language,
        });

        output = execution.logs.stdout.join("\n").trim() || "";
        error = execution.logs.stderr.join("\n").trim() || "";

        // Xử lý cho kết quả matplotlib
        const results = execution.results || [];
        images = results
          .filter((result) => result.png)
          .map((result) => result.png);
      }

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
