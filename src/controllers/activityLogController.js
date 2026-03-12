import {
  getProjectActivityLogs,
  getTaskActivityLogs
} from "../services/activityLoggerServices.js";

export const getProjectLogs = async (req, res) => {

  try {

    const { projectId } = req.params;

    const logs = await getProjectActivityLogs(projectId);

    res.status(200).json(logs);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getTaskLogs = async (req, res) => {

  try {

    const { taskId } = req.params;

    const logs = await getTaskActivityLogs(taskId);

    res.status(200).json(logs);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};