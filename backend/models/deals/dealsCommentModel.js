// File: models/dealCommentsModel.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/db.js';

export const DealComments = sequelize.define('DealComments', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    deal_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'deals',
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
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'deal_comments',
    timestamps: false
});