import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/db.js';

export const TaskResults = sequelize.define('TaskResult', {
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
  result_text: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: "Result text cannot be empty"
      }
    }
  },
  result_type: {
    type: DataTypes.ENUM('meeting', 'call', 'email', 'visit', 'note'),
    defaultValue: 'note',
    allowNull: false
  },
  result_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'task_results',
  timestamps: false
});