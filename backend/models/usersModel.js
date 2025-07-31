import { sequelize } from '../config/db.js';
import { DataTypes } from 'sequelize';
import crypto from 'crypto';

export const User = sequelize.define('users', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: false,
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const md5Hash = crypto.createHash('md5').update(user.password).digest('hex');
        user.password = md5Hash;
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const md5Hash = crypto.createHash('md5').update(user.password).digest('hex');
        user.password = md5Hash;
      }
    }
  }
});

export default User;