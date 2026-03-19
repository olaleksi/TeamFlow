import {
  getProjectActivityLogs,
  getTaskActivityLogs
} from "../services/activityLoggerServices.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

// GET	/logs/user/:userId
export const getProjectLogs = catchAsync(async (req, res, next) => {
  const { projectId } = req.params;
  const { limit = 50, skip = 0 } = req.query; // Support for pagination

  // check if project id exist
  if (!projectId) {
    return next(new AppError("Project ID is required", 400));
  }

  const logs = await getProjectActivityLogs(projectId, Number(limit), Number(skip));

  if (!logs || !logs.success) {
    return next(new AppError("Could not retrieve logs", 500));
  }

  // 4. Send Success Response
  res.status(200).json(logs);
});


// GET	/logs/task/:taskId
export const getTaskLogs = catchAsync(async (req, res, next) => {

    const { taskId } = req.params;

    if (!taskId) {
      return next(new AppError("Task id is required",400))
    }

    const logs = await getTaskActivityLogs(taskId);


  res.status(200).json(logs);

 
});