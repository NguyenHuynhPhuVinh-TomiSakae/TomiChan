import React from "react";
import {
  IconTerminal2,
  IconX,
  IconMaximize,
  IconMinimize,
  IconTrash,
  IconCode,
} from "@tabler/icons-react";
import Image from "next/image";

interface TerminalProps {
  isRunning: boolean;
  error: string | null;
  output: string;
  isTerminalMode: boolean;
  outputImages: string[];
  showOutput: boolean;
  setShowOutput: (show: boolean) => void;
  setIsTerminalMode: (mode: boolean) => void;
  clearOutput: () => void;
  runCommand: (command: string) => void;
  isExpanded?: boolean;
  setIsExpanded?: (expanded: boolean) => void;
}

export default function Terminal({
  isRunning,
  error,
  output,
  isTerminalMode,
  outputImages,
  showOutput,
  setShowOutput,
  setIsTerminalMode,
  clearOutput,
  runCommand,
  isExpanded = false,
  setIsExpanded = () => {},
}: TerminalProps) {
  if (!showOutput) return null;

  return (
    <div
      className={`absolute bottom-0 left-0 right-0 ${
        isExpanded ? "h-full" : "h-1/3"
      } border-t border-gray-700 flex flex-col bg-black z-10 font-mono transition-all duration-300`}
    >
      <div className="flex justify-between items-center p-2 bg-gray-900 border-b border-gray-700 cursor-pointer">
        <div className="flex items-center gap-2">
          <IconTerminal2 size={16} className="text-gray-400" />
          <h3 className="text-sm text-gray-300">Terminal</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsTerminalMode(!isTerminalMode)}
            className="p-1.5 rounded text-gray-300 hover:bg-gray-800 transition-colors cursor-pointer"
            title={isTerminalMode ? "Code Mode" : "Terminal Mode"}
          >
            {isTerminalMode ? (
              <IconCode size={16} />
            ) : (
              <IconTerminal2 size={16} />
            )}
          </button>
          <button
            onClick={clearOutput}
            className="p-1.5 rounded text-gray-300 hover:bg-gray-800 transition-colors cursor-pointer"
            title="Xóa"
          >
            <IconTrash size={16} />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded text-gray-300 hover:bg-gray-800 transition-colors cursor-pointer"
            title={isExpanded ? "Thu nhỏ" : "Mở rộng"}
          >
            {isExpanded ? (
              <IconMinimize size={16} />
            ) : (
              <IconMaximize size={16} />
            )}
          </button>
          <button
            onClick={() => setShowOutput(false)}
            className="p-1.5 rounded text-gray-300 hover:bg-gray-800 transition-colors cursor-pointer"
            title="Ẩn"
          >
            <IconX size={16} />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-3 text-sm bg-black text-gray-100">
        {isRunning ? (
          <div className="flex items-center gap-2 text-gray-400">
            <div className="animate-spin h-4 w-4 border-2 border-gray-500 border-t-gray-300 rounded-full"></div>
            Đang thực thi...
          </div>
        ) : error ? (
          <div className="text-red-400">
            <span className="text-red-500">Lỗi: </span>
            <span className="whitespace-pre-wrap">{error}</span>
          </div>
        ) : output ? (
          <div className="whitespace-pre-wrap font-mono">
            <span className="text-green-400">$ </span>
            <span className="text-gray-300">{output}</span>
          </div>
        ) : (
          <div className="text-gray-500">Sẵn sàng</div>
        )}
        {isTerminalMode && (
          <div className="mt-2 flex items-center">
            <span className="text-green-400">$ </span>
            <input
              type="text"
              className="flex-1 ml-2 bg-transparent border-none outline-none text-gray-300"
              placeholder="Nhập lệnh..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const command = e.currentTarget.value;
                  if (command) {
                    runCommand(command);
                    e.currentTarget.value = "";
                  }
                }
              }}
            />
          </div>
        )}

        {outputImages.length > 0 && (
          <div className="mt-4 space-y-4">
            {outputImages.map((imageBase64, index) => (
              <div key={index} className="border border-gray-700 rounded p-2">
                <Image
                  src={`data:image/png;base64,${imageBase64}`}
                  alt={`Plot ${index + 1}`}
                  className="max-w-full h-auto"
                  width={500}
                  height={500}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
