import prisma from "../../config/prisma";
import { Profile } from "@prisma/client";
import { CreateProfileRequest, UpdateProfileRequest } from "../../types";

/**
 * Profile Repository
 *
 * Data access layer - all database interactions go through here.
 * This keeps the service layer free from direct Prisma dependencies.
 */
class ProfileRepository {
  async create(data: CreateProfileRequest): Promise<Profile> {
    return prisma.profile.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        age: data.age,
        profilePictureKey: data.profilePictureKey || null,
      },
    });
  }

  async findById(id: string): Promise<Profile | null> {
    return prisma.profile.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<Profile | null> {
    return prisma.profile.findUnique({
      where: { email },
    });
  }

  async findAll(): Promise<Profile[]> {
    return prisma.profile.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async update(id: string, data: UpdateProfileRequest): Promise<Profile> {
    const { name, email, phone, age, profilePictureKey } = data;
    return prisma.profile.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(age !== undefined && { age }),
        ...(profilePictureKey !== undefined && { profilePictureKey }),
      },
    });
  }

  async delete(id: string): Promise<Profile> {
    return prisma.profile.delete({
      where: { id },
    });
  }
}

export default new ProfileRepository();
