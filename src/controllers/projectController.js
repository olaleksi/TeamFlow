import { prisma } from "../config/database.js";
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";

export const createProject = catchAsync(async (req, res, next) => {
    const { name, description } = req.body;
    const userId = req.user?.id;

    if (!name || !userId) {
        return next(new AppError("Project name is required", 400));
    }

    const project = await prisma.project.create({
        data: {
            name,
            description: description || null,
            owner: {
                connect: { id: userId },
            },
            members: {
                create: {
                    userId,
                    role: "OWNER",
                },
            },
        },
        include: {
            owner: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                },
            },
            members: {
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                },
            },
        },
    });

  res.status(201).json({
    status: "success",
    data: {
            project,
        },
    });
});

// @desc    Get projects for current user
// @route   GET /api/projects
export const getMyProjects = catchAsync(async (req, res) => {
    const userId = req.user?.id;

    const projects = await prisma.project.findMany({
        where: {
            OR: [
                { ownerId: userId },
                {
                    members: {
                        some: { userId },
                    },
                },
            ],
        },
        include: {
            owner: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                },
            },
            members: {
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    res.status(200).json({
        status: "success",
        results: projects.length,
        data: {
            projects,
        },
    });
});

// @desc    Get a single project by id
// @route   GET /api/projects/:projectId
export const getProjectById = catchAsync(async (req, res, next) => {
    const { projectId } = req.params;
    const userId = req.user?.id;

    if (!projectId) {
        return next(new AppError("Project ID is required", 400));
    }

    const project = await prisma.project.findFirst({
        where: {
            id: projectId,
            OR: [
                { ownerId: userId },
                {
                    members: {
                        some: {
                            userId,
                            role: { in: ["OWNER", "ADMIN", "MEMBER"] },
                        },
                    },
                },
            ],
        },
        include: {
            owner: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                },
            },
            members: {
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                },
            },
            tasks: true,
        },
    });

    if (!project) {
        return next(new AppError("Project not found or access denied", 404));
    }

    res.status(200).json({
        status: "success",
        data: {
            project,
        },
    });
});

// @desc    Update project
// @route   PATCH /api/projects/:projectId
export const updateProject = catchAsync(async (req, res, next) => {
    const { projectId } = req.params;
    const { name, description } = req.body;
    const userId = req.user?.id;

    if (!projectId) {
        return next(new AppError("Project ID is required", 400));
    }

    const project = await prisma.project.findFirst({
        where: {
            id: projectId,
            OR: [
                { ownerId: userId },
                {
                    members: {
                        some: {
                            userId,
                            role: { in: ["OWNER", "ADMIN"] },
                        },
                    },
                },
            ],
        },
    });

    if (!project) {
        return next(new AppError("Project not found or access denied", 404));
    }

    const updatedProject = await prisma.project.update({
        where: { id: projectId },
        data: {
            name: name ?? project.name,
            description: description ?? project.description,
        },
    });

  res.status(200).json({
    status: "success",
    data: {
            project: updatedProject,
        },
    });
});

// @desc    Delete project (owner only)
// @route   DELETE /api/projects/:projectId
export const deleteProject = catchAsync(async (req, res, next) => {
    const { projectId } = req.params;
    const userId = req.user?.id;

    if (!projectId) {
        return next(new AppError("Project ID is required", 400));
    }

    const project = await prisma.project.findUnique({
        where: { id: projectId },
    });

    if (!project || project.ownerId !== userId) {
        return next(new AppError("Project not found or access denied", 404));
    }

    await prisma.$transaction([
        prisma.activityLog.deleteMany({ where: { projectId } }),
        prisma.task.deleteMany({ where: { projectId } }),
        prisma.projectMember.deleteMany({ where: { projectId } }),
        prisma.project.delete({ where: { id: projectId } }),
    ]);

    res.status(200).json({
        status: "success",
        message: "Project deleted successfully",
    });
});

// @desc    Add member to project
// @route   POST /api/projects/:projectId/members
export const addProjectMember = catchAsync(async (req, res, next) => {
    const { projectId } = req.params;
    const { email, role } = req.body;
    const currentUserId = req.user?.id;

    if (!projectId || !email) {
        return next(new AppError("Project ID and email are required", 400));
    }

    const targetUser = await prisma.user.findUnique({
        where: { email: email }
    });

    if (!targetUser) {
        return next(new AppError("User not found with that email", 400));
    }

    const userId = targetUser.id;
    

    const project = await prisma.project.findFirst({
        where: {
            id: projectId,
            OR: [
                { ownerId: currentUserId },
                {
                    members: {
                        some: {
                            userId: currentUserId,
                            role: { in: ["OWNER", "ADMIN"] },
                        },
                    },
                },
            ],
        },
    });

    if (!project) {
        return next(new AppError("Project not found or access denied", 404));
    }

    const existingMember = await prisma.projectMember.findUnique({
        where: {
            projectId_userId: {
                projectId,
                userId,
            },
        },
    });

    if (existingMember) {
        return next(new AppError("User is already a member of this project", 400));
    }

    const member = await prisma.projectMember.create({
        data: {
            projectId,
            userId,
            role: role.toUpperCase() || "MEMBER",
        },
        include: {
            user: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                },
            },
        },
    });

  res.status(201).json({
    status: "success",
    data: {
            member,
        },
    });
});

// @desc    Update project member role
// @route   PATCH /api/projects/:projectId/members/:memberId
export const updateProjectMemberRole = catchAsync(async (req, res, next) => {
    const { projectId, memberId } = req.params;
    const { role } = req.body;
    const currentUserId = req.user?.id;

    if (!projectId || !memberId || !role) {
        return next(
            new AppError("Project ID, member ID, and role are required", 400),
        );
    }

    const project = await prisma.project.findFirst({
        where: {
            id: projectId,
            OR: [
                { ownerId: currentUserId },
                {
                    members: {
                        some: {
                            userId: currentUserId,
                            role: { in: ["OWNER", "ADMIN"] },
                        },
                    },
                },
            ],
        },
    });

    if (!project) {
        return next(new AppError("Project not found or access denied", 404));
    }

    const membership = await prisma.projectMember.findUnique({
        where: {
            projectId_userId: {
                projectId,
                userId: memberId,
            },
        },
    });

    if (!membership) {
        return next(new AppError("Member not found in this project", 404));
    }

    if (membership.role === "OWNER") {
        return next(new AppError("Cannot change role for the owner", 400));
    }

    const updatedMembership = await prisma.projectMember.update({
      where: {
        projectId_userId: {
          projectId,
          userId: memberId,
        },
      },
      data: {
        role: role.toUpperCase(),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

  res.status(200).json({
    status: "success",
    data: {
            member: updatedMembership,
        },
    });
});

// @desc    Remove member from project
// @route   DELETE /api/projects/:projectId/members/:memberId
export const removeProjectMember = catchAsync(async (req, res, next) => {
    const { projectId, memberId } = req.params;
    const currentUserId = req.user?.id;

    if (!projectId || !memberId) {
        return next(new AppError("Project ID and member ID are required", 400));
    }

    const project = await prisma.project.findFirst({
        where: {
            id: projectId,
            OR: [
                { ownerId: currentUserId },
                {
                    members: {
                        some: {
                            userId: currentUserId,
                            role: { in: ["OWNER", "ADMIN"] },
                        },
                    },
                },
            ],
        },
    });

    if (!project) {
        return next(new AppError("Project not found or access denied", 404));
    }

    const membership = await prisma.projectMember.findUnique({
        where: {
            projectId_userId: {
                projectId,
                userId: memberId,
            },
        },
    });

    if (!membership) {
        return next(new AppError("Member not found in this project", 404));
    }

    if (membership.role === "OWNER") {
        return next(new AppError("Cannot remove the project owner", 400));
    }

    await prisma.projectMember.delete({
        where: {
            projectId_userId: {
                projectId,
                userId: memberId,
            },
        },
    });

  res.status(200).json({
    status: "success",
    message: "Member removed successfully",
    });
});
