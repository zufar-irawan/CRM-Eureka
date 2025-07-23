import { Tasks } from "../models/tasksModel.js";

export const getTasks = async (req, res) => {
  try {
    const tasks = await Tasks.findAll();
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tasks", error: error.message });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const task = await Tasks.findOne({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: "Error fetching task", error: error.message });
  }
};