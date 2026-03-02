import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const app = express();

// Middleware
// Enable CORS and parse JSON request bodies
app.use(cors());
// Parse incoming JSON requests
app.use(express.json());


app.get('/', (req, res) => { 
    res.json({ message: "TeamFlow API is running 🚀" });
});





// Test database connection
import prisma from "./config/prisma.js";

app.get("/test-db", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Database connection failed" });
  }
});
// This route tests the database connection by fetching all users from the database. If the connection is successful, it returns the list of users; otherwise, it returns an error message.


export default app;