import { prisma } from "../config/database.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";


export const getProfile = catchAsync(async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            isVerified: true,
            createdAt: true,
            updatedAt: true,
            _count: {
                select: {
                    projects: true,
                    tasks: true,
                    assignedTasks: true,
                },
            },
        },
    });

    res.status(200).json({
        status: "success",
        data: { user },
    });
});


export const updateProfile = catchAsync(async (req, res, next) => {
    const { firstName, lastName } = req.body;
    const userId = req.user.id;

    if (!firstName || !lastName) {
        return next(new AppError("First and last name is required", 400))
    }

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { firstName, lastName },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            isVerified: true,
        },
    });

    res.status(200).json({
        status: "success",
        data: { user: updatedUser },
    });
});


export const searchUser = catchAsync(async (req, res, next) => {
    const { email } = req.query;

    if (!email) {
        return next(new AppError("Email query parameter is required", 400));
    }

    const users = await prisma.user.findMany({
        where: {
            email: {
                contains: email,
                mode: "insensitive",
            },
        },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
        },
        take: 10,
    });

    res.status(200).json({
        status: "success",
        results: users.length,
        data: { users },
    });
});