import { Message } from "../../types";
import { useImageProcessor } from "./useImageProcessor";
import { useSearchProcessor } from "./useSearchProcessor";

export function useTagProcessors() {
  const { processImageTag } = useImageProcessor();
  const { processSearchTag } = useSearchProcessor();

  const processMessageTags = (
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
    processImageTag(
      content,
      messageId,
      setMessages,
      saveChat,
      chatId,
      model,
      setIsGeneratingImage,
      messageIndex
    );

    processSearchTag(
      content,
      messageId,
      setMessages,
      setIsSearching,
      sendFollowUpMessage
    );
  };

  return { processMessageTags };
}
