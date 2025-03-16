import React from "react";
import GoogleSettings from "./GoogleSettings";
import GroqSettings from "./GroqSettings";
import OpenRouterSettings from "./OpenRouterSettings";

interface ProviderSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProvider: string;
}

export default function ProviderSettingsModal({
  isOpen,
  onClose,
  selectedProvider,
}: ProviderSettingsModalProps) {
  return (
    <>
      {selectedProvider === "google" && (
        <GoogleSettings isOpen={isOpen} onClose={onClose} />
      )}
      {selectedProvider === "groq" && (
        <GroqSettings isOpen={isOpen} onClose={onClose} />
      )}
      {selectedProvider === "openrouter" && (
        <OpenRouterSettings isOpen={isOpen} onClose={onClose} />
      )}
    </>
  );
}
