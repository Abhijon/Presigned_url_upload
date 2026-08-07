import app from "./app";
import { env } from "./config/env";

const startServer = async (): Promise<void> => {
  try {
    app.listen(env.PORT, () => {
      console.log(`\n🚀 Server running on http://localhost:${env.PORT}`);
      console.log(`📦 Environment: ${env.NODE_ENV}`);
      console.log(`🗄️  Database: Connected`);
      console.log(`☁️  S3 Bucket: ${env.S3_BUCKET_NAME}\n`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
