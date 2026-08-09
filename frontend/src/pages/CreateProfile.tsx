import React from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { profileApi } from "../api/profile";
import { useImageUpload } from "../hooks/useImageUpload";
import ImageUploader from "../components/ImageUploader";
import type { ProfileFormData } from "../types";
import "./ProfileForm.css";

const CreateProfile: React.FC = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>();

  const {
    imageKey,
    multipartInfo,
    previewUrl,
    uploadProgress,
    isUploading,
    error: uploadError,
    handleFileSelect,
    clearImage,
  } = useImageUpload();

  const createMutation = useMutation({
    mutationFn: profileApi.create,
    onSuccess: () => {
      toast.success("Profile created successfully!");
      navigate("/");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Failed to create profile";
      toast.error(message);
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    createMutation.mutate({
      ...data,
      age: Number(data.age),
      ...(multipartInfo
        ? { multipartInfo }
        : imageKey
        ? { profilePictureKey: imageKey }
        : {}),
    });
  };

  return (
    <div className="profile-form-page">
      <div className="profile-form-page__header">
        <button
          className="profile-form-page__back-btn"
          onClick={() => navigate("/")}
          id="back-button"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>
        <h1 className="profile-form-page__title">Create Profile</h1>
        <p className="profile-form-page__subtitle">
          Fill in the details to create a new profile
        </p>
      </div>

      <form
        className="profile-form"
        onSubmit={handleSubmit(onSubmit)}
        id="create-profile-form"
      >
        <div className="profile-form__avatar-section">
          <label className="profile-form__label">Profile Picture</label>
          <ImageUploader
            previewUrl={previewUrl}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            error={uploadError}
            onFileSelect={handleFileSelect}
            onClear={clearImage}
          />
        </div>

        <div className="profile-form__fields">
          <div className="profile-form__field">
            <label className="profile-form__label" htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              className={`profile-form__input ${errors.name ? "profile-form__input--error" : ""}`}
              placeholder="John Doe"
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && (
              <span className="profile-form__error">{errors.name.message}</span>
            )}
          </div>

          <div className="profile-form__field">
            <label className="profile-form__label" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className={`profile-form__input ${errors.email ? "profile-form__input--error" : ""}`}
              placeholder="john@example.com"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email address",
                },
              })}
            />
            {errors.email && (
              <span className="profile-form__error">{errors.email.message}</span>
            )}
          </div>

          <div className="profile-form__row">
            <div className="profile-form__field">
              <label className="profile-form__label" htmlFor="phone">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                className={`profile-form__input ${errors.phone ? "profile-form__input--error" : ""}`}
                placeholder="+1 234 567 8900"
                {...register("phone", { required: "Phone is required" })}
              />
              {errors.phone && (
                <span className="profile-form__error">
                  {errors.phone.message}
                </span>
              )}
            </div>

            <div className="profile-form__field">
              <label className="profile-form__label" htmlFor="age">
                Age
              </label>
              <input
                id="age"
                type="number"
                className={`profile-form__input ${errors.age ? "profile-form__input--error" : ""}`}
                placeholder="25"
                {...register("age", {
                  required: "Age is required",
                  min: { value: 1, message: "Age must be at least 1" },
                  max: { value: 150, message: "Age must be at most 150" },
                })}
              />
              {errors.age && (
                <span className="profile-form__error">
                  {errors.age.message}
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="profile-form__submit"
          disabled={createMutation.isPending || isUploading}
          id="save-profile-button"
        >
          {createMutation.isPending ? (
            <>
              <span className="profile-form__spinner"></span>
              Creating...
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1-2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              Save Profile
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default CreateProfile;
