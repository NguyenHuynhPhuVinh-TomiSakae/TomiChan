import { useState, useEffect } from "react";
import { nanoid } from "nanoid";
import { chatDB } from "../../../../../../utils/db";
import type { CodeFile, CodeFolder } from "../../../../../../types";

export function useCodeAssistant() {
  const [files, setFiles] = useState<CodeFile[]>([]);
  const [folders, setFolders] = useState<CodeFolder[]>([]);
  const [isNewFileModalOpen, setIsNewFileModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState<CodeFile | null>(null);
  const [activeFile, setActiveFile] = useState<CodeFile | null>(null);
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<CodeFolder | null>(null);
  const [selectedParentFolder, setSelectedParentFolder] = useState<
    string | null
  >(null);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);

  useEffect(() => {
    loadFiles();
    loadFolders();
  }, []);

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

  const createNewFolder = async (folderData?: Partial<CodeFolder>) => {
    if (!folderData && !newFileName.trim()) return;

    const newFolder: CodeFolder = {
      id: nanoid(),
      name: folderData?.name || newFileName,
      createdAt: new Date(),
      updatedAt: new Date(),
      parentId:
        folderData?.parentId !== undefined
          ? folderData.parentId
          : selectedParentFolder || undefined,
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

    const newFile: CodeFile = {
      id: nanoid(),
      name: fileData?.name || newFileName,
      content: fileData?.content || "",
      createdAt: new Date(),
      updatedAt: new Date(),
      language:
        (fileData?.name || newFileName).split(".").pop() || "javascript",
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

  const handleFileOpen = (file: CodeFile) => {
    setActiveFile(file);
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

  return {
    files,
    folders,
    isNewFileModalOpen,
    isEditModalOpen,
    isDeleteModalOpen,
    newFileName,
    selectedFile,
    activeFile,
    isNewFolderModalOpen,
    selectedFolder,
    selectedParentFolder,
    currentFolder,
    setIsNewFileModalOpen,
    setIsEditModalOpen,
    setIsDeleteModalOpen,
    setNewFileName,
    setSelectedFile,
    setActiveFile,
    setIsNewFolderModalOpen,
    setSelectedFolder,
    setSelectedParentFolder,
    setCurrentFolder,
    createNewFile,
    createNewFolder,
    handleEditFile,
    handleDeleteFile,
    handleEditFolder,
    handleDeleteFolder,
    handleFileOpen,
    handleEditorBack,
    handleFolderClick,
    handleBack,
    handlePathClick,
    openEditFolderModal,
    openDeleteFolderModal,
    getCurrentPath,
    loadFiles,
    loadFolders,
  };
}
