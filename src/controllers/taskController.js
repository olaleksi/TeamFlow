import prisma from "../prisma/client.js";
import { createActivityLog } from "../services/activityLoggerServices.js";


export const createTask = async (req, res) => {

  try {

    const { title, description, projectId, userId } = req.body;
    // const currentUser = req.user; // authenticated user

    const task = await prisma.task.create({
  data: {
    title,
    description,

    project: {
      connect: { id: projectId }
    },

    createdBy: {
      connect: { id: userId }
    }
  }
});

    // ACTIVITY LOG
    await createActivityLog({
      action: "Task Created",
      userId: userId,
      projectId: projectId,
      taskId: task.id,
      details: {
        taskTitle: title
      }
    });

    res.status(201).json(task);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const assignTask = async (req, res) => {

  try {

    const { taskId, userId } = req.body;

    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        assignee: {
          connect: { id: userId }
        }
      }
    });

    await createActivityLog({
      action: "Task Assigned",
      userId: userId,
      projectId: task.projectId,
      taskId: task.id,
      details: {
        assignee: userId
      }
    });

    res.status(200).json(task);


    // ACTIVITY LOG
    await createActivityLog({
      action: "Task Assigned",
      userId: userId,
      taskId: taskId,
      projectId: updatedTask.projectId,
      details: {
        assigned: true
      }
    }
  );

res.json(updatedTask);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }

};

export const updateTaskStatus = async (req, res) => {

  try {

    const { id } = req.params;
    const { status, userId } = req.body;

    const task = await prisma.task.update({
      where: { id: id },
      data: {
        status: status
      }
    });

    await createActivityLog({
      action: "Task Status Updated",
      userId: userId,
      projectId: task.projectId,
      taskId: task.id,
      details: {
        newStatus: status
      }
    });

    res.status(200).json(task);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }

};

// export const updateTaskStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;

//     const task = await prisma.task.update({
//       where: { id },
//       data: { status }
//     });

//     await createActivityLog({
//       action: "Task Status Updated",
//       projectId: task.projectId,
//       taskId: task.id
//     });

//     res.status(200).json(task);

//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };