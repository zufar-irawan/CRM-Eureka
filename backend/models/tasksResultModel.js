import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const TaskResults = sequelize.define('TaskResult', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  task_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  result_text: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  result_type: {
    type: DataTypes.ENUM('meeting', 'call', 'email', 'visit', 'note'),
    defaultValue: 'note'
  },
  result_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'task_results',
  timestamps: false
});