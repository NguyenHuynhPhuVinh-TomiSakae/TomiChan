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
  sentFiles?: string[];
}

export interface ChatHistory {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  provider: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CodeFile {
  id: string;
  name: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  language: string;
  projectId?: string; // ID của project chứa file này
  folderId?: string | null | undefined;
}

export interface CodeFolder {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  projectId?: string; // ID của project chứa folder này
  parentId?: string | null | undefined;
}
