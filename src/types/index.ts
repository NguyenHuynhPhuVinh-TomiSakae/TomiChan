export interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
}

export interface ChatHistory {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  provider: string;
}
