/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { chatDB } from "../../utils/db";

export function useFileManager() {
  const [files, setFiles] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);

  const loadFilesAndFolders = async () => {
    const newFiles = await chatDB.getAllCodeFiles();
    const newFolders = await chatDB.getAllFolders();
    const newProjects = await chatDB.getAllProjects();

    setFiles(newFiles);
    setFolders(newFolders);
    setProjects(newProjects);
  };

  const createFileTree = () => {
    const buildTree = (
      parentId?: string,
      indent: string = "",
      projectId?: string
    ) => {
      let tree = "";

      // Lấy folders con của parentId hiện tại và thuộc project hiện tại (nếu có)
      const subFolders = folders.filter(
        (f) =>
          f.parentId === parentId &&
          (projectId ? f.projectId === projectId : !f.projectId)
      );

      // Thêm folders
      for (const folder of subFolders) {
        tree += `${indent}📁 ${folder.name}\n`;

        // Thêm files trong folder
        const filesInFolder = files.filter((f) => f.folderId === folder.id);
        for (const file of filesInFolder) {
          tree += `${indent}  📄 ${file.name}\n`;
        }

        // Đệ quy cho subfolders
        tree += buildTree(folder.id, indent + "  ", projectId);
      }

      return tree;
    };

    let tree = "Cấu trúc dự án và thư mục hiện tại:\n\n";

    // Thêm danh sách dự án
    if (projects.length > 0) {
      tree += "📚 DANH SÁCH DỰ ÁN:\n";
      for (const project of projects) {
        tree += `🔶 ${project.name} (ID: ${project.id})\n`;

        // Hiển thị mô tả nếu có
        if (project.description) {
          tree += `  📝 Mô tả: ${project.description}\n`;
        }

        // Hiển thị cấu trúc thư mục của dự án
        const projectFolders = folders.filter(
          (f) => f.projectId === project.id && !f.parentId
        );
        const projectFiles = files.filter(
          (f) => f.projectId === project.id && !f.folderId
        );

        if (projectFolders.length > 0 || projectFiles.length > 0) {
          tree += "  📂 Cấu trúc dự án:\n";

          // Thêm folders gốc của dự án
          tree += buildTree(undefined, "    ", project.id);

          // Thêm files không thuộc folder nào của dự án
          for (const file of projectFiles) {
            tree += `    📄 ${file.name}\n`;
          }
        } else {
          tree += "  (Dự án chưa có file hoặc thư mục)\n";
        }

        tree += "\n";
      }

      tree += "📚 CÁC TỆP VÀ THƯ MỤC KHÔNG THUỘC DỰ ÁN:\n";
    }

    // Thêm folders gốc không thuộc dự án nào
    tree += buildTree();

    // Thêm files không thuộc folder nào và không thuộc dự án nào
    const rootFiles = files.filter((f) => !f.folderId && !f.projectId);
    for (const file of rootFiles) {
      tree += `📄 ${file.name}\n`;
    }

    return tree;
  };

  return {
    files,
    folders,
    projects,
    loadFilesAndFolders,
    createFileTree,
  };
}
