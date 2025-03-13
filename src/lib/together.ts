import Together from "together-ai";
import { getLocalStorage } from "../utils/localStorage";
import { getApiKey } from "../utils/getApiKey";

export function getTogetherConfig() {
  const imageConfig = getLocalStorage("image_config", null);
  const config = imageConfig
    ? JSON.parse(imageConfig)
    : {
        width: 1024,
        height: 768,
        steps: 4,
        togetherApiKey: "",
      };
  return config;
}

export function extractImagePrompt(content: string) {
  const match = content.match(/\[IMAGE_PROMPT\](.*?)\[\/IMAGE_PROMPT\]/);
  return match ? match[1].trim() : null;
}

export async function generateImage(prompt: string) {
  const config = getTogetherConfig();
  const apiKey = await getApiKey("together", "together_api_key");

  if (!apiKey && !config.togetherApiKey) {
    throw new Error("Vui lòng cấu hình Together API Key trong phần cài đặt");
  }

  try {
    const together = new Together({ apiKey: apiKey || config.togetherApiKey });

    const response = await together.images.create({
      model: "black-forest-labs/FLUX.1-schnell-Free",
      prompt: prompt,
      width: config.width,
      height: config.height,
      steps: config.steps,
      n: 1,
      response_format: "base64",
    });

    return response.data[0].b64_json;
  } catch (error) {
    console.error("Together API error:", error);
    throw new Error("Lỗi khi tạo ảnh từ Together AI");
  }
}
