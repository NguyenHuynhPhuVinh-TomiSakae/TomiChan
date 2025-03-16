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
  audios?: {
    url: string;
    data: string; // Base64 string của audio
  }[];
  isFollowUpSearch?: boolean;
}

export interface ChatHistory {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  provider: string;
}

export interface CodeFile {
  id: string;
  name: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  language: string;
  folderId?: string | null | undefined; // thêm trường này
}

export interface CodeFolder {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  parentId?: string | null | undefined; // thêm trường này
}
