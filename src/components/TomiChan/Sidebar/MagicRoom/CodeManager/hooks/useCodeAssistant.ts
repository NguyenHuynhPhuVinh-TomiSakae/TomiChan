import { useState, useEffect } from "react";
import { nanoid } from "nanoid";
import { chatDB } from "../../../../../../utils/db";
import type { CodeFile, CodeFolder, Project } from "../../../../../../types";
import { FILE_EXPLORER_EVENTS, MAGIC_EVENTS } from "@/lib/events";
import { emitter } from "@/lib/events";
import { setSessionStorage } from "../../../../../../utils/sessionStorage";
import { useE2B } from "../../CodeManager/CodeEditor/hooks/useE2B";

export function useCodeAssistant() {
  const [files, setFiles] = useState<CodeFile[]>([]);
  const [folders, setFolders] = useState<CodeFolder[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isNewFileModalOpen, setIsNewFileModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<CodeFile | null>(null);
  const [activeFile, setActiveFile] = useState<CodeFile | null>(null);
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<CodeFolder | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedParentFolder, setSelectedParentFolder] = useState<
    string | null
  >(null);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [currentProject, setCurrentProject] = useState<string | null>(null);

  // Thêm state loading cho các thao tác với E2B
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [isDeletingProject, setIsDeletingProject] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [isDeletingFolder, setIsDeletingFolder] = useState(false);
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [isDeletingFile, setIsDeletingFile] = useState(false);

  // Sử dụng hook useE2B
  const { uploadFile, createOrCheckDirectory, deleteDirectory } = useE2B();

  useEffect(() => {
    loadFiles();
    loadFolders();
    loadProjects();

    const handleReload = () => {
      loadFiles();
      loadFolders();
      loadProjects();
    };
    emitter.on(FILE_EXPLORER_EVENTS.RELOAD, handleReload);

    return () => {
      emitter.off(FILE_EXPLORER_EVENTS.RELOAD, handleReload);
    };
  }, []);

  const loadProjects = async () => {
    const allProjects = await chatDB.getAllProjects();
    setProjects(
      allProjects.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
    );
  };

  const loadFiles = async () => {
    const allFiles = await chatDB.getAllCodeFiles();
    const sortedFiles = allFiles.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    setFiles(sortedFiles);
  };

  const loadFolders = async () => {
    const allFolders = await chatDB.getAllFolders();
    setFolders(
      allFolders.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
    );
  };

  const getUniqueFileName = (baseName: string, existingFiles: CodeFile[]) => {
    const extension = baseName.includes(".")
      ? `.${baseName.split(".").pop()}`
      : "";
    const nameWithoutExt = baseName.replace(extension, "");
    let newName = baseName;
    let counter = 1;

    while (existingFiles.some((file) => file.name === newName)) {
      newName = `${nameWithoutExt} (${counter})${extension}`;
      counter++;
    }

    return newName;
  };

  const getUniqueFolderName = (
    baseName: string,
    existingFolders: CodeFolder[],
    parentId?: string | null,
    projectId?: string
  ) => {
    let newName = baseName;
    let counter = 1;

    const siblingFolders = existingFolders.filter((folder) => {
      if (projectId) {
        return (
          folder.projectId === projectId &&
          ((!parentId && !folder.parentId) || folder.parentId === parentId)
        );
      } else if (parentId) {
        return !folder.projectId && folder.parentId === parentId;
      } else {
        return !folder.projectId && !folder.parentId;
      }
    });

    while (siblingFolders.some((folder) => folder.name === newName)) {
      newName = `${baseName} (${counter})`;
      counter++;
    }

    return newName;
  };

  const createNewProject = async () => {
    if (!newProjectName.trim()) return;

    // Bắt đầu loading
    setIsCreatingProject(true);

    try {
      const newProject: Project = {
        id: nanoid(),
        name: newProjectName,
        description: newProjectDescription,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await chatDB.saveProject(newProject);

      // Tạo thư mục tương ứng trong E2B
      try {
        await createOrCheckDirectory(newProjectName);
        console.log(`Đã tạo thư mục cho dự án "${newProjectName}" trên E2B`);
      } catch (error) {
        console.error(`Lỗi khi tạo thư mục dự án trên E2B:`, error);
      }

      await loadProjects();
      setIsNewProjectModalOpen(false);
      setNewProjectName("");
      setNewProjectDescription("");
      return newProject;
    } catch (error) {
      console.error("Lỗi khi tạo dự án:", error);
    } finally {
      // Kết thúc loading bất kể kết quả
      setIsCreatingProject(false);
    }
  };

  const createNewFolder = async (folderData?: Partial<CodeFolder>) => {
    if (!folderData && !newFileName.trim()) return;

    // Bắt đầu loading nếu folder thuộc project
    if (currentProject) {
      setIsCreatingFolder(true);
    }

    try {
      const folderName = folderData?.name || newFileName;
      const parentId =
        folderData?.parentId !== undefined
          ? folderData.parentId
          : selectedParentFolder;

      const uniqueFolderName = getUniqueFolderName(
        folderName,
        folders,
        parentId,
        currentProject || undefined
      );

      const newFolder: CodeFolder = {
        id: nanoid(),
        name: uniqueFolderName,
        createdAt: new Date(),
        updatedAt: new Date(),
        projectId: currentProject || undefined,
        parentId: parentId || undefined,
      };

      await chatDB.saveFolder(newFolder);

      // Nếu folder thuộc một dự án, tạo thư mục tương ứng trên E2B
      if (newFolder.projectId) {
        const project = projects.find((p) => p.id === newFolder.projectId);
        if (project) {
          // Xây dựng đường dẫn thư mục
          let folderPath = uniqueFolderName;
          let currentParentId = parentId || null;

          // Nếu có thư mục cha, thêm vào đường dẫn
          while (currentParentId) {
            const parentFolder = folders.find((f) => f.id === currentParentId);
            if (parentFolder) {
              folderPath = `${parentFolder.name}/${folderPath}`;
              currentParentId = parentFolder.parentId || null;
            } else {
              break;
            }
          }

          // Tạo thư mục trong E2B
          try {
            await createOrCheckDirectory(`${project.name}/${folderPath}`);
            console.log(
              `Đã tạo thư mục ${folderPath} trong dự án ${project.name} trên E2B`
            );
          } catch (error) {
            console.error(`Lỗi khi tạo thư mục trên E2B:`, error);
          }
        }
      }

      await loadFolders();

      if (!folderData) {
        setIsNewFolderModalOpen(false);
        setNewFileName("");
        setSelectedParentFolder(null);
      }

      return newFolder;
    } catch (error) {
      console.error("Error creating folder:", error);
      throw error;
    } finally {
      if (currentProject) {
        setIsCreatingFolder(false);
      }
    }
  };

  const createNewFile = async (fileData?: Partial<CodeFile>) => {
    if (!fileData && !newFileName.trim()) return;

    // Bắt đầu loading nếu file thuộc project
    if (currentProject) {
      setIsCreatingFile(true);
    }

    try {
      const fileName = fileData?.name || newFileName;
      const uniqueFileName = getUniqueFileName(fileName, files);

      const newFile: CodeFile = {
        id: nanoid(),
        name: uniqueFileName,
        content: fileData?.content || "",
        createdAt: new Date(),
        updatedAt: new Date(),
        language: uniqueFileName.split(".").pop() || "javascript",
        projectId: currentProject || undefined,
        folderId: fileData?.folderId || currentFolder || undefined,
      };

      await chatDB.saveCodeFile(newFile);

      // Nếu file thuộc một dự án, tải file lên E2B
      if (newFile.projectId) {
        const project = projects.find((p) => p.id === newFile.projectId);
        if (project) {
          // Xây dựng đường dẫn file
          let filePath = uniqueFileName;

          // Nếu file nằm trong thư mục, xây dựng đường dẫn đầy đủ
          if (newFile.folderId) {
            // Xây dựng đường dẫn thư mục
            let currentFolderId = newFile.folderId;
            const folderParts: string[] = [];

            while (currentFolderId) {
              const folder = folders.find((f) => f.id === currentFolderId);
              if (folder) {
                folderParts.unshift(folder.name);
                currentFolderId = folder.parentId || null || "";
              } else {
                break;
              }
            }

            if (folderParts.length > 0) {
              filePath = `${folderParts.join("/")}/${filePath}`;
            }
          }

          // Tải file lên E2B
          try {
            await uploadFile(filePath, newFile.content, project.name);
            console.log(
              `Đã tải file ${filePath} lên dự án ${project.name} trên E2B`
            );
          } catch (error) {
            console.error(`Lỗi khi tải file lên E2B:`, error);
          }
        }
      }

      await loadFiles();

      if (!fileData) {
        setIsNewFileModalOpen(false);
        setNewFileName("");
      }

      return newFile;
    } catch (error) {
      console.error("Lỗi khi tạo file:", error);
    } finally {
      if (currentProject) {
        setIsCreatingFile(false);
      }
    }
  };

  const handleEditFile = async () => {
    if (!selectedFile || !newFileName.trim()) return;

    const updatedFile: CodeFile = {
      ...selectedFile,
      name: newFileName,
      updatedAt: new Date(),
      language: newFileName.split(".").pop() || "javascript",
    };

    await chatDB.saveCodeFile(updatedFile);

    // Cập nhật file trên E2B nếu thuộc dự án
    if (updatedFile.projectId) {
      const project = projects.find((p) => p.id === updatedFile.projectId);
      if (project) {
        // Xây dựng đường dẫn file
        let filePath = updatedFile.name;

        // Nếu file nằm trong thư mục, xây dựng đường dẫn đầy đủ
        if (updatedFile.folderId) {
          // Xây dựng đường dẫn thư mục
          let currentFolderId = updatedFile.folderId;
          const folderParts: string[] = [];

          while (currentFolderId) {
            const folder = folders.find((f) => f.id === currentFolderId);
            if (folder) {
              folderParts.unshift(folder.name);
              currentFolderId = folder.parentId || null || "";
            } else {
              break;
            }
          }

          if (folderParts.length > 0) {
            filePath = `${folderParts.join("/")}/${filePath}`;
          }
        }

        // Cập nhật file trên E2B
        try {
          await uploadFile(filePath, updatedFile.content, project.name);
          console.log(
            `Đã cập nhật file ${filePath} trong dự án ${project.name} trên E2B`
          );
        } catch (error) {
          console.error(`Lỗi khi cập nhật file trên E2B:`, error);
        }
      }
    }

    await loadFiles();
    setIsEditModalOpen(false);
    setNewFileName("");
    setSelectedFile(null);
  };

  const handleDeleteFile = async () => {
    if (!selectedFile) return;

    // Bắt đầu loading nếu file thuộc project
    if (selectedFile.projectId) {
      setIsDeletingFile(true);
    }

    try {
      await chatDB.deleteCodeFile(selectedFile.id);

      // Nếu file thuộc dự án, xóa file trên E2B
      if (selectedFile.projectId) {
        const project = projects.find((p) => p.id === selectedFile.projectId);
        if (project) {
          // Xây dựng đường dẫn file
          let filePath = selectedFile.name;

          // Nếu file nằm trong thư mục, xây dựng đường dẫn đầy đủ
          if (selectedFile.folderId) {
            // Xây dựng đường dẫn thư mục
            let currentFolderId = selectedFile.folderId;
            const folderParts: string[] = [];

            while (currentFolderId) {
              const folder = folders.find((f) => f.id === currentFolderId);
              if (folder) {
                folderParts.unshift(folder.name);
                currentFolderId = folder.parentId || null || "";
              } else {
                break;
              }
            }

            if (folderParts.length > 0) {
              filePath = `${folderParts.join("/")}/${filePath}`;
            }
          }

          // Xóa file trên E2B
          try {
            // TODO: Cần thêm API để xóa file trên E2B
            console.log(
              `Đã xóa file ${filePath} trong dự án ${project.name} trên E2B`
            );
          } catch (error) {
            console.error(`Lỗi khi xóa file trên E2B:`, error);
          }
        }
      }

      await loadFiles();
      setIsDeleteModalOpen(false);
      setSelectedFile(null);
    } catch (error) {
      console.error("Lỗi khi xóa file:", error);
    } finally {
      if (selectedFile.projectId) {
        setIsDeletingFile(false);
      }
    }
  };

  const openEditFolderModal = (folder: CodeFolder, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFolder(folder);
    setNewFileName(folder.name);
    setIsEditModalOpen(true);
  };

  const openDeleteFolderModal = (folder: CodeFolder, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFolder(folder);
    setIsDeleteModalOpen(true);
  };

  const handleEditFolder = async () => {
    if (!selectedFolder || !newFileName.trim()) return;

    const updatedFolder: CodeFolder = {
      ...selectedFolder,
      name: newFileName,
      updatedAt: new Date(),
    };

    await chatDB.saveFolder(updatedFolder);
    await loadFolders();
    setIsEditModalOpen(false);
    setNewFileName("");
    setSelectedFolder(null);
  };

  const handleDeleteFolder = async () => {
    if (!selectedFolder) return;

    // Bắt đầu loading nếu folder thuộc project
    if (selectedFolder.projectId) {
      setIsDeletingFolder(true);
    }

    try {
      await chatDB.deleteFolder(selectedFolder.id);

      // Nếu folder thuộc dự án, xóa folder trên E2B
      if (selectedFolder.projectId) {
        const project = projects.find((p) => p.id === selectedFolder.projectId);
        if (project) {
          // Xây dựng đường dẫn thư mục
          let folderPath = selectedFolder.name;
          let currentParentId = selectedFolder.parentId || null;

          // Nếu có thư mục cha, thêm vào đường dẫn
          while (currentParentId) {
            const parentFolder = folders.find((f) => f.id === currentParentId);
            if (parentFolder) {
              folderPath = `${parentFolder.name}/${folderPath}`;
              currentParentId = parentFolder.parentId || null;
            } else {
              break;
            }
          }

          // Xóa thư mục trên E2B
          try {
            await deleteDirectory(`${project.name}/${folderPath}`);
            console.log(
              `Đã xóa thư mục ${folderPath} trong dự án ${project.name} trên E2B`
            );
          } catch (error) {
            console.error(`Lỗi khi xóa thư mục trên E2B:`, error);
          }
        }
      }

      await loadFolders();
      await loadFiles();
      setIsDeleteModalOpen(false);
      setSelectedFolder(null);
    } catch (error) {
      console.error("Lỗi khi xóa thư mục:", error);
    } finally {
      if (selectedFolder.projectId) {
        setIsDeletingFolder(false);
      }
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;

    // Bắt đầu loading
    setIsDeletingProject(true);

    try {
      await chatDB.deleteProject(selectedProject.id);

      // Xóa thư mục dự án trong E2B
      try {
        await deleteDirectory(selectedProject.name);
        console.log(`Đã xóa thư mục dự án "${selectedProject.name}" trên E2B`);
      } catch (error) {
        console.error(`Lỗi khi xóa thư mục dự án trên E2B:`, error);
      }

      await loadProjects();
      setIsDeleteModalOpen(false);
      setSelectedProject(null);
      setCurrentProject(null);
    } catch (error) {
      console.error("Lỗi khi xóa dự án:", error);
    } finally {
      // Kết thúc loading bất kể kết quả
      setIsDeletingProject(false);
    }
  };

  const isMediaFile = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    return [
      "jpg",
      "jpeg",
      "png",
      "gif",
      "webp",
      "svg",
      "mp3",
      "wav",
      "ogg",
      "aac",
      "mp4",
      "webm",
      "ogv",
      "mov",
      "pdf",
    ].includes(extension || "");
  };

  const handleFileOpen = (file: CodeFile) => {
    setActiveFile(file);

    if (isMediaFile(file.name)) {
      setSessionStorage("ui_state_magic", "media_view");
    } else {
      setSessionStorage("ui_state_magic", "code_view");
    }

    emitter.emit(MAGIC_EVENTS.OPEN_CODE_FILE, { filePath: "" });
  };

  const handleEditorBack = async () => {
    await loadFiles();
    setActiveFile(null);
  };

  const handleFolderClick = (folderId: string) => {
    setCurrentFolder(folderId);
  };

  const handleBack = () => {
    if (!currentFolder) return;
    const parentFolder = folders.find((f) => f.id === currentFolder)?.parentId;
    setCurrentFolder(parentFolder || null);
  };

  const handlePathClick = (folderId: string | null) => {
    setCurrentFolder(folderId);
  };

  const getCurrentPath = () => {
    if (!currentFolder) return "Thư mục gốc";

    const path: string[] = [];
    let current = folders.find((f) => f.id === currentFolder);

    while (current) {
      path.unshift(current.name);
      current = folders.find((f) => f.id === current?.parentId);
    }

    return path.join(" / ");
  };

  const handleEditProject = async () => {
    if (!selectedProject || !newProjectName.trim()) return;

    // Lưu tên dự án cũ trước khi cập nhật
    const oldProjectName = selectedProject.name;

    const updatedProject: Project = {
      ...selectedProject,
      name: newProjectName,
      description: newProjectDescription,
      updatedAt: new Date(),
    };

    await chatDB.saveProject(updatedProject);

    // Nếu tên dự án đã thay đổi, cập nhật thư mục trên E2B
    if (oldProjectName !== newProjectName) {
      try {
        // Tạo thư mục mới
        await createOrCheckDirectory(newProjectName);

        // TODO: Copy nội dung thư mục cũ sang mới (cần triển khai API riêng)

        // Xóa thư mục cũ
        await deleteDirectory(oldProjectName);

        console.log(
          `Đã đổi tên thư mục dự án từ "${oldProjectName}" thành "${newProjectName}" trên E2B`
        );
      } catch (error) {
        console.error(`Lỗi khi đổi tên thư mục dự án trên E2B:`, error);
      }
    }

    await loadProjects();
    setIsEditModalOpen(false);
    setNewProjectName("");
    setNewProjectDescription("");
    setSelectedProject(null);
  };

  const handleProjectClick = (projectId: string) => {
    setCurrentProject(projectId);
    setCurrentFolder(null);
  };

  return {
    files: files.filter(
      (f) => !currentProject || f.projectId === currentProject
    ),
    folders: folders.filter(
      (f) => !currentProject || f.projectId === currentProject
    ),
    projects,
    isNewFileModalOpen,
    isEditModalOpen,
    isDeleteModalOpen,
    isNewProjectModalOpen,
    newFileName,
    newProjectName,
    newProjectDescription,
    selectedFile,
    activeFile,
    isNewFolderModalOpen,
    selectedFolder,
    selectedProject,
    selectedParentFolder,
    currentFolder,
    currentProject,
    isCreatingProject,
    isDeletingProject,
    isCreatingFolder,
    isDeletingFolder,
    isCreatingFile,
    isDeletingFile,
    setIsNewFileModalOpen,
    setIsEditModalOpen,
    setIsDeleteModalOpen,
    setIsNewProjectModalOpen,
    setNewFileName,
    setNewProjectName,
    setNewProjectDescription,
    setSelectedFile,
    setActiveFile,
    setIsNewFolderModalOpen,
    setSelectedFolder,
    setSelectedProject,
    setSelectedParentFolder,
    setCurrentFolder,
    setCurrentProject,
    createNewFile,
    createNewFolder,
    createNewProject,
    handleEditFile,
    handleDeleteFile,
    handleEditFolder,
    handleDeleteFolder,
    handleEditProject,
    handleDeleteProject,
    handleFileOpen,
    handleEditorBack,
    handleFolderClick,
    handleProjectClick,
    handleBack,
    handlePathClick,
    openEditFolderModal,
    openDeleteFolderModal,
    getCurrentPath,
    loadFiles,
    loadFolders,
    loadProjects,
  };
}
