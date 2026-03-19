import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from "./config/database.js";
import {errorHandling} from "./middleware/errorHandling.js"
import authRoutes from './routes/authRoutes.js';
import activityLogRoutes from "./routes/activityLogRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import projectRoutes from './routes/projectRoutes.js';
import userRoutes from './routes/userRoutes.js';
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";

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


// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'TeamFlow API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
  },
}));




// Route handlers
// defining base paths
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use("/api/activities", activityLogRoutes);
app.use('/api/users', userRoutes);

// Root route to check if the API is running
app.get('/', (req, res) => { 
    res.redirect("/api-docs");
    // res.status(200).json({status: "OK", message: "TeamFlow API is running 🚀" });
});


// Global error handling middleware
app.use(errorHandling);




// Test database connection when the app starts
testConnection();


export default app;
