import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Leads = sequelize.define('Lead', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  owner: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  company: {
    type: DataTypes.STRING,
    allowNull: true
  },
  title: {
    type: DataTypes.ENUM('Mr', 'Ms', 'Mrs'),
    allowNull: true
  },
  first_name: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  last_name: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  fullname: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  job_position: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  mobile: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  fax: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  website: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  industry: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  number_of_employees: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  lead_source: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  stage: {
    type: DataTypes.ENUM('New', 'Contacted', 'Qualification', 'Converted', 'Lost'),
    allowNull: true
  },
  rating: {
    type: DataTypes.ENUM('Hot', 'Warm', 'Cold'),
    allowNull: true
  },
  street: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  state: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  postal_code: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  country: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'leads',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});
