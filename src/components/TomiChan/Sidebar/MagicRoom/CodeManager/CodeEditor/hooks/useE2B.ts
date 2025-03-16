import { useState, useCallback } from "react";
import { getApiKey } from "../../../../../../../utils/getApiKey";

export function useE2B() {
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [showOutput, setShowOutput] = useState(false);
  const [isTerminalMode, setIsTerminalMode] = useState(false);

  const clearOutput = useCallback(() => {
    setOutput("");
    setError("");
  }, []);

  const runCommand = useCallback(
    async (command: string) => {
      setIsRunning(true);
      clearOutput();

      try {
        const e2bApiKey = await getApiKey("E2B_API_KEY", "e2b_api_key");

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

      try {
        if (language === "html") {
          const blob = new Blob([code], { type: "text/html" });
          const url = URL.createObjectURL(blob);
          window.open(url, "_blank");
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          setOutput("Đã mở HTML trong tab mới");
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
        } else if (data.output) {
          setOutput(data.output);
        } else {
          setError("Không nhận được kết quả từ server");
        }
      } catch (e) {
        console.error("Error in runCode:", e);
        setError((e as Error).message || "Lỗi khi chạy mã");
      } finally {
        setIsRunning(false);
      }
    },
    [clearOutput]
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
  };
}
