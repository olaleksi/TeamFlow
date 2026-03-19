import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from "./config/database.js";
import authRoutes from './routes/authRoutes.js';
// import projectRoutes from './routes/projectRoutes.js';
// import taskRoutes from './routes/taskRoutes.js';
import userRoutes from './routes/userRoutes.js';

// Load environment variables from .env file
dotenv.config();

const app = express();

// Middleware
// Enable CORS and parse JSON request bodies
app.use(cors());
// Parse incoming JSON requests
app.use(express.json());
// Parse URL-encoded data (for form submissions)
app.use(express.urlencoded({ extended: true }));


// Route handlers
app.use('/api/auth', authRoutes);
// app.use('/api/projects', projectRoutes);
// app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

// Root route to check if the API is running
app.get('/', (req, res) => { 
    res.status(200).json({status: "OK", message: "TeamFlow API is running 🚀" });
});


// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Internal server error",
  });
});




// Test database connection when the app starts
testConnection();


export default app;