// models/deals/dealsModel.js - Updated with code field
import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/db.js';

export const Deals = sequelize.define('Deals', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    code: {
        type: DataTypes.STRING(20),
        allowNull: true,
        unique: true
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
        allowNull: true, 
        references: {
            model: 'contacts',
            key: 'id'
        }
    },
    id_company: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'companies',
            key: 'id'
        }
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    value: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: true,
        defaultValue: 0
    },
    stage: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: 'proposal'
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