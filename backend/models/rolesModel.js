import { sequelize } from '../config/db.js';
import { DataTypes } from 'sequelize';

// Role Model
export const Role = sequelize.define('roles', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  }
}, {
  timestamps: false,
  tableName: 'roles'
});

// User Roles Junction Table
export const UserRole = sequelize.define('user_roles', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  role_id: {
    type: DataTypes.INTEGER,
    primaryKey: true
  }
}, {
  timestamps: false,
  tableName: 'user_roles'
});

export default { Role, UserRole };