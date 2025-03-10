import { openDB, DBSchema } from "idb";
import { ChatHistory } from "../types";

interface ChatDB extends DBSchema {
  chats: {
    key: string;
    value: ChatHistory;
    indexes: { "by-updated": Date };
  };
}

class ChatDBManager {
  private readonly DB_NAME = "chat_history";
  private readonly STORE_NAME = "chats";

  private async getDB() {
    return openDB<ChatDB>(this.DB_NAME, 1, {
      upgrade(db) {
        const store = db.createObjectStore("chats", { keyPath: "id" });
        store.createIndex("by-updated", "updatedAt");
      },
    });
  }

  async saveChat(chat: ChatHistory): Promise<void> {
    const db = await this.getDB();
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
}

export const chatDB = new ChatDBManager();
