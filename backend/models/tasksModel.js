import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Tasks = sequelize.define('Task', {
  lead_id: DataTypes.INTEGER,
  assigned_to: DataTypes.INTEGER,
  title: DataTypes.STRING,
  description: DataTypes.TEXT,
  category: DataTypes.STRING,
  due_date: DataTypes.DATE,
  status: DataTypes.STRING,
  priority: DataTypes.STRING,
}, {
  tableName: 'tasks',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});
