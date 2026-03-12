// Import Prisma client 
import prisma from "../prisma/client.js";

// CREATE ACTIVITY LOG
export const createActivityLog = async ({
  action,
  userId = null,
  projectId = null,
  taskId = null,
  metadata = null
}) => {

  // VALIDATION

  // Ensure the required field "action" exists
  if (!action) {
    throw new Error("Action is required to create an activity log");
  }

  try {

    // DATABASE OPERATION

    // Create a new record in the ActivityLog table
    const log = await prisma.activityLog.create({

      data: {

        // Description of the event
        action,

        // User responsible for the action (optional)
        userId,

        // Associated project if applicable
        projectId,

        // Associated task if applicable
        taskId,

        // Optional metadata stored as JSON
        details: metadata
      }
    });

   // return the created log or a success message

    return {
      success: true,
      message: "Activity logged successfully",
      log
    };

  } catch (error) {

    // ERROR HANDLING
    // Log the error for debugging purposes and throw a user-friendly error message

    console.error("Activity Log Error:", error.message);

    throw new Error("Failed to create activity log");
  }
};



// FUNCTION: GET LOGS FOR A PROJECT


export const getProjectActivityLogs = async (projectId) => {

  // Validate required field
  if (!projectId) {
    throw new Error("Project ID is required to fetch activity logs");
  }

  try {

    // Retrieve logs related to a project
    const logs = await prisma.activityLog.findMany({

      where: { projectId },

      orderBy: {
        createdAt: "desc"
      }

    });

    return {
      success: true,
      count: logs.length,
      logs
    };

  } catch (error) {

    console.error("Fetch Project Logs Error:", error.message);

    throw new Error("Failed to retrieve project activity logs");
  }
};



// FUNCTION: GET LOGS FOR A TASK


export const getTaskActivityLogs = async (taskId) => {

  if (!taskId) {
    throw new Error("Task ID is required to fetch task logs");
  }

  try {

    const logs = await prisma.activityLog.findMany({

      where: { taskId },

      orderBy: {
        createdAt: "desc"
      }

    });

    return {
      success: true,
      count: logs.length,
      logs
    };

  } catch (error) {

    console.error("Fetch Task Logs Error:", error.message);

    throw new Error("Failed to retrieve task activity logs");
  }
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

    console.error("Delete Old Logs Error:", error.message);

    throw new Error("Failed to delete old activity logs");
  }
};