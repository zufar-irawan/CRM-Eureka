import { DataTypes, Sequelize } from "sequelize";
import { sequelize } from "../config/db.js";

export const Leads= sequelize.define('Leads', {
    name: DataTypes.STRING,
    status: DataTypes.STRING,
})