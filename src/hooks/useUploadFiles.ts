import { useState, useEffect, useRef } from "react";

interface ImageFile {
  file: File;
  preview: string;
}

export function useImageUpload(onImagesUpload?: (files: File[]) => void) {
  const [selectedImages, setSelectedImages] = useState<ImageFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setSelectedImages((prev) => [...prev, ...newImages]);

    if (onImagesUpload) {
      onImagesUpload(files);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages((prev) => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const handleClearAllImages = () => {
    selectedImages.forEach((image) => {
      URL.revokeObjectURL(image.preview);
    });
    setSelectedImages([]);
  };

  useEffect(() => {
    return () => {
      selectedImages.forEach((image) => {
        URL.revokeObjectURL(image.preview);
      });
    };
  }, []);

  return {
    selectedImages,
    fileInputRef,
    handleFileInputChange,
    handleRemoveImage,
    handleClearAllImages,
  };
}
