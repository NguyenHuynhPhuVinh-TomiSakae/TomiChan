import { Message } from "../../types";
import { useImageProcessor } from "./useImageProcessor";
import { useSearchProcessor } from "./useSearchProcessor";
import { useMagicModeProcessor } from "./useMagicModeProcessor";
import { useCodeManagerProcessor } from "./useCodeManagerProcessor";
import { useMediaViewProcessor } from "./useMediaViewProcessor";
import { useCodeViewProcessor } from "./useCodeViewProcessor";

export function useTagProcessors() {
  const { processImageTag } = useImageProcessor();
  const { processSearchTag } = useSearchProcessor();
  const { processMagicModeTag } = useMagicModeProcessor();
  const { processCodeManagerTag } = useCodeManagerProcessor();
  const { processMediaViewTag } = useMediaViewProcessor();
  const { processCodeViewTag } = useCodeViewProcessor();

  const processMessageTags = async (
    content: string,
    messageId: string,
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
    saveChat: (messages: Message[], chatId?: string, model?: string) => void,
    chatId?: string,
    model?: string,
    setIsGeneratingImage?: React.Dispatch<React.SetStateAction<boolean>>,
    setIsSearching?: React.Dispatch<React.SetStateAction<boolean>>,
    messageIndex?: number,
    sendFollowUpMessage?: (searchResults: string) => Promise<void>
  ) => {
    // Xử lý các tag theo thứ tự
    await Promise.all([
      processMagicModeTag(content),
      processMediaViewTag(content),
      processCodeViewTag(content),
      processImageTag(
        content,
        messageId,
        setMessages,
        saveChat,
        chatId,
        model,
        setIsGeneratingImage,
        messageIndex
      ),
      processSearchTag(
        content,
        messageId,
        setMessages,
        setIsSearching,
        sendFollowUpMessage
      ),
      processCodeManagerTag(content),
    ]);
  };

  return { processMessageTags };
}
