import React from "react";
import GoogleSettings from "./GoogleSettings";
import GroqSettings from "./GroqSettings";

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
  if (!isOpen) return null;

  if (selectedProvider === "google") {
    return <GoogleSettings isOpen={isOpen} onClose={onClose} />;
  } else if (selectedProvider === "groq") {
    return <GroqSettings isOpen={isOpen} onClose={onClose} />;
  }

  return null;
}
