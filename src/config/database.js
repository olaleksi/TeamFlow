// This file is responsible for setting up the Prisma Client, which is used to interact with the database.
import { PrismaClient } from "@prisma/client";

// Initialize Prisma Client
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL, // This explicitly tells Prisma to use your Render database URL
    },
  },
  log:
    process.env.NODE_ENV === "production"
      ? ["query", "error", "warn"]
      : ["error"],
});

// Test database connection
async function testConnection() {
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
}

// Handle cleanup on app termination
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

export { prisma, testConnection };
