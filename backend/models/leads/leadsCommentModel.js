// models/leads/leadsCommentModel.js
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
  parent_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'lead_comments',
      key: 'id'
    },
    comment: 'Parent comment ID for nested replies'
  },
  reply_level: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 5 
    },
    comment: 'Nesting level: 0=top level, 1=reply, 2=reply to reply, etc'
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
  updatedAt: false,
  indexes: [
    {
      fields: ['lead_id']
    },
    {
      fields: ['parent_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['lead_id', 'parent_id']
    }
  ]
});

// Self-referencing association untuk nested comments
LeadComments.hasMany(LeadComments, {
  as: 'replies',
  foreignKey: 'parent_id',
  onDelete: 'CASCADE'
});

LeadComments.belongsTo(LeadComments, {
  as: 'parent',
  foreignKey: 'parent_id'
});