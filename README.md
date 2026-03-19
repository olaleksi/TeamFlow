# 📋 TeamFlow - Task Management Backend API

A  RESTful API for team task management built with Node.js, Express, and PostgreSQL. Features JWT authentication, role-based access control, email verification, activity logging, and comprehensive API documentation.

## 🚀 Features

### Core Features
- **🔐 Authentication & Authorization**
  - JWT-based authentication
  - Email verification flow
  - Role-based access control (Admin, Project Owner, Member)
  - Secure password hashing with bcrypt

- **📊 Project Management**
  - Create, read, update, and delete projects
  - Add/remove team members
  - Member role management (Owner, Admin, Member)
  - Project activity tracking

- **✅ Task Management**
  - Full CRUD operations for tasks
  - Task status tracking (TODO, IN_PROGRESS, REVIEW, DONE)
  - Priority levels (LOW, MEDIUM, HIGH, URGENT)
  - Task assignment to team members
  - Due date management

- **📧 Email Integration**
  - Account verification emails
  - Task assignment notifications
  

- **📝 Activity Logging**
  - Track all user actions
  - Project and task-level activity logs
  - Paginated activity retrieval

- **📚 API Documentation**
  - Interactive Swagger/OpenAPI documentation
  - Postman collection included
  - Detailed endpoint descriptions

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + bcrypt
- **Email**: Nodemailer
- **Documentation**: Swagger/OpenAPI
- **Validation**: express-validator
- **Security**: CORS, helmet
- **Development**: Nodemon

## 📋 Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn
- Git

## 🔧 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/teamflow-backend.git
cd teamflow-backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/teamflow"

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d

# Email (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@teamflow.com

# Frontend URL (for email links)
CLIENT_URL=http://localhost:5000
```

### 4. Database Setup
```bash
# Run Prisma migrations
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate
```

### 5. Start the Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will start at `http://localhost:5000`

## 📚 API Documentation

Once the server is running, access the interactive Swagger documentation:
```
http://localhost:5000/api-docs
```

### API Base URL
```
http://localhost:5000/api
```

## 🔌 API Endpoints

### Authentication Routes
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| GET | `/auth/verify-email` | Verify email with token | No |
| POST | `/auth/login` | Login user | No |
| GET | `/auth/me` | Get current user | Yes |

### Project Routes
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/projects` | Create new project | Yes |
| GET | `/projects` | Get user's projects | Yes |
| GET | `/projects/:projectId` | Get project by ID | Yes |
| PATCH | `/projects/:projectId` | Update project | Yes |
| DELETE | `/projects/:projectId` | Delete project | Yes |
| POST | `/projects/:projectId/members` | Add member | Yes |
| PATCH | `/projects/:projectId/members/:memberId` | Update member role | Yes |
| DELETE | `/projects/:projectId/members/:memberId` | Remove member | Yes |
| POST | `/projects/:projectId/tasks` | Create task | Yes |
| GET | `/projects/:projectId/tasks` | Get project tasks | Yes |

### Task Routes
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/tasks/assigned/me` | Get my assigned tasks | Yes |
| GET | `/tasks/:taskId` | Get task by ID | Yes |
| PATCH | `/tasks/:taskId/assign` | Assign task | Yes |
| PATCH | `/tasks/:taskId/status` | Update task status | Yes |
| DELETE | `/tasks/:taskId` | Delete task | Yes |

### User Routes
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/users/profile` | Get user profile | Yes |
| PATCH | `/users/profile` | Update profile | Yes |
| GET | `/users/search` | Search users by email | Yes |

## 📦 Project Structure

```
teamflow-backend/
├── src/
│   ├── config/
│   │   ├── database.js      # Database configuration
│   │   └── swagger.js       # Swagger configuration
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── projectController.js
│   │   ├── taskController.js
│   │   └── userController.js
│   ├── docs/                 # Swagger documentation files
│   │   ├── authdocs.js
│   │   ├── projectsdocs.js
│   │   └── tasksdocs.js
│   │   └── userdocs.js 
│   ├── middleware/
│   │   ├── auth.js          # JWT verification
│   │   └── errorHandling.js    # Error handling 
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── projectRoutes.js
│   │   ├── taskRoutes.js
│   │   └── userRoutes.js
│   ├── services/
│   │   ├── emailService.js  # Email functionality
│   │   └── activityLoggerServices.js # Activity logging
│   ├── utils/
│   │   ├── AppError.js      # Custom error class
│   │   └── catchAsync.js    # Async error handler
│   └── app.js                # Main app entry
├── prisma/
│   └── schema.prisma         # Database schema
├── .env
├── .gitignore
├── package.json
└── README.md 
└── TeamFlow-PostMan-Collection.json
```

## 🗄️ Database Schema

### Models

**User**
- `id` (UUID, PK)
- `email` (String, unique)
- `password` (String, hashed)
- `firstName`, `lastName`
- `role` (USER, ADMIN)
- `isVerified` (Boolean)
- `emailToken` (String, nullable)

**Project**
- `id` (UUID, PK)
- `name`, `description`
- `ownerId` (FK to User)

**ProjectMember** (junction table)
- `id` (UUID, PK)
- `projectId` (FK to Project)
- `userId` (FK to User)
- `role` (OWNER, ADMIN, MEMBER)

**Task**
- `id` (UUID, PK)
- `title`, `description`
- `status` (TODO, IN_PROGRESS, REVIEW, DONE)
- `priority` (LOW, MEDIUM, HIGH, URGENT)
- `projectId` (FK to Project)
- `assigneeId` (FK to User, nullable)
- `createdById` (FK to User)
- `dueDate` (DateTime, nullable)

**ActivityLog**
- `id` (UUID, PK)
- `userId` (FK to User)
- `projectId` (FK to Project, nullable)
- `taskId` (FK to Task, nullable)
- `action` (String)
- `details` (JSON)
- `createdAt` (DateTime)

## 🚦 Running Tests

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📱 Postman Collection

1. Import the Postman collection from `TeamFlow-Postman-Collection.json`
2. Set up environment variables:
   - `baseUrl`: `http://localhost:5000/api`
   - `token`: (auto-filled after login)
3. Run the Login request to authenticate
4. Token will be automatically saved for subsequent requests

## 🔒 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| NODE_ENV | Environment | development |
| DATABASE_URL | PostgreSQL connection string | - |
| JWT_SECRET | JWT signing secret | - |
| JWT_EXPIRES_IN | JWT expiration time | 7d |
| EMAIL_HOST | SMTP host | smtp.gmail.com |
| EMAIL_PORT | SMTP port | 587 |
| EMAIL_USER | Email username | - |
| EMAIL_PASS | Email password/app password | - |
| EMAIL_FROM | From email address | noreply@teamflow.com |
| CLIENT_URL | Frontend URL | http://localhost:5000 |

## 🚢 Deployment

### Deploy to Render

1. Push code to GitHub
2. Create new Web Service on Render
3. Connect your repository
4. Set environment variables
5. Deploy!

### Deploy to Heroku

```bash
heroku create your-app-name
heroku addons:create heroku-postgresql:hobby-dev
heroku config:set JWT_SECRET=your-secret JWT_EXPIRES_IN=7d
git push heroku main
heroku run npx prisma migrate deploy
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Olalekan Olajide
- Ezekiel Donkor
- Essien Wisdom Udeme
- Ogunkanmi Favour Funmilayo
- Goodness ChukwuemekaGoodness Chukwuemeka

## 🙏 Acknowledgments

- Express.js team
- Prisma team
- OpenAPI community

## 📧 Contact

For support or inquiries: support@teamflow.com

---

**Built with ❤️ using Node.js and Express**