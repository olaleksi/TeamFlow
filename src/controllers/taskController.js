import { prisma } from "../config/database.js";
import { createActivityLog } from "../services/activityLoggerServices.js";
import {sendTaskAssignmentEmail} from "../services/emailService.js"
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";
import dotenv from "dotenv";
dotenv.config();``
const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";


// @desc    Create a new task
// @route   POST /api/projects/:projectId/tasks
// @access  Private
export const createTask = catchAsync(async (req, res, next) => {
  const { projectId } = req.params;
  const { title, description, priority, dueDate, email } = req.body;
  const userId = req.user.id;
  
  

  if (!title || !description || !projectId || !userId || !email) {
    return next(
      new AppError(
        "All fields (title, description, projectId, userId, email) are mandatory.",
        400,
      ),
    );
  }

  const getTaskAssigneeId = await prisma.user.findUnique({
    where: { email: email },
  });

  if (!getTaskAssigneeId) {
    return next(new AppError("User not found", 404));
  }

  const assigneeId = getTaskAssigneeId.id;

  // const currentUser = req.user; // authenticated user

  // Check if project exists and user has access
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [
        { ownerId: userId },
        {
          members: {
            some: {
              userId: userId,
              role: { in: ["OWNER", "ADMIN", "MEMBER"] },
            },
          },
        },
      ],
    },
  });

  if (!project) {
    return next(
      new AppError("Project not found or you do not have access", 404),
    );
  }

  // create task
  const task = await prisma.task.create({
    data: {
      title,
      description,
      priority: priority.toUpperCase() || "MEDIUM",
      dueDate: dueDate ? new Date(dueDate) : null,

      project: {
        connect: { id: projectId },
      },

      createdBy: {
        connect: { id: userId },
      },
      assignee: assigneeId ? {connect: {id: assigneeId}} : undefined,
      status: "TODO",
    },
    include: {
      assignee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  // ACTIVITY LOG
  // Log the action WITHOUT 'await' so it runs in the background
  createActivityLog({
    action: "Task Created",
    userId: userId,
    projectId: projectId,
    taskId: task.id,
    details: {
      taskTitle: title,
    },
  });

  const taskUrl = `${baseUrl}/projects/${task.projectId}/tasks/${task.id}`;

  // Send email notification if assigned to someone
  if (assigneeId && assigneeId !== userId) {
    const assignee = await prisma.user.findUnique({
      where: { id: assigneeId },
      select: { email: true, firstName: true },
    });

    // if data is found
    if (assignee) {
      const assignedByName = `${req.user.firstName} ${req.user.lastName}`;
      await sendTaskAssignmentEmail(
        assignee.email,
        assignedByName,
        title,
        project.name,
        taskUrl
      );
    }
  }

  res.status(201).json({
    status: "success",
    data: {
      task,
    },
  });
});









// @desc    Assign task to user
// @route   PATCH /api/tasks/:taskId/assign
// @access  Private
export const assignTask = catchAsync(async (req, res, next) => {


const { taskId} = req.params;
  const {  email } = req.body;

  // validation
  if (!taskId || !email) {
    return next(new AppError("TaskId and Email are required",400))
  }

  const getAssigneeId = await prisma.user.findUnique({
    where: { email: email }
  });


  if (!getAssigneeId) {
    return next(new AppError("User not found",404))
  }

  const userId = getAssigneeId.id

  // update the task
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        assignee: {
          connect: { id: userId },
        },
      },
      include: { project: true }, // Fetches project name for the email
    });

    createActivityLog({
      action: "Task Assigned",
      userId: req.user.id, //who is asigning the task
      projectId: updatedTask.projectId,
      taskId: updatedTask.id,
      details: {
        assignee: userId // who recieves the task
      }
    });
  
    const taskUrl = `${baseUrl}/projects/${updatedTask.projectId}/tasks/${updatedTask.id}`;
  
  // Send email notification if assigned to someone
  const assignee = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, firstName: true },
  });

  // if data is found
  if (assignee) {
   
    const assignedByName = `${req.user.firstName} ${req.user.lastName}`;
    await sendTaskAssignmentEmail(
      assignee.email,
      assignedByName,
      updatedTask.title,
      updatedTask.project.name,
      taskUrl,
    );
  }
  res.status(200).json({
    status: "success",
    data: {
      task: updatedTask,
    },
  });
});





// @desc    update a task status
// @route   PATCH /api/tasks/:taskId/status
// @access  Private

export const updateTaskStatus = catchAsync(async (req, res, next) => {
  const { taskId } = req.params;
  const { status } = req.body;

  // using the logged in user id from auth middleware
  const currentUserId = req.user.id;

  if (!taskId || !status) {
    return next(new AppError("Task ID and new status are required", 400));
  }

  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: {
      status: status.toUpperCase(), // Prevents "done" vs "DONE" errors
    },
  });


  // Log the activity using the actual person who made the change
  createActivityLog({
    action: "Task Status Updated",
    userId: currentUserId,
    projectId: updatedTask.projectId,
    taskId: updatedTask.id,
    details: {
      newStatus: status,
    },
  });

  res.status(200).json({ status: "success", data: { task: updatedTask } });
});





// @desc    Get a single task
// @route   GET /api/tasks/:taskId
// @access  Private
export const getTask = catchAsync(async (req, res, next) => {
  const { taskId } = req.params;
  const userId = req.user.id;

  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      project: {
        OR: [
          { ownerId: userId },
          {
            members: {
              some: { userId: userId }
            }
          }
        ]
      }
    },
    include: {
      assignee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      },
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      },
      project: {
        select: {
          id: true,
          name: true,
          ownerId: true
        }
      }
    }
  });

  if (!task) {
    return next(new AppError('Task not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      task
    }
  });
});



// @desc    Get all tasks for a project
// @route   GET /api/projects/:projectId/tasks
// @access  Private
export const getProjectTasks = catchAsync(async (req, res, next) => {
  const { projectId } = req.params;
  const { status, priority, assigneeId, page = 1, limit = 10 } = req.query;
  const userId = req.user.id;

  // Check project access
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [
        { ownerId: userId },
        {
          members: {
            some: { userId: userId }
          }
        }
      ]
    }
  });

  if (!project) {
    return next(new AppError('Project not found or you do not have access', 404));
  }

  // Build filter conditions
  const where = { projectId };
  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (assigneeId) where.assigneeId = assigneeId;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const tasks = await prisma.task.findMany({
    where,
    include: {
      assignee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      },
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      },
      _count: {
        select: {
          activities: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    skip,
    take: parseInt(limit)
  });

  const total = await prisma.task.count({ where });

  res.status(200).json({
    status: 'success',
    results: tasks.length,
    data: {
      tasks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
});



// @desc    Delete a task
// @route   DELETE /api/tasks/:taskId
// @access  Private (Owner or Admin only)
export const deleteTask = catchAsync(async (req, res, next) => {
  const { taskId } = req.params;
  const userId = req.user.id;

  // Check if task exists and user has delete permission
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      project: {
        OR: [
          { ownerId: userId },
          {
            members: {
              some: {
                userId: userId,
                role: { in: ["OWNER", "ADMIN"] },
              },
            },
          },
        ],
      },
    },
    include: {
      project: true,
    },
  });

  if (!task) {
    return next(
      new AppError(
        "Task not found or you do not have permission to delete",
        404,
      ),
    );
  }

  // Log activity before deletion
  createActivityLog({
    action: "Task Deleted",
    userId: userId,
    projectId: task.projectId,
    taskId: task.id,
    details: {
      taskTitle: task.title,
    },
  });

  // Delete task
  await prisma.task.delete({
    where: { id: taskId },
  });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

// @desc    Get my assigned tasks across all projects
// @route   GET /api/tasks/assigned/me
// @access  Private
export const getMyAssignedTasks = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { status, page = 1, limit = 10 } = req.query;

  const where = { 
    assigneeId: userId,
    ...(status && { status })
  };

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const tasks = await prisma.task.findMany({
    where,
    include: {
      project: {
        select: {
          id: true,
          name: true
        }
      },
      createdBy: {
        select: {
          firstName: true,
          lastName: true
        }
      }
    },
    orderBy: {
      dueDate: 'asc'
    },
    skip,
    take: parseInt(limit)
  });

  const total = await prisma.task.count({ where });

  res.status(200).json({
    status: 'success',
    results: tasks.length,
    data: {
      tasks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
});

// * Delete task

// * Get tasks by project

// * Get tasks assigned to logged-in user