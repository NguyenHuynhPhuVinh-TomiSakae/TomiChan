import React, { useState } from "react";
import { IconKey } from "@tabler/icons-react";
import APIKeyModal from "./APIKeyModal";
import { getLocalStorage, setLocalStorage } from "../utils/localStorage";

export default function Header({ isCollapsed }: { isCollapsed: boolean }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(() => {
    return getLocalStorage("selected_model", "gemini-2.0-flash");
  });

  const handleSaveAPIKey = (apiKey: string) => {
    setLocalStorage("api_key", apiKey);
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const model = e.target.value;
    setSelectedModel(model);
    setLocalStorage("selected_model", model);
  };

  return (
    <>
      <div
        className="fixed top-0 right-0 left-64 bg-white dark:bg-black text-black dark:text-white z-10 transition-all duration-300"
        style={{ left: isCollapsed ? "64px" : "256px" }}
      >
        <div className="w-full p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <select
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-black"
              value={selectedModel}
              onChange={handleModelChange}
            >
              <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
              <option value="gemini-2.0-flash-lite">
                Gemini 2.0 Flash Lite
              </option>
            </select>
          </div>

          <button
            className="py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg cursor-pointer transition-colors flex items-center gap-2"
            onClick={() => setIsModalOpen(true)}
          >
            <IconKey size={20} />
            Nhập khóa API
          </button>
        </div>
      </div>

      <APIKeyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAPIKey}
      />
    </>
  );
}
