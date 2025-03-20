import React, { useState } from "react";
import ModalWrapper from "../../ProviderSettings/ModalWrapper";
import FeatureSettings from "./FeatureSettings";
import AppearanceSettings from "./AppearanceSettings";
import PromptEnhancementSettings from "./PromptEnhancementSettings";
import {
  IconBrush,
  IconSettings,
  IconWand,
  IconChevronRight,
} from "@tabler/icons-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: "light" | "dark" | "system";
  onThemeChange: (theme: "light" | "dark" | "system") => void;
  imageGeneration: boolean;
  onImageGenerationChange: (enabled: boolean) => void;
  imageConfig: {
    width: number;
    height: number;
    steps: number;
    togetherApiKey?: string;
  };
  onImageConfigChange: (config: {
    width: number;
    height: number;
    steps: number;
    togetherApiKey?: string;
  }) => void;
  searchEnabled: boolean;
  onSearchEnabledChange: (enabled: boolean) => void;
  searchConfig: {
    googleApiKey?: string;
    googleCseId?: string;
    numResults?: number;
    deepSearch?: boolean;
  };
  onSearchConfigChange: (config: {
    googleApiKey?: string;
    googleCseId?: string;
    numResults?: number;
    deepSearch?: boolean;
  }) => void;
  onClearAllData?: () => void;
  e2bApiKey?: string;
  onE2bApiKeyChange: (apiKey: string) => void;
  e2bEnabled: boolean;
  onE2bEnabledChange: (enabled: boolean) => void;
}

type SettingType = "features" | "appearance" | "prompt";

export default function SettingsModalNew({
  isOpen,
  onClose,
  theme,
  onThemeChange,
  imageGeneration,
  onImageGenerationChange,
  imageConfig,
  onImageConfigChange,
  searchEnabled,
  onSearchEnabledChange,
  searchConfig,
  onSearchConfigChange,
  onClearAllData,
  e2bApiKey,
  onE2bApiKeyChange,
  e2bEnabled,
  onE2bEnabledChange,
}: SettingsModalProps) {
  const [activeSetting, setActiveSetting] = useState<SettingType | null>(null);

  if (!isOpen) return null;

  const settings = [
    {
      id: "features",
      title: "Tính năng",
      description:
        "Cài đặt các tính năng như tạo ảnh, tìm kiếm web và thực thi mã",
      icon: <IconSettings size={20} />,
      component: (
        <FeatureSettings
          imageGeneration={imageGeneration}
          onImageGenerationChange={onImageGenerationChange}
          imageConfig={imageConfig}
          onImageConfigChange={onImageConfigChange}
          searchEnabled={searchEnabled}
          onSearchEnabledChange={onSearchEnabledChange}
          searchConfig={searchConfig}
          onSearchConfigChange={onSearchConfigChange}
          e2bApiKey={e2bApiKey}
          onE2bApiKeyChange={onE2bApiKeyChange}
          e2bEnabled={e2bEnabled}
          onE2bEnabledChange={onE2bEnabledChange}
        />
      ),
    },
    {
      id: "appearance",
      title: "Giao diện & Dữ liệu",
      description: "Tùy chỉnh giao diện và quản lý dữ liệu ứng dụng",
      icon: <IconBrush size={20} />,
      component: (
        <AppearanceSettings
          theme={theme}
          onThemeChange={onThemeChange}
          onClearAllData={onClearAllData}
        />
      ),
    },
    {
      id: "prompt",
      title: "Cường hóa Prompt",
      description: "Cài đặt và tùy chỉnh tính năng cường hóa prompt",
      icon: <IconWand size={20} />,
      component: <PromptEnhancementSettings />,
    },
  ];

  return (
    <>
      <ModalWrapper
        isOpen={isOpen}
        onClose={onClose}
        title="Cài đặt"
        maxWidth="xl"
      >
        <div className="space-y-2">
          {settings.map((setting) => (
            <button
              key={setting.id}
              onClick={() => setActiveSetting(setting.id as SettingType)}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  {setting.icon}
                </div>
                <div className="text-left">
                  <h3 className="font-medium">{setting.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {setting.description}
                  </p>
                </div>
              </div>
              <IconChevronRight size={20} className="text-gray-400" />
            </button>
          ))}
        </div>
      </ModalWrapper>

      {activeSetting && (
        <ModalWrapper
          isOpen={!!activeSetting}
          onClose={() => setActiveSetting(null)}
          title={settings.find((s) => s.id === activeSetting)?.title || ""}
          maxWidth="md"
        >
          {settings.find((s) => s.id === activeSetting)?.component}
        </ModalWrapper>
      )}
    </>
  );
}
