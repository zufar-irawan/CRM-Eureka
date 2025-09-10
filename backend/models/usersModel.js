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
  },
  // Hierarchy fields
  manager_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  asmen_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  gl_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
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

// Helper method to get user hierarchy info
User.prototype.getHierarchyInfo = function() {
  return {
    id: this.id,
    name: this.name,
    email: this.email,
    manager_id: this.manager_id,
    asmen_id: this.asmen_id,
    gl_id: this.gl_id,
    isTopLevel: !this.manager_id && !this.asmen_id && !this.gl_id,
    hierarchyLevel: this.gl_id ? 'sales' : 
                    this.asmen_id ? 'gl' : 
                    this.manager_id ? 'asmen' : 'manager'
  };
};

// Helper method to check if user can access another user's data
User.prototype.canAccessUser = function(targetUserId, userRoles = []) {
  // Admin can access everyone
  if (userRoles.some(role => role.name === 'admin')) {
    return true;
  }
  
  if (this.id === targetUserId) {
    return true;
  }
  return false;
};

export default User;