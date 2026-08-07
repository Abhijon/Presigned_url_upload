import React, { useRef } from "react";
import "./ImageUploader.css";

interface ImageUploaderProps {
  previewUrl: string | null;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
  onFileSelect: (file: File) => void;
  onClear: () => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  previewUrl,
  isUploading,
  uploadProgress,
  error,
  onFileSelect,
  onClear,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
    // Reset input so the same file can be re-selected
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className="image-uploader">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        onChange={handleChange}
        className="image-uploader__input"
        id="profile-picture-input"
      />

      {previewUrl ? (
        <div className="image-uploader__preview-container">
          <div className="image-uploader__preview-wrapper">
            <img
              src={previewUrl}
              alt="Profile preview"
              className="image-uploader__preview-image"
            />
            {isUploading && (
              <div className="image-uploader__overlay">
                <div className="image-uploader__progress-ring">
                  <svg viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      className="image-uploader__progress-bg"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      className="image-uploader__progress-fill"
                      style={{
                        strokeDasharray: `${2 * Math.PI * 42}`,
                        strokeDashoffset: `${
                          2 * Math.PI * 42 * (1 - uploadProgress / 100)
                        }`,
                      }}
                    />
                  </svg>
                  <span className="image-uploader__progress-text">
                    {uploadProgress}%
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="image-uploader__preview-actions">
            <button
              type="button"
              className="image-uploader__btn image-uploader__btn--change"
              onClick={handleClick}
              disabled={isUploading}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Change
            </button>
            <button
              type="button"
              className="image-uploader__btn image-uploader__btn--remove"
              onClick={onClear}
              disabled={isUploading}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          className="image-uploader__dropzone"
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          id="image-dropzone"
        >
          <div className="image-uploader__dropzone-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
          <p className="image-uploader__dropzone-text">
            Drop your image here, or <span>browse</span>
          </p>
          <p className="image-uploader__dropzone-hint">
            JPG or PNG only • Max 5MB
          </p>
        </div>
      )}

      {error && <p className="image-uploader__error">{error}</p>}
    </div>
  );
};

export default ImageUploader;
