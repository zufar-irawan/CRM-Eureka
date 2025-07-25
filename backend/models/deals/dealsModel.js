// File: models/dealsModel.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/db.js';

export const Deals = sequelize.define('Deals', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    lead_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'leads',
            key: 'id'
        }
    },
    id_contact: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    id_company: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    value: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: true
    },
    stage: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    owner: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'deals',
    timestamps: false
});