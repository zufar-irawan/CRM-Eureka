import { Tasks } from "../models/tasksModel";

export const getTasks = async (req, res) => {
    try {
        const tasks = await Tasks.findAll();
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: "Error fetching tasks", error: error.message });
    }
}