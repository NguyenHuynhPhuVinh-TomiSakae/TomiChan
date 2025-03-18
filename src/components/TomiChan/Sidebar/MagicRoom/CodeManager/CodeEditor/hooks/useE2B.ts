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

  // Hàm kiểm tra và tạo thư mục trên E2B
  const createOrCheckDirectory = useCallback(async (directoryName: string) => {
    try {
      const e2bApiKey = await getApiKey("e2b", "e2b_api_key");

      // Kiểm tra xem thư mục đã tồn tại chưa
      const checkResponse = await fetch("/api/file/checkDirectory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-E2B-API-Key": e2bApiKey,
        },
        body: JSON.stringify({ directoryPath: directoryName }),
      });

      const checkData = await checkResponse.json();

      // Nếu thư mục chưa tồn tại, tạo mới
      if (!checkData.exists) {
        const createResponse = await fetch("/api/file/createDirectory", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-E2B-API-Key": e2bApiKey,
          },
          body: JSON.stringify({ directoryPath: directoryName }),
        });

        return await createResponse.json();
      }

      return checkData;
    } catch (e) {
      console.error("Lỗi khi kiểm tra/tạo thư mục:", e);
      throw e;
    }
  }, []);

  // Hàm xóa thư mục trên E2B
  const deleteDirectory = useCallback(async (directoryName: string) => {
    try {
      const e2bApiKey = await getApiKey("e2b", "e2b_api_key");

      const response = await fetch("/api/file/deleteDirectory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-E2B-API-Key": e2bApiKey,
        },
        body: JSON.stringify({ directoryPath: directoryName }),
      });

      return await response.json();
    } catch (e) {
      console.error("Lỗi khi xóa thư mục:", e);
      throw e;
    }
  }, []);

  // Hàm đổi tên thư mục trên E2B
  const renameDirectory = useCallback(
    async (oldDirectoryPath: string, newDirectoryPath: string) => {
      try {
        const e2bApiKey = await getApiKey("e2b", "e2b_api_key");

        const response = await fetch("/api/file/renameDirectory", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-E2B-API-Key": e2bApiKey,
          },
          body: JSON.stringify({ oldDirectoryPath, newDirectoryPath }),
        });

        return await response.json();
      } catch (e) {
        console.error("Lỗi khi đổi tên thư mục:", e);
        throw e;
      }
    },
    []
  );

  // Hàm đổi tên file trên E2B
  const renameFile = useCallback(
    async (oldFilePath: string, newFilePath: string) => {
      try {
        const e2bApiKey = await getApiKey("e2b", "e2b_api_key");

        const response = await fetch("/api/file/renameFile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-E2B-API-Key": e2bApiKey,
          },
          body: JSON.stringify({ oldFilePath, newFilePath }),
        });

        return await response.json();
      } catch (e) {
        console.error("Lỗi khi đổi tên file:", e);
        throw e;
      }
    },
    []
  );

  // Hàm tải file lên E2B
  const uploadFile = useCallback(
    async (filePath: string, content: string, projectName?: string) => {
      try {
        const e2bApiKey = await getApiKey("e2b", "e2b_api_key");

        // Nếu có projectName, tạo thư mục cho project trước
        if (projectName) {
          await createOrCheckDirectory(projectName);
          filePath = `${projectName}/${filePath}`;
        }

        const response = await fetch("/api/file/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-E2B-API-Key": e2bApiKey,
          },
          body: JSON.stringify({ filePath, content }),
        });

        return await response.json();
      } catch (e) {
        console.error("Lỗi khi tải file lên E2B:", e);
        throw e;
      }
    },
    [createOrCheckDirectory]
  );

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

  const runCode = useCallback(
    async (code: string, language: string) => {
      setIsRunning(true);
      clearOutput();
      setShowOutput(true);
      setOutputImages([]);

      try {
        if (language === "html") {
          // Xử lý HTML với các dependencies
          const processedHtml = await processHtmlWithDependencies(code);

          // Tạo blob và mở trong tab mới
          const blob = new Blob([processedHtml], { type: "text/html" });
          const url = URL.createObjectURL(blob);
          window.open(url, "_blank");
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          setOutput(
            "Đã mở HTML trong tab mới (với các file CSS và JS đã nhúng)"
          );
          return;
        }

        const e2bApiKey = await getApiKey("e2b", "e2b_api_key");

        const response = await fetch("/api/code", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-E2B-API-Key": e2bApiKey,
          },
          body: JSON.stringify({ code, language }),
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
    uploadFile,
    createOrCheckDirectory,
    deleteDirectory,
    renameFile,
    renameDirectory,
  };
}
