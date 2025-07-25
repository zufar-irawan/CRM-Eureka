import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/db.js';

export const LeadComments = sequelize.define('LeadComment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  lead_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'leads',
      key: 'id'
    }
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  user_name: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: "Message cannot be empty"
      }
    }
  }
}, {
  tableName: 'lead_comments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});