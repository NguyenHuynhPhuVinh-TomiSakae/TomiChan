import { openDB, DBSchema } from "idb";
import { ChatHistory, CodeFile } from "../types";
import { getLocalStorage } from "./localStorage";

interface ChatDB extends DBSchema {
  chats: {
    key: string;
    value: ChatHistory;
    indexes: { "by-updated": Date };
  };
  codeFiles: {
    key: string;
    value: CodeFile;
    indexes: { "by-updated": Date };
  };
}

class ChatDBManager {
  private readonly DB_NAME = "chat_history";
  private readonly STORE_NAME = "chats";
  private readonly CODE_STORE = "codeFiles";
  private readonly DB_VERSION = 2;

  private async getDB() {
    return openDB<ChatDB>(this.DB_NAME, this.DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("chats")) {
          const store = db.createObjectStore("chats", { keyPath: "id" });
          store.createIndex("by-updated", "updatedAt");
        }

        if (!db.objectStoreNames.contains("codeFiles")) {
          const codeStore = db.createObjectStore("codeFiles", {
            keyPath: "id",
          });
          codeStore.createIndex("by-updated", "updatedAt");
        }
      },
    });
  }

  async saveChat(chat: ChatHistory): Promise<void> {
    const db = await this.getDB();
    if (!chat.provider) {
      chat.provider = getLocalStorage("selected_provider", "google");
    }
    await db.put(this.STORE_NAME, chat);
  }

  async getChat(id: string): Promise<ChatHistory | undefined> {
    const db = await this.getDB();
    return db.get(this.STORE_NAME, id);
  }

  async getAllChats(): Promise<ChatHistory[]> {
    const db = await this.getDB();
    return db.getAllFromIndex(this.STORE_NAME, "by-updated");
  }

  async deleteChat(id: string): Promise<void> {
    const db = await this.getDB();
    await db.delete(this.STORE_NAME, id);
  }

  async saveCodeFile(file: CodeFile): Promise<void> {
    const db = await this.getDB();
    await db.put(this.CODE_STORE, file);
  }

  async getCodeFile(id: string): Promise<CodeFile | undefined> {
    const db = await this.getDB();
    return db.get(this.CODE_STORE, id);
  }

  async getAllCodeFiles(): Promise<CodeFile[]> {
    const db = await this.getDB();
    return db.getAllFromIndex(this.CODE_STORE, "by-updated");
  }

  async deleteCodeFile(id: string): Promise<void> {
    const db = await this.getDB();
    await db.delete(this.CODE_STORE, id);
  }
}

export const chatDB = new ChatDBManager();
