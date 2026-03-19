import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "TeamFlow API Documentation",
      version: "1.0.0",
      description: `
        TeamFlow is a task management backend API designed for team collaboration.
        
        ## Features
        - 🔐 JWT Authentication with Email Verification
        - 👥 User Management
        - 📊 Project Management
        - ✅ Task Management with Status Tracking
        - 📝 Activity Logging
        - 📧 Email Notifications
        - 👑 Role-Based Access Control
        
        ## Base URL
        \`http://localhost:5000/api\`
        
        ## Authentication
        All protected endpoints require a JWT token in the Authorization header:
        \`Authorization: Bearer <your_jwt_token>\`
      `,
      contact: {
        name: "API Support",
        email: "support@teamflow.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: "http://localhost:5000/api",
        description: "Development server",
      },
      {
        url: "https://teamflow-api.onrender.com/api",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "Enter your JWT token in the format: Bearer &lt;token&gt;",
        },
      },
      schemas: {
        // User Schemas
        User: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              example: "123e4567-e89b-12d3-a456-426614174000",
            },
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
            firstName: { type: "string", example: "John" },
            lastName: { type: "string", example: "Doe" },
            role: { type: "string", enum: ["USER", "ADMIN"], example: "USER" },
            isVerified: { type: "boolean", example: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },

        // Project Schemas
        Project: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string", example: "E-commerce Platform" },
            description: {
              type: "string",
              example: "Build a full-stack e-commerce website",
            },
            ownerId: { type: "string", format: "uuid" },
            owner: { $ref: "#/components/schemas/User" },
            members: {
              type: "array",
              items: { $ref: "#/components/schemas/ProjectMember" },
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },

        ProjectMember: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            projectId: { type: "string", format: "uuid" },
            userId: { type: "string", format: "uuid" },
            role: {
              type: "string",
              enum: ["OWNER", "ADMIN", "MEMBER"],
              example: "MEMBER",
            },
            user: { $ref: "#/components/schemas/User" },
            joinedAt: { type: "string", format: "date-time" },
          },
        },

        // Task Schemas
        Task: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            title: { type: "string", example: "Implement login feature" },
            description: {
              type: "string",
              example: "Create login endpoint with JWT",
            },
            status: {
              type: "string",
              enum: ["TODO", "IN_PROGRESS", "REVIEW", "DONE"],
              example: "TODO",
            },
            priority: {
              type: "string",
              enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
              example: "HIGH",
            },
            projectId: { type: "string", format: "uuid" },
            assigneeId: { type: "string", format: "uuid", nullable: true },
            createdById: { type: "string", format: "uuid" },
            dueDate: { type: "string", format: "date-time", nullable: true },
            assignee: { $ref: "#/components/schemas/User" },
            createdBy: { $ref: "#/components/schemas/User" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },

        // Activity Log Schema
        ActivityLog: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            userId: { type: "string", format: "uuid" },
            projectId: { type: "string", format: "uuid", nullable: true },
            taskId: { type: "string", format: "uuid", nullable: true },
            action: { type: "string", example: "TASK_CREATED" },
            details: {
              type: "object",
              example: { taskTitle: "Implement login" },
            },
            user: { $ref: "#/components/schemas/User" },
            createdAt: { type: "string", format: "date-time" },
          },
        },

        // Error Response
        Error: {
          type: "object",
          properties: {
            status: { type: "string", example: "error" },
            message: { type: "string", example: "Error message here" },
            stack: {
              type: "string",
              example: "Error stack trace (development only)",
            },
          },
        },

        // Success Response
        Success: {
          type: "object",
          properties: {
            status: { type: "string", example: "success" },
            message: {
              type: "string",
              example: "Operation completed successfully",
            },
          },
        },

        // Pagination
        Pagination: {
          type: "object",
          properties: {
            page: { type: "integer", example: 1 },
            limit: { type: "integer", example: 10 },
            total: { type: "integer", example: 100 },
            pages: { type: "integer", example: 10 },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: "Access token is missing or invalid",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
              example: {
                status: "error",
                message:
                  "You are not logged in. Please log in to access this resource.",
              },
            },
          },
        },
        ForbiddenError: {
          description: "Insufficient permissions",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
              example: {
                status: "error",
                message: "You do not have permission to perform this action.",
              },
            },
          },
        },
        NotFoundError: {
          description: "Resource not found",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
              example: {
                status: "error",
                message: "Resource not found",
              },
            },
          },
        },
        ValidationError: {
          description: "Validation failed",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
              example: {
                status: "error",
                message: "Please provide email and password",
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: "Authentication",
        description: "User authentication and verification endpoints",
      },
      {
        name: "Users",
        description: "User profile management",
      },
      {
        name: "Projects",
        description: "Project management operations",
      },
      {
        name: "Tasks",
        description: "Task management operations",
      },
      {
        name: "Activities",
        description: "Activity logging and retrieval",
      },
    ],
  },
  apis: ["./docs/apiDocs/*.js"], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
