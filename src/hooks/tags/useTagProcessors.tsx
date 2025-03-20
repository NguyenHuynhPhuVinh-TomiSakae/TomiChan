import { Message } from "../../types";
import { useImageProcessor } from "./useImageProcessor";
import { useSearchProcessor } from "./useSearchProcessor";
import { useMagicModeProcessor } from "./useMagicModeProcessor";
import { useCodeManagerProcessor } from "./useCodeManagerProcessor";
import { useMediaViewProcessor } from "./useMediaViewProcessor";
import { useCodeViewProcessor } from "./useCodeViewProcessor";
import { useEmailProcessor } from "./useEmailProcessor";
import { useTVUScheduleProcessor } from "./useTVUScheduleProcessor";
import { useTVUScoreProcessor } from "./useTVUScoreProcessor";
import { useAnimeSearchProcessor } from "./useAnimeSearchProcessor";
import { usePythonExecProcessor } from "./usePythonExecProcessor";

export function useTagProcessors() {
  const { processImageTag } = useImageProcessor();
  const { processSearchTag } = useSearchProcessor();
  const { processMagicModeTag } = useMagicModeProcessor();
  const { processCodeManagerTag } = useCodeManagerProcessor();
  const { processMediaViewTag } = useMediaViewProcessor();
  const { processCodeViewTag } = useCodeViewProcessor();
  const { processEmailTag } = useEmailProcessor();
  const { processTVUScheduleTag } = useTVUScheduleProcessor();
  const { processTVUScoreTag } = useTVUScoreProcessor();
  const { processAnimeSearchTag } = useAnimeSearchProcessor();
  const { processPythonExecTag } = usePythonExecProcessor();

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
    // Kiểm tra xem nội dung có bắt đầu bằng <think> không
    if (content.trim().startsWith("<think>")) {
      // Tìm vị trí kết thúc của thẻ think
      const endThinkIndex = content.indexOf("</think>");
      if (endThinkIndex === -1) return; // Không tìm thấy thẻ đóng

      // Chỉ xử lý phần nội dung sau thẻ </think>
      const contentAfterThink = content.slice(endThinkIndex + 8); // 8 là độ dài của "</think>"

      if (!contentAfterThink.trim()) return; // Nếu không có nội dung sau think thì return

      // Xử lý các tag chỉ cho phần nội dung sau think
      await Promise.all([
        processMagicModeTag(contentAfterThink),
        processMediaViewTag(contentAfterThink),
        processCodeViewTag(contentAfterThink),
        processImageTag(
          contentAfterThink,
          messageId,
          setMessages,
          saveChat,
          chatId,
          model,
          setIsGeneratingImage,
          messageIndex
        ),
        processSearchTag(
          contentAfterThink,
          messageId,
          setMessages,
          setIsSearching,
          sendFollowUpMessage
        ),
        processCodeManagerTag(contentAfterThink),
        processEmailTag(
          contentAfterThink,
          messageId,
          setMessages,
          saveChat,
          chatId,
          model
        ),
        processTVUScheduleTag(
          contentAfterThink,
          messageId,
          setMessages,
          saveChat,
          chatId,
          model
        ),
        processTVUScoreTag(
          contentAfterThink,
          messageId,
          setMessages,
          saveChat,
          chatId,
          model
        ),
        processAnimeSearchTag(
          contentAfterThink,
          messageId,
          setMessages,
          saveChat,
          chatId,
          model,
          setIsSearching
        ),
        processPythonExecTag(
          contentAfterThink,
          messageId,
          setMessages,
          saveChat,
          chatId,
          model
        ),
      ]);
    } else {
      // Nếu không có thẻ think ở đầu, xử lý toàn bộ nội dung như bình thường
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
        processEmailTag(
          content,
          messageId,
          setMessages,
          saveChat,
          chatId,
          model
        ),
        processTVUScheduleTag(
          content,
          messageId,
          setMessages,
          saveChat,
          chatId,
          model
        ),
        processTVUScoreTag(
          content,
          messageId,
          setMessages,
          saveChat,
          chatId,
          model
        ),
        processAnimeSearchTag(
          content,
          messageId,
          setMessages,
          saveChat,
          chatId,
          model,
          setIsSearching
        ),
        processPythonExecTag(
          content,
          messageId,
          setMessages,
          saveChat,
          chatId,
          model
        ),
      ]);
    }
  };

  return { processMessageTags };
}
