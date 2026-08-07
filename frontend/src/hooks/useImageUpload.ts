import { useState, useCallback } from "react";
import { uploadApi } from "../api/upload";
import toast from "react-hot-toast";

interface UseImageUploadReturn {
  /** The S3 object key after successful upload */
  imageKey: string | null;
  /** Local preview URL for the selected image */
  previewUrl: string | null;
  /** Upload progress percentage (0-100) */
  uploadProgress: number;
  /** Whether an upload is in progress */
  isUploading: boolean;
  /** Error message if upload failed */
  error: string | null;
  /** Handles file selection, validation, and upload */
  handleFileSelect: (file: File) => Promise<void>;
  /** Clears the current image state */
  clearImage: () => void;
  /** Sets an existing preview URL (for edit mode) */
  setExistingPreview: (url: string | null, key?: string | null) => void;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png"];
const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

/**
 * Custom hook for handling image uploads via presigned URLs.
 *
 * Flow:
 * 1. User selects a file
 * 2. Frontend requests a presigned URL from the backend
 * 3. Frontend uploads the file directly to S3
 * 4. The S3 object key is stored in state for later use
 */
export function useImageUpload(): UseImageUploadReturn {
  const [imageKey, setImageKey] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    setError(null);
    setUploadProgress(0);

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      const msg = "Only JPG and PNG files are allowed";
      setError(msg);
      toast.error(msg);
      return;
    }

    // Validate file size
    if (file.size > MAX_SIZE_BYTES) {
      const msg = `File size must be under ${MAX_SIZE_MB}MB`;
      setError(msg);
      toast.error(msg);
      return;
    }

    // Show local preview immediately
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setIsUploading(true);

    try {
      // Step 1: Get presigned URL from backend
      const { key, uploadUrl } = await uploadApi.getPresignedUrl({
        filename: file.name,
        contentType: file.type,
        size: file.size,
      });

      // Step 2: Upload directly to S3
      await uploadApi.uploadToS3(uploadUrl, file, (progress) => {
        setUploadProgress(progress);
      });

      // Step 3: Store the key
      setImageKey(key);
      setUploadProgress(100);
      toast.success("Image uploaded successfully");
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Upload failed. Please try again.";
      setError(errorMsg);
      toast.error("Upload failed. Please try again.");
      setPreviewUrl(null);
      setImageKey(null);
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  }, []);

  const clearImage = useCallback(() => {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setImageKey(null);
    setPreviewUrl(null);
    setUploadProgress(0);
    setError(null);
  }, [previewUrl]);

  const setExistingPreview = useCallback(
    (url: string | null, key?: string | null) => {
      setPreviewUrl(url);
      setImageKey(key || null);
      setUploadProgress(0);
      setError(null);
    },
    []
  );

  return {
    imageKey,
    previewUrl,
    uploadProgress,
    isUploading,
    error,
    handleFileSelect,
    clearImage,
    setExistingPreview,
  };
}
