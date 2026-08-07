import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { profileApi } from "../api/profile";
import type { Profile } from "../types";
import "./ProfileList.css";

const ProfileList: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: profiles, isLoading, error } = useQuery({
    queryKey: ["profiles"],
    queryFn: profileApi.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: profileApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      toast.success("Profile deleted");
    },
    onError: () => {
      toast.error("Failed to delete profile");
    },
  });

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Delete ${name}'s profile?`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="profile-list-page">
      <div className="profile-list-page__header">
        <div>
          <h1 className="profile-list-page__title">Profiles</h1>
          <p className="profile-list-page__subtitle">
            Manage your team profiles
          </p>
        </div>
        <button
          className="profile-list-page__create-btn"
          onClick={() => navigate("/create")}
          id="create-profile-button"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Profile
        </button>
      </div>

      {isLoading && (
        <div className="profile-list-page__loading">
          <div className="profile-list-page__loading-spinner"></div>
          <p>Loading profiles...</p>
        </div>
      )}

      {error && (
        <div className="profile-list-page__error">
          <p>Failed to load profiles. Is the backend running?</p>
        </div>
      )}

      {profiles && profiles.length === 0 && (
        <div className="profile-list-page__empty">
          <div className="profile-list-page__empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h3>No profiles yet</h3>
          <p>Create your first profile to get started</p>
          <button
            className="profile-list-page__create-btn"
            onClick={() => navigate("/create")}
          >
            Create Profile
          </button>
        </div>
      )}

      {profiles && profiles.length > 0 && (
        <div className="profile-list-page__grid">
          {profiles.map((profile: Profile) => (
            <div key={profile.id} className="profile-card">
              <div className="profile-card__avatar">
                {profile.profilePictureUrl ? (
                  <img src={profile.profilePictureUrl} alt={profile.name} />
                ) : (
                  <div className="profile-card__avatar-placeholder">
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="profile-card__info">
                <h3 className="profile-card__name">{profile.name}</h3>
                <p className="profile-card__email">{profile.email}</p>
                <div className="profile-card__meta">
                  <span className="profile-card__meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    {profile.phone}
                  </span>
                  <span className="profile-card__meta-item">
                    Age: {profile.age}
                  </span>
                </div>
              </div>
              <div className="profile-card__actions">
                <button
                  className="profile-card__action-btn profile-card__action-btn--edit"
                  onClick={() => navigate(`/edit/${profile.id}`)}
                  title="Edit"
                  id={`edit-${profile.id}`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button
                  className="profile-card__action-btn profile-card__action-btn--delete"
                  onClick={() => handleDelete(profile.id, profile.name)}
                  title="Delete"
                  id={`delete-${profile.id}`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfileList;
