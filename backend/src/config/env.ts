import dotenv from "dotenv";
dotenv.config();

interface EnvConfig {
  PORT: number;
  NODE_ENV: string;
  DATABASE_URL: string;
  AWS_REGION: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  S3_BUCKET_NAME: string;
  MAX_FILE_SIZE_MB: number;
  SINGLE_UPLOAD_LIMIT_MB: number;
  CHUNK_SIZE_MB: number;
  PRESIGNED_URL_EXPIRY_SECONDS: number;
}

function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getEnvVarAsNumber(key: string, defaultValue?: number): number {
  const value = process.env[key];
  if (!value) {
    if (defaultValue !== undefined) return defaultValue;
    throw new Error(`Missing required environment variable: ${key}`);
  }
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be a valid number`);
  }
  return parsed;
}

export const env: EnvConfig = {
  PORT: getEnvVarAsNumber("PORT", 4000),
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL: getEnvVar("DATABASE_URL"),
  AWS_REGION: getEnvVar("AWS_REGION"),
  AWS_ACCESS_KEY_ID: getEnvVar("AWS_ACCESS_KEY_ID"),
  AWS_SECRET_ACCESS_KEY: getEnvVar("AWS_SECRET_ACCESS_KEY"),
  S3_BUCKET_NAME: getEnvVar("S3_BUCKET_NAME"),
  MAX_FILE_SIZE_MB: getEnvVarAsNumber("MAX_FILE_SIZE_MB", 100),
  SINGLE_UPLOAD_LIMIT_MB: getEnvVarAsNumber("SINGLE_UPLOAD_LIMIT_MB", 5),
  CHUNK_SIZE_MB: getEnvVarAsNumber("CHUNK_SIZE_MB", 5),
  PRESIGNED_URL_EXPIRY_SECONDS: getEnvVarAsNumber("PRESIGNED_URL_EXPIRY_SECONDS", 300),
};
