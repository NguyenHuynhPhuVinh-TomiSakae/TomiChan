export interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
}
