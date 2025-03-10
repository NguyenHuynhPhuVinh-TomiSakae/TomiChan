/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useRef, useEffect } from "react";
import {
  IconChevronDown,
  IconAdjustmentsHorizontal,
} from "@tabler/icons-react";
import Image from "next/image";
import ProviderSettingsModal from "../ProviderSettings/ProviderSettingsModal";
import { getLocalStorage, setLocalStorage } from "../../utils/localStorage";

export default function Header({ isCollapsed }: { isCollapsed: boolean }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(() => {
    return getLocalStorage("selected_provider", "google");
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const providers = [
    { id: "google", name: "Google", icon: "/google-logo.svg" },
    { id: "groq", name: "Groq", icon: "/groq-logo.svg", disabled: true },
  ];

  const handleProviderSelect = (providerId: string) => {
    setSelectedProvider(providerId);
    setLocalStorage("selected_provider", providerId);
    setIsDropdownOpen(false);
  };

  return (
    <>
      <div
        className="fixed top-0 right-0 left-64 bg-white dark:bg-black text-black dark:text-white z-10 transition-all duration-300"
        style={{ left: isCollapsed ? "64px" : "256px" }}
      >
        <div className="w-full p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative" ref={dropdownRef}>
              <button
                className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-black flex items-center gap-2 cursor-pointer"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
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
                {providers.find((p) => p.id === selectedProvider)?.name}
                <IconChevronDown size={16} />
              </button>

              {isDropdownOpen && (
                <div className="absolute mt-1 w-48 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg">
                  {providers.map((provider) => (
                    <button
                      key={provider.id}
                      className={`w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer ${
                        provider.disabled
                          ? "opacity-50 cursor-not-allowed hover:bg-transparent dark:hover:bg-transparent"
                          : ""
                      }`}
                      onClick={() =>
                        !provider.disabled && handleProviderSelect(provider.id)
                      }
                      disabled={provider.disabled}
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
                      {provider.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            className="py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg cursor-pointer transition-colors flex items-center gap-2"
            onClick={() => setIsModalOpen(true)}
          >
            <IconAdjustmentsHorizontal size={20} />
            Cài đặt AI
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
