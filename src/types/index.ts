export interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  images?: {
    url: string;
    data: string; // Base64 string của ảnh
  }[];
  files?: {
    name: string;
    type: string;
    data: string; // Base64 string của file
  }[];
  videos?: {
    url: string;
    data: string; // Base64 string của video
  }[];
}

export interface ChatHistory {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  provider: string;
}
