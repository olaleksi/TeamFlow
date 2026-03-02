// This file is responsible for setting up the Prisma Client, which is used to interact with the database.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default prisma;
