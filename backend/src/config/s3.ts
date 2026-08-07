import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import { env } from "./env";

const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Generates a unique S3 object key with folder prefix and UUID.
 * Format: profile-pictures/<uuid>.<extension>
 */
export function generateObjectKey(
  originalFilename: string,
  folder: string = "profile-pictures"
): string {
  const extension = originalFilename.split(".").pop()?.toLowerCase() || "jpg";
  return `${folder}/${uuidv4()}.${extension}`;
}

/**
 * Generates a presigned PUT URL for direct client-side upload to S3.
 * The URL is valid for the configured expiry duration.
 */
export async function generatePresignedUploadUrl(
  key: string,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  const url = await getSignedUrl(s3Client, command, {
    expiresIn: env.PRESIGNED_URL_EXPIRY_SECONDS,
  });

  return url;
}

/**
 * Generates a presigned GET URL for securely accessing an S3 object.
 * Used to serve profile pictures without making the bucket public.
  */
  export async function generatePresignedDownloadUrl(key: string): Promise<string> {
    return `https://${env.S3_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;

  };

/**
 * Deletes an object from S3 by its key.
 * Used during profile deletion or when replacing a profile picture.
 */
export async function deleteS3Object(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: env.S3_BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
}

export default s3Client;
