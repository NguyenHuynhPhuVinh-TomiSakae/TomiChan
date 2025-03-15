import { useState, useRef } from "react";

// Danh sách định dạng hỗ trợ
export const supportedImageTypes = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/heic",
  "image/heif",
];

export const supportedVideoTypes = [
  "video/mp4",
  "video/mpeg",
  "video/mov",
  "video/avi",
  "video/x-flv",
  "video/mpg",
  "video/webm",
  "video/wmv",
  "video/3gpp",
];

export const supportedAudioTypes = [
  "audio/wav",
  "audio/mp3",
  "audio/mpeg",
  "audio/aiff",
  "audio/aac",
  "audio/ogg",
  "audio/flac",
];

export const supportedDocumentTypes = [
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

export const allSupportedTypes = [
  ...supportedImageTypes,
  ...supportedVideoTypes,
  ...supportedAudioTypes,
  ...supportedDocumentTypes,
];

export function useFileValidator() {
  const validateFiles = (files: File[]) => {
    const imageFiles: File[] = [];
    const videoFiles: File[] = [];
    const audioFiles: File[] = [];
    const documentFiles: File[] = [];
    let hasUnsupported = false;

    Array.from(files).forEach((file) => {
      if (supportedImageTypes.includes(file.type)) {
        imageFiles.push(file);
      } else if (supportedVideoTypes.includes(file.type)) {
        videoFiles.push(file);
      } else if (supportedAudioTypes.includes(file.type)) {
        audioFiles.push(file);
      } else if (supportedDocumentTypes.includes(file.type)) {
        documentFiles.push(file);
      } else {
        // File không được hỗ trợ
        hasUnsupported = true;
      }
    });

    return {
      imageFiles,
      videoFiles,
      audioFiles,
      documentFiles,
      hasUnsupported,
    };
  };

  const isFileTypeSupported = (fileType: string) => {
    return allSupportedTypes.includes(fileType);
  };

  return {
    validateFiles,
    isFileTypeSupported,
  };
}

export function useImageUpload(onImagesUpload?: (files: File[]) => void) {
  const [selectedImages, setSelectedImages] = useState<
    { file: File; preview: string }[]
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processImageFiles(files);
  };

  const processImageFiles = (files: File[]) => {
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

  const handlePastedFiles = (files: File[]) => {
    processImageFiles(files);
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
    handlePastedFiles,
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

export function useVideoUpload(onVideosUpload?: (files: File[]) => void) {
  const [selectedVideos, setSelectedVideos] = useState<
    { file: File; preview: string }[]
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    const videoFiles = files.filter((file) => file.type.startsWith("video/"));

    if (videoFiles.length === 0) return;

    // Chuyển đổi video thành base64 strings
    const newVideoPreviews = await Promise.all(
      videoFiles.map(async (file) => {
        // Đọc file thành base64
        const reader = new FileReader();
        const preview = await new Promise<string>((resolve) => {
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.readAsDataURL(file);
        });

        return { file, preview };
      })
    );

    setSelectedVideos((prev) => [...prev, ...newVideoPreviews]);

    if (onVideosUpload) {
      onVideosUpload(videoFiles);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveVideo = (index: number) => {
    // Không cần gọi URL.revokeObjectURL vì chúng ta dùng base64
    setSelectedVideos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearAllVideos = () => {
    // Không cần gọi URL.revokeObjectURL vì chúng ta dùng base64
    setSelectedVideos([]);
  };

  return {
    selectedVideos,
    fileInputRef,
    handleFileInputChange,
    handleRemoveVideo,
    handleClearAllVideos,
  };
}

export function useAudioUpload(onAudiosUpload?: (files: File[]) => void) {
  const [selectedAudios, setSelectedAudios] = useState<
    { file: File; preview: string }[]
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    const audioFiles = files.filter((file) => file.type.startsWith("audio/"));

    if (audioFiles.length === 0) return;

    // Chuyển đổi audio thành base64 strings
    const newAudioPreviews = await Promise.all(
      audioFiles.map(async (file) => {
        // Đọc file thành base64
        const reader = new FileReader();
        const preview = await new Promise<string>((resolve) => {
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.readAsDataURL(file);
        });

        return { file, preview };
      })
    );

    setSelectedAudios((prev) => [...prev, ...newAudioPreviews]);

    if (onAudiosUpload) {
      onAudiosUpload(audioFiles);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveAudio = (index: number) => {
    setSelectedAudios((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearAllAudios = () => {
    setSelectedAudios([]);
  };

  return {
    selectedAudios,
    fileInputRef,
    handleFileInputChange,
    handleRemoveAudio,
    handleClearAllAudios,
  };
}
