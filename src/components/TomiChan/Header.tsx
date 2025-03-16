/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, Fragment, useEffect } from "react";
import {
  IconChevronDown,
  IconAdjustmentsHorizontal,
  IconLayoutSidebarLeftCollapse,
} from "@tabler/icons-react";
import Image from "next/image";
import { Menu, Transition } from "@headlessui/react";
import ProviderSettingsModal from "../ProviderSettings/ProviderSettingsModal";
import { getLocalStorage, setLocalStorage } from "../../utils/localStorage";

export default function Header({
  isCollapsed,
  isMobile,
  onToggleCollapse,
  onProviderChange,
  selectedProvider: propSelectedProvider,
  isMagicMode,
}: {
  isCollapsed: boolean;
  isMobile: boolean;
  onToggleCollapse: () => void;
  onProviderChange?: (provider: string) => void;
  selectedProvider?: string;
  isMagicMode: boolean;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(() => {
    return (
      propSelectedProvider || getLocalStorage("selected_provider", "google")
    );
  });

  useEffect(() => {
    if (propSelectedProvider && propSelectedProvider !== selectedProvider) {
      setSelectedProvider(propSelectedProvider);
    }
  }, [propSelectedProvider, selectedProvider]);

  const providers = [
    { id: "google", name: "Google", icon: "/google-logo.svg" },
    { id: "groq", name: "Groq", icon: "/groq-logo.svg", disabled: false },
    {
      id: "openrouter",
      name: "OpenRouter",
      icon: "/openrouter-logo.png",
      disabled: false,
    },
  ];

  const handleProviderSelect = (providerId: string) => {
    setSelectedProvider(providerId);
    setLocalStorage("selected_provider", providerId);
    if (onProviderChange) {
      onProviderChange(providerId);
    }
  };

  return (
    <>
      <div
        className="fixed top-0 right-0 z-10 bg-white dark:bg-black text-black dark:text-white transition-all duration-300"
        style={{
          left: isMobile
            ? 0
            : isCollapsed
            ? "64px"
            : isMagicMode
            ? "70vw" // Điều chỉnh left margin khi ở chế độ magic
            : "256px",
        }}
      >
        <div className="w-full p-2 sm:p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {isMobile && (
              <button
                onClick={onToggleCollapse}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full cursor-pointer flex-shrink-0"
              >
                <IconLayoutSidebarLeftCollapse
                  size={24}
                  className={isCollapsed ? "rotate-180" : ""}
                />
              </button>
            )}
            <Menu as="div" className="relative">
              <Menu.Button className="px-4 py-2 rounded-lg text-sm bg-white dark:bg-black flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900 border border-black dark:border-white transition-all duration-200">
                <Image
                  src={
                    providers.find((p) => p.id === selectedProvider)?.icon ||
                    "/google-logo.svg"
                  }
                  alt={selectedProvider}
                  className="w-5 h-5"
                  width={20}
                  height={20}
                />
                <span className="font-medium">
                  {providers.find((p) => p.id === selectedProvider)?.name}
                </span>
                <IconChevronDown size={16} className="text-gray-500" />
              </Menu.Button>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-75"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-50"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute mt-2 w-52 bg-white dark:bg-black border border-black dark:border-white rounded-xl z-10 focus:outline-none overflow-hidden backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
                  <div className="px-4 py-3 border-b border-black dark:border-white">
                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Chọn Nhà Cung Cấp AI
                    </div>
                  </div>
                  {providers.map((provider) => (
                    <Menu.Item key={provider.id}>
                      {({ active }) => (
                        <button
                          className={`w-full px-4 py-3 text-left flex items-center gap-3 ${
                            active ? "bg-gray-100 dark:bg-gray-800" : ""
                          } ${
                            provider.id === selectedProvider
                              ? "bg-blue-50 dark:bg-blue-900/20"
                              : ""
                          } ${
                            provider.disabled
                              ? "opacity-50 cursor-not-allowed"
                              : "cursor-pointer"
                          } transition-colors duration-150`}
                          onClick={() =>
                            !provider.disabled &&
                            handleProviderSelect(provider.id)
                          }
                          disabled={provider.disabled}
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                              provider.id === selectedProvider
                                ? "bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800"
                                : "bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700"
                            }`}
                          >
                            <Image
                              src={provider.icon}
                              alt={provider.name}
                              className={`w-5 h-5 ${
                                provider.disabled ? "opacity-50" : ""
                              }`}
                              width={20}
                              height={20}
                            />
                          </div>
                          <div className="flex flex-col">
                            <span
                              className={`font-medium ${
                                provider.id === selectedProvider
                                  ? "text-blue-600 dark:text-blue-400"
                                  : ""
                              }`}
                            >
                              {provider.name}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {provider.id === "google" && "Đa Phương Tiện"}
                              {provider.id === "groq" && "Phản Hồi Nhanh"}
                              {provider.id === "openrouter" && "Nhiều Mô Hình"}
                            </span>
                          </div>
                          {provider.id === selectedProvider && (
                            <div className="ml-auto w-2 h-2 rounded-full bg-blue-500"></div>
                          )}
                        </button>
                      )}
                    </Menu.Item>
                  ))}
                </Menu.Items>
              </Transition>
            </Menu>
          </div>

          <button
            className="py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg cursor-pointer transition-colors flex items-center gap-2"
            onClick={() => setIsModalOpen(true)}
          >
            <IconAdjustmentsHorizontal size={20} />
            {isMagicMode ? "" : "Cài đặt AI"}
          </button>
        </div>
      </div>

      <ProviderSettingsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedProvider={selectedProvider}
      />
    </>
  );
}
