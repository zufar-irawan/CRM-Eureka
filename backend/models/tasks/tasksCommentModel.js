import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/db.js';

export const TaskComments = sequelize.define('TaskComment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  task_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'tasks',
      key: 'id'
    }
  },
  comment_text: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  commented_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  commented_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'task_comments',
  timestamps: false
});