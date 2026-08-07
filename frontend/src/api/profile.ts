import api from "./axios";
import type {
  ApiResponse,
  Profile,
  CreateProfileRequest,
  UpdateProfileRequest,
} from "../types";

/**
 * Profile API service.
 * Handles all CRUD operations for profiles.
 */
export const profileApi = {
  async create(data: CreateProfileRequest): Promise<Profile> {
    const response = await api.post<ApiResponse<Profile>>("/profiles", data);
    return response.data.data;
  },

  async getById(id: string): Promise<Profile> {
    const response = await api.get<ApiResponse<Profile>>(`/profiles/${id}`);
    return response.data.data;
  },

  async getAll(): Promise<Profile[]> {
    const response = await api.get<ApiResponse<Profile[]>>("/profiles");
    return response.data.data;
  },

  async update(id: string, data: UpdateProfileRequest): Promise<Profile> {
    const response = await api.patch<ApiResponse<Profile>>(
      `/profiles/${id}`,
      data
    );
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/profiles/${id}`);
  },
};
