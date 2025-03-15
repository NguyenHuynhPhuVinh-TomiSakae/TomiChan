import { openDB, DBSchema } from "idb";
import { ChatHistory, CodeFile, CodeFolder } from "../types";
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
  folders: {
    key: string;
    value: CodeFolder;
    indexes: { "by-updated": Date };
  };
}

class ChatDBManager {
  private readonly DB_NAME = "chat_history";
  private readonly STORE_NAME = "chats";
  private readonly CODE_STORE = "codeFiles";
  private readonly FOLDER_STORE = "folders";
  private readonly DB_VERSION = 2;

  private async getDB() {
    return openDB<ChatDB>(this.DB_NAME, this.DB_VERSION + 1, {
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

        if (!db.objectStoreNames.contains("folders")) {
          const folderStore = db.createObjectStore("folders", {
            keyPath: "id",
          });
          folderStore.createIndex("by-updated", "updatedAt");
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

  async saveFolder(folder: CodeFolder): Promise<void> {
    const db = await this.getDB();
    await db.put(this.FOLDER_STORE, folder);
  }

  async getFolder(id: string): Promise<CodeFolder | undefined> {
    const db = await this.getDB();
    return db.get(this.FOLDER_STORE, id);
  }

  async getAllFolders(): Promise<CodeFolder[]> {
    const db = await this.getDB();
    return db.getAllFromIndex(this.FOLDER_STORE, "by-updated");
  }

  async deleteFolder(id: string): Promise<void> {
    const db = await this.getDB();

    // Xóa tất cả files trong folder
    const files = await this.getAllCodeFiles();
    for (const file of files) {
      if (file.folderId === id) {
        await this.deleteCodeFile(file.id);
      }
    }

    // Xóa tất cả folders con (đệ quy)
    const folders = await this.getAllFolders();
    const childFolders = folders.filter((f) => f.parentId === id);
    for (const childFolder of childFolders) {
      await this.deleteFolder(childFolder.id);
    }

    // Xóa folder hiện tại
    await db.delete(this.FOLDER_STORE, id);
  }
}

export const chatDB = new ChatDBManager();
