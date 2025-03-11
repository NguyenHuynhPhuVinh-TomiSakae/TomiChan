import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { IconX, IconTrash } from "@tabler/icons-react";

interface UploadFilesProps {
  onImagesUpload?: (files: File[]) => void;
  selectedImages: { file: File; preview: string }[];
  onRemoveImage: (index: number) => void;
  onClearAllImages: () => void;
}

export default function UploadFiles({
  onImagesUpload,
  selectedImages,
  onRemoveImage,
  onClearAllImages,
}: UploadFilesProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (onImagesUpload) {
      onImagesUpload(files);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    onRemoveImage(index);
  };

  const handleClearAllImages = () => {
    onClearAllImages();
  };

  useEffect(() => {
    return () => {
      selectedImages.forEach((image) => {
        URL.revokeObjectURL(image.preview);
      });
    };
  }, []);

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        multiple
        accept="image/*"
        className="hidden"
      />

      {selectedImages.length > 0 && (
        <div className="relative border-b border-black dark:border-white">
          <button
            type="button"
            onClick={handleClearAllImages}
            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs transition-colors z-10 cursor-pointer flex items-center gap-1"
          >
            <IconTrash size={14} stroke={1.5} />
            Xóa tất cả
          </button>
          <div className="flex flex-wrap gap-2 p-2 max-h-[200px] overflow-y-auto">
            {selectedImages.map((image, index) => (
              <div key={index} className="relative w-20 h-20">
                <Image
                  src={image.preview}
                  alt={`Preview ${index}`}
                  className="w-full h-full object-cover rounded"
                  width={80}
                  height={80}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <IconX size={12} stroke={2} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
