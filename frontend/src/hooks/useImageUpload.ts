import { useState, useCallback } from "react";
import { uploadApi } from "../api/upload";
import type { CompleteMultipartRequest, CompletedPart } from "../types";
import toast from "react-hot-toast";

interface UseImageUploadReturn {
  /** The S3 object key after successful upload */
  imageKey: string | null;
  /** Multipart upload metadata (if chunked upload was performed) */
  multipartInfo: CompleteMultipartRequest | null;
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

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
];
const MAX_SIZE_MB = 100;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

/**
 * Custom hook for handling image/file uploads via presigned URLs.
 * Automatically handles single file uploads vs chunked multipart uploads based on size.
 */
export function useImageUpload(): UseImageUploadReturn {
  const [imageKey, setImageKey] = useState<string | null>(null);
  const [multipartInfo, setMultipartInfo] = useState<CompleteMultipartRequest | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    setError(null);
    setUploadProgress(0);
    setMultipartInfo(null);

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      const msg = "Invalid file type. Allowed: JPG, PNG, WEBP, GIF, PDF";
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

    // Show local preview immediately if image
    if (file.type.startsWith("image/")) {
      const localPreview = URL.createObjectURL(file);
      setPreviewUrl(localPreview);
    } else {
      setPreviewUrl(null);
    }

    setIsUploading(true);

    try {
      // Step 1: Request presigned URL(s) from backend
      const presignedRes = await uploadApi.getPresignedUrl({
        filename: file.name,
        contentType: file.type,
        size: file.size,
      });

      if (!presignedRes.isMultipart) {
        // Single File Upload Flow
        await uploadApi.uploadToS3(presignedRes.uploadUrl!, file, (progress) => {
          setUploadProgress(progress);
        });

        setImageKey(presignedRes.key);
        setMultipartInfo(null);
        setUploadProgress(100);
        toast.success("File uploaded successfully");
      } else {
        // Multipart Chunk Upload Flow
        const chunkSize = presignedRes.chunkSize || 5 * 1024 * 1024;
        const parts = presignedRes.parts || [];
        const completedParts: CompletedPart[] = [];
        const chunkLoadedMap = new Array<number>(parts.length).fill(0);

        for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
          const start = (part.partNumber - 1) * chunkSize;
          const end = Math.min(start + chunkSize, file.size);
          const chunkBlob = file.slice(start, end);

          const etag = await uploadApi.uploadChunkToS3(
            part.uploadUrl,
            chunkBlob,
            file.type,
            (loadedBytes) => {
              chunkLoadedMap[i] = loadedBytes;
              const totalLoaded = chunkLoadedMap.reduce((acc, curr) => acc + curr, 0);
              const progress = Math.min(99, Math.round((totalLoaded * 100) / file.size));
              setUploadProgress(progress);
            }
          );

          completedParts.push({
            PartNumber: part.partNumber,
            ETag: etag,
          });
        }

        setImageKey(presignedRes.key);
        setMultipartInfo({
          key: presignedRes.key,
          uploadId: presignedRes.uploadId!,
          parts: completedParts,
        });

        setUploadProgress(100);
        toast.success("All file chunks uploaded successfully!");
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Upload failed. Please try again.";
      setError(errorMsg);
      toast.error("Upload failed. Please try again.");
      setPreviewUrl(null);
      setImageKey(null);
      setMultipartInfo(null);
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
    setMultipartInfo(null);
    setPreviewUrl(null);
    setUploadProgress(0);
    setError(null);
  }, [previewUrl]);

  const setExistingPreview = useCallback(
    (url: string | null, key?: string | null) => {
      setPreviewUrl(url);
      setImageKey(key || null);
      setMultipartInfo(null);
      setUploadProgress(0);
      setError(null);
    },
    []
  );

  return {
    imageKey,
    multipartInfo,
    previewUrl,
    uploadProgress,
    isUploading,
    error,
    handleFileSelect,
    clearImage,
    setExistingPreview,
  };
}
