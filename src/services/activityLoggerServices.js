// Import Prisma client 
import { prisma } from "../config/database.js";


// CREATE ACTIVITY LOG
export const createActivityLog = async ({
  action,
  userId = null,
  projectId = null,
  taskId = null,
  details = null
}) => {

  // VALIDATION

  // Ensure the required field "action" exists
  if (!action) {
    return { success: false, message: "Action is required" };
  }

  try {

    // DATABASE OPERATION

    // Create a new record in the ActivityLog table
    const log = await prisma.activityLog.create({
      data: {
        // Description of the event
        action,

        // User responsible for the action (optional)
        userId: userId || null,

        // Associated project if applicable
        projectId: projectId || null,

        // Associated task if applicable
        taskId: taskId || null,

        // Optional details stored as JSON
        details: details || {}, //Ensure it's at least an empty object
      },
    });

    console.log(`📝 Activity logged: ${action}`);
   // return the created log or a success message

    return {
      success: true,
      message: "Activity logged successfully",
      log
    };

  } catch (error) {

    // ERROR HANDLING
    // Log the error for debugging purposes and throw a user-friendly error message

    console.error("Activity Log Error:", error);
    return { success: false, error: error.message };

    // throw new Error("Failed to create activity log");
    // dont throw error to avoid breaking main fucntionalty
  }
};



// FUNCTION: GET LOGS FOR A PROJECT


export const getProjectActivityLogs = async (projectId, limit = 50, skip = 0) => {
  // Validate required field
  // if (!projectId) {
  //   throw new Error("Project ID is required to fetch activity logs");
  // }

  
    // Retrieve logs related to a project
    const logs = await prisma.activityLog.findMany({
      where: { projectId },
      take: limit,//pagination
      skip: skip,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          },
        },
        task: {
          select: {
            id: true,
            title: true
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      }
    });

    return {
      success: true,
      count: logs.length,
      logs,
    };
  
    
};



// FUNCTION: GET LOGS FOR A TASK


export const getTaskActivityLogs = async (taskId) => {

  // if (!taskId) {
  //   throw new Error("Task ID is required to fetch task logs");
  // }

  

    const logs = await prisma.activityLog.findMany({
      where: { taskId },
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      count: logs.length,
      logs
    };

  
    // throw new Error("Failed to retrieve task activity logs");
  
};




// FUNCTION: DELETE OLD LOGS 

export const deleteOldLogs = async (days = 90) => {

  try {

    // Calculate the cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await prisma.activityLog.deleteMany({

      where: {
        createdAt: {
          lt: cutoffDate
        }
      }

    });

    return {
      success: true,
      deletedCount: result.count
    };

  } catch (error) {

    console.error("Delete Old Logs Error:", error);

    // throw new Error("Failed to delete old activity logs");
  }
};