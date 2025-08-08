//models/contacts/contactsModel.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/db.js';

export const Contacts = sequelize.define('Contacts', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    company_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'companies',
            key: 'id'
        }
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
            isEmail: {
                msg: "Must be a valid email address"
            }
        }
    },
    phone: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    position: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'contacts',
    timestamps: false
});