import { useState, useRef } from "react";

export function useImageUpload(onImagesUpload?: (files: File[]) => void) {
  const [selectedImages, setSelectedImages] = useState<
    { file: File; preview: string }[]
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length === 0) return;

    const newImagePreviews = imageFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setSelectedImages((prev) => [...prev, ...newImagePreviews]);

    if (onImagesUpload) {
      onImagesUpload(imageFiles);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    URL.revokeObjectURL(selectedImages[index].preview);
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearAllImages = () => {
    selectedImages.forEach((image) => {
      URL.revokeObjectURL(image.preview);
    });
    setSelectedImages([]);
  };

  return {
    selectedImages,
    fileInputRef,
    handleFileInputChange,
    handleRemoveImage,
    handleClearAllImages,
  };
}

export function useFileUpload(onFilesUpload?: (files: File[]) => void) {
  const [selectedFiles, setSelectedFiles] = useState<
    { file: File; type: string }[]
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    const supportedFileTypes = [
      "application/pdf",
      "application/x-javascript",
      "text/javascript",
      "application/x-python",
      "text/x-python",
      "text/plain",
      "text/html",
      "text/css",
      "text/md",
      "text/csv",
      "text/xml",
      "text/rtf",
    ];

    const documentFiles = files.filter((file) =>
      supportedFileTypes.some((type) => file.type.includes(type))
    );

    if (documentFiles.length === 0) return;

    const newFiles = documentFiles.map((file) => ({
      file,
      type: file.type,
    }));

    setSelectedFiles((prev) => [...prev, ...newFiles]);

    if (onFilesUpload) {
      onFilesUpload(documentFiles);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearAllFiles = () => {
    setSelectedFiles([]);
  };

  return {
    selectedFiles,
    fileInputRef,
    handleFileInputChange,
    handleRemoveFile,
    handleClearAllFiles,
  };
}
