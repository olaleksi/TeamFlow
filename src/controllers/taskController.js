import { prisma } from "../config/database.js";
import { createActivityLog } from "../services/activityLoggerServices.js";
import {sendTaskAssignmentEmail} from "../services/emailService.js"
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";

// @desc    Create a new task
// @route   POST /api/projects/:projectId/tasks

export const createTask = catchAsync(async (req, res, next) => {
  const { projectId } = req.params;
  const { title, description, priority, dueDate, assigneeId } = req.body;
  const  userId = req.user.id;

  if (!title || !description || !projectId || !userId) {
    return next(new AppError("Field required", 400));
  }
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
      priority: priority || "MEDIUM",
      dueDate: dueDate ? new Date(dueDate) : null,

      project: {
        connect: { id: projectId },
      },

      createdBy: {
        connect: { id: userId },
      },
      assigneeId: assigneeId || null,
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



// assign task
export const assignTask = catchAsync(async (req, res, next) => {



  const { taskId, userId } = req.body;

  // validation
  if (!taskId || !userId) {
    return next(new AppError("Field is required",400))
  }

  // update the task
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        assignee: {
          connect: { id: userId }
        }
      }
    });

    await createActivityLog({
      action: "Task Assigned",
      userId: req.user.id, //who is asigning the task
      projectId: updatedTask.projectId,
      taskId: updatedTask.id,
      details: {
        assignee: userId // who recieves the task
      }
    });

  res.status(200).json({
    status: "success",
    data: {
      task: updatedTask,
    },
  });
});


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
  await createActivityLog({
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

