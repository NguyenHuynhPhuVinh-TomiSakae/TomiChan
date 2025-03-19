import { useState, useEffect } from "react";
import { nanoid } from "nanoid";
import { chatDB } from "../../../../../../utils/db";
import type { CodeFile, CodeFolder, Project } from "../../../../../../types";
import { FILE_EXPLORER_EVENTS, MAGIC_EVENTS } from "@/lib/events";
import { emitter } from "@/lib/events";
import { setSessionStorage } from "../../../../../../utils/sessionStorage";
import { toast } from "sonner";
import { getApiKey } from "../../../../../../utils/getApiKey";

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
  const [isDeleting, setIsDeleting] = useState(false);

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

    const newProject: Project = {
      id: nanoid(),
      name: newProjectName,
      description: newProjectDescription,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await chatDB.saveProject(newProject);
    await loadProjects();
    setIsNewProjectModalOpen(false);
    setNewProjectName("");
    setNewProjectDescription("");
    return newProject;
  };

  const createNewFolder = async (folderData?: Partial<CodeFolder>) => {
    if (!folderData && !newFileName.trim()) return;

    const folderName = folderData?.name || newFileName;
    const parentId =
      folderData?.parentId !== undefined
        ? folderData.parentId
        : selectedParentFolder;

    const uniqueFolderName = getUniqueFolderName(
      folderName,
      folders,
      parentId,
      folderData?.projectId || currentProject || undefined
    );

    const newFolder: CodeFolder = {
      id: nanoid(),
      name: uniqueFolderName,
      createdAt: new Date(),
      updatedAt: new Date(),
      projectId: folderData?.projectId || currentProject || undefined,
      parentId: parentId || undefined,
    };

    try {
      await chatDB.saveFolder(newFolder);
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
    }
  };

  const createNewFile = async (fileData?: Partial<CodeFile>) => {
    if (!fileData && !newFileName.trim()) return;

    const fileName = fileData?.name || newFileName;
    const uniqueFileName = getUniqueFileName(fileName, files);

    const newFile: CodeFile = {
      id: nanoid(),
      name: uniqueFileName,
      content: fileData?.content || "",
      createdAt: new Date(),
      updatedAt: new Date(),
      language: uniqueFileName.split(".").pop() || "javascript",
      projectId: fileData?.projectId || currentProject || undefined,
      folderId: fileData?.folderId || currentFolder || undefined,
    };

    await chatDB.saveCodeFile(newFile);
    await loadFiles();

    if (!fileData) {
      setIsNewFileModalOpen(false);
      setNewFileName("");
    }

    return newFile;
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
    await loadFiles();
    setIsEditModalOpen(false);
    setNewFileName("");
    setSelectedFile(null);
  };

  const handleDeleteFile = async () => {
    if (!selectedFile) return;

    await chatDB.deleteCodeFile(selectedFile.id);
    await loadFiles();
    setIsDeleteModalOpen(false);
    setSelectedFile(null);
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

    await chatDB.deleteFolder(selectedFolder.id);
    await loadFolders();
    await loadFiles();
    setIsDeleteModalOpen(false);
    setSelectedFolder(null);
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

    const updatedProject: Project = {
      ...selectedProject,
      name: newProjectName,
      description: newProjectDescription,
      updatedAt: new Date(),
    };

    await chatDB.saveProject(updatedProject);
    await loadProjects();
    setIsEditModalOpen(false);
    setNewProjectName("");
    setNewProjectDescription("");
    setSelectedProject(null);
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;

    try {
      setIsDeleting(true);
      const e2bApiKey = await getApiKey("e2b", "e2b_api_key");
      await fetch("/api/e2b/delete-project", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-E2B-API-Key": e2bApiKey,
        },
        body: JSON.stringify({
          projectId: selectedProject.id,
        }),
      });

      await chatDB.deleteProject(selectedProject.id);
      await loadProjects();
      setIsDeleteModalOpen(false);
      setSelectedProject(null);
      setCurrentProject(null);
    } catch (error) {
      console.error("Lỗi khi xóa project:", error);
      toast.error("Có lỗi xảy ra khi xóa project");
    } finally {
      setIsDeleting(false);
    }
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
    isDeleting,
  };
}
