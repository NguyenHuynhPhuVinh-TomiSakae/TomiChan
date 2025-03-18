/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { chatDB } from "../../utils/db";

export function useFileManager() {
  const [files, setFiles] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);

  const loadFilesAndFolders = async () => {
    const newFiles = await chatDB.getAllCodeFiles();
    const newFolders = await chatDB.getAllFolders();
    setFiles(newFiles);
    setFolders(newFolders);
  };

  const createFileTree = () => {
    const buildTree = (parentId?: string, indent: string = "") => {
      let tree = "";

      // Lấy folders con của parentId hiện tại
      const subFolders = folders.filter((f) => f.parentId === parentId);

      // Thêm folders
      for (const folder of subFolders) {
        tree += `${indent}📁 ${folder.name}\n`;

        // Thêm files trong folder
        const filesInFolder = files.filter((f) => f.folderId === folder.id);
        for (const file of filesInFolder) {
          tree += `${indent}  📄 ${file.name}\n`;
        }

        // Đệ quy cho subfolders
        tree += buildTree(folder.id, indent + "  ");
      }

      return tree;
    };

    let tree = "Cấu trúc thư mục hiện tại:\n";

    // Thêm folders gốc
    tree += buildTree();

    // Thêm files không thuộc folder nào
    const rootFiles = files.filter((f) => !f.folderId);
    for (const file of rootFiles) {
      tree += `📄 ${file.name}\n`;
    }

    return tree;
  };

  return {
    files,
    folders,
    loadFilesAndFolders,
    createFileTree,
  };
}
