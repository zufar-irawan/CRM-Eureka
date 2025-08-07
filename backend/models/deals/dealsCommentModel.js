// File: models/deals/dealsCommentModel.js - Updated with nested replies support like leads
import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/db.js';

export const DealComments = sequelize.define('DealComment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  deal_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'deals',
      key: 'id'
    }
  },
  parent_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'deal_comments',
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
  tableName: 'deal_comments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      fields: ['deal_id']
    },
    {
      fields: ['parent_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['deal_id', 'parent_id'] 
    }
  ]
});

// Self-referencing association untuk nested comments
DealComments.hasMany(DealComments, {
  as: 'replies',
  foreignKey: 'parent_id',
  onDelete: 'CASCADE'
});

DealComments.belongsTo(DealComments, {
  as: 'parent',
  foreignKey: 'parent_id'
});