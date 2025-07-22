import { DataTypes, Sequelize } from "sequelize";
import { sequelize } from "../config/db.js";

export const Tasks = sequelize.define('Tasks', {
    title: DataTypes.STRING,
    status: DataTypes.STRING,
})