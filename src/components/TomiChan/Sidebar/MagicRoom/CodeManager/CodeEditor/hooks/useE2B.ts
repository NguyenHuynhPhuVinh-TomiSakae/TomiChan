/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from "react";
import { getApiKey } from "../../../../../../../utils/getApiKey";
import { chatDB } from "../../../../../../../utils/db";

export function useE2B() {
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [showOutput, setShowOutput] = useState(false);
  const [isTerminalMode, setIsTerminalMode] = useState(false);
  const [outputImages, setOutputImages] = useState<string[]>([]);

  const clearOutput = useCallback(() => {
    setOutput("");
    setError("");
  }, []);

  // Hàm để tìm và nhúng các file CSS và JS vào HTML
  const processHtmlWithDependencies = useCallback(async (htmlCode: string) => {
    try {
      // Tìm tất cả các thẻ link CSS
      const cssLinks =
        htmlCode.match(/<link[^>]*href=["']([^"']+\.css)["'][^>]*>/g) || [];
      const cssFiles = cssLinks
        .map((link) => {
          const match = link.match(/href=["']([^"']+\.css)["']/);
          return match ? match[1] : null;
        })
        .filter(Boolean);

      // Tìm tất cả các thẻ script JS
      const scriptTags =
        htmlCode.match(/<script[^>]*src=["']([^"']+\.js)["'][^>]*>/g) || [];
      const jsFiles = scriptTags
        .map((script) => {
          const match = script.match(/src=["']([^"']+\.js)["']/);
          return match ? match[1] : null;
        })
        .filter(Boolean);

      let processedHtml = htmlCode;

      // Xử lý các file CSS
      for (const cssFile of cssFiles) {
        try {
          // Tìm file CSS trong database
          const allFiles = await chatDB.getAllCodeFiles();
          const cssFileObj = allFiles.find(
            (f) => f.name === cssFile || f.name.endsWith(`/${cssFile}`)
          );

          if (cssFileObj) {
            // Thay thế link bằng style inline
            const styleTag = `<style>\n${cssFileObj.content}\n</style>`;
            processedHtml = processedHtml.replace(
              new RegExp(
                `<link[^>]*href=["']${cssFile?.replace(
                  /[.*+?^${}()|[\]\\]/g,
                  "\\$&"
                )}["'][^>]*>`,
                "g"
              ),
              styleTag
            );
          }
        } catch (e) {
          console.error(`Lỗi khi xử lý file CSS ${cssFile}:`, e);
        }
      }

      // Xử lý các file JS
      for (const jsFile of jsFiles) {
        try {
          // Tìm file JS trong database
          const allFiles = await chatDB.getAllCodeFiles();
          const jsFileObj = allFiles.find(
            (f) => f.name === jsFile || f.name.endsWith(`/${jsFile}`)
          );

          if (jsFileObj) {
            // Thay thế script src bằng script inline
            const scriptTag = `<script>\n${jsFileObj.content}\n</script>`;
            processedHtml = processedHtml.replace(
              new RegExp(
                `<script[^>]*src=["']${jsFile?.replace(
                  /[.*+?^${}()|[\]\\]/g,
                  "\\$&"
                )}["'][^>]*></script>`,
                "g"
              ),
              scriptTag
            );
          }
        } catch (e) {
          console.error(`Lỗi khi xử lý file JS ${jsFile}:`, e);
        }
      }

      return processedHtml;
    } catch (e) {
      console.error("Lỗi khi xử lý HTML:", e);
      return htmlCode; // Trả về HTML gốc nếu có lỗi
    }
  }, []);

  const runCommand = useCallback(
    async (command: string) => {
      setIsRunning(true);
      clearOutput();

      try {
        const e2bApiKey = await getApiKey("e2b", "e2b_api_key");

        const response = await fetch("/api/code", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-E2B-API-Key": e2bApiKey,
          },
          body: JSON.stringify({ code: command, isTerminalCommand: true }),
        });

        const data = await response.json();
        if (data.error) {
          setError(data.error);
        } else {
          setOutput(data.output);
        }
      } catch (e) {
        setError((e as Error).message || "Lỗi khi chạy lệnh");
      } finally {
        setIsRunning(false);
      }
    },
    [clearOutput]
  );

  // Thêm hàm để chuẩn bị dữ liệu project
  const prepareProjectData = async (projectId: string) => {
    const allFiles = await chatDB.getAllCodeFiles();
    const allFolders = await chatDB.getAllFolders();

    const projectFiles = allFiles.filter((f) => f.projectId === projectId);
    const projectFolders = allFolders.filter((f) => f.projectId === projectId);

    return {
      files: projectFiles,
      folders: projectFolders,
      projectId: projectId,
    };
  };

  const runCode = useCallback(
    async (code: string, language: string, projectId?: string) => {
      setIsRunning(true);
      clearOutput();
      setShowOutput(true);
      setOutputImages([]);

      try {
        // Chuẩn bị dữ liệu project nếu cần
        const projectData = projectId
          ? await prepareProjectData(projectId)
          : null;

        const e2bApiKey = await getApiKey("e2b", "e2b_api_key");

        if (language === "html") {
          if (projectId) {
            // Chạy dự án web trên E2B
            const response = await fetch("/api/code", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-E2B-API-Key": e2bApiKey,
              },
              body: JSON.stringify({
                code,
                language: "html",
                projectData,
                isWebProject: true,
              }),
            });

            const data = await response.json();
            if (data.error) {
              setError(data.error);
            } else if (data.webUrl) {
              // Thử truy cập URL vài lần trước khi mở tab mới
              let attempts = 0;
              const maxAttempts = 5;
              const checkUrl = async () => {
                try {
                  attempts++;
                  // Thông báo rằng đang chờ server
                  setOutput(
                    `Đang chờ server khởi động (${attempts}/${maxAttempts})...`
                  );

                  // Thử mở tab mới
                  window.open(data.webUrl, "_blank");
                  setOutput(`Đã mở dự án web trong tab mới: ${data.webUrl}`);
                } catch (err) {
                  console.error("Lỗi khi mở URL:", err);

                  if (attempts < maxAttempts) {
                    // Thử lại sau 1 giây
                    setTimeout(checkUrl, 1000);
                  } else {
                    setOutput(
                      `Không thể kết nối đến server. Vui lòng thử mở URL thủ công: ${data.webUrl}`
                    );
                  }
                }
              };

              // Bắt đầu kiểm tra URL
              checkUrl();
            } else {
              setOutput(data.output || "");
            }
          } else {
            // Vẫn giữ cách xử lý cũ cho các file HTML đơn lẻ không thuộc project
            const processedHtml = await processHtmlWithDependencies(code);
            const blob = new Blob([processedHtml], { type: "text/html" });
            const url = URL.createObjectURL(blob);
            window.open(url, "_blank");
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            setOutput(
              "Đã mở HTML trong tab mới (với các file CSS và JS đã nhúng)"
            );
          }
          setIsRunning(false);
          return;
        }

        const response = await fetch("/api/code", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-E2B-API-Key": e2bApiKey,
          },
          body: JSON.stringify({
            code,
            language,
            projectData,
          }),
        });

        const data = await response.json();

        if (data.error) {
          setError(data.error);
        } else {
          setOutput(data.output || "");
          if (data.images && data.images.length > 0) {
            setOutputImages(data.images);
          }
        }
      } catch (e) {
        console.error("Error in runCode:", e);
        setError((e as Error).message || "Lỗi khi chạy mã");
      } finally {
        setIsRunning(false);
      }
    },
    [clearOutput, processHtmlWithDependencies]
  );

  return {
    runCode,
    runCommand,
    isRunning,
    output,
    error,
    clearOutput,
    showOutput,
    setShowOutput,
    isTerminalMode,
    setIsTerminalMode,
    outputImages,
    setOutputImages,
  };
}
