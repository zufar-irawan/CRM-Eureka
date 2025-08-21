// models/tasks/taskAttachmentModel.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/db.js';

export const TaskAttachments = sequelize.define('TaskAttachment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  task_result_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'task_results',
      key: 'id'
    }
  },
  original_filename: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: "Original filename cannot be empty"
      }
    }
  },
  stored_filename: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: {
        msg: "Stored filename cannot be empty"
      }
    }
  },
  file_path: {
    type: DataTypes.STRING(500),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: "File path cannot be empty"
      }
    }
  },
  file_size: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [1], // Fixed: Use array format and minimum 1 byte
        msg: "File size must be positive"
      }
    }
  },
  file_type: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      isIn: {
        args: [['image', 'document', 'video', 'audio', 'other']],
        msg: "Invalid file type"
      }
    }
  },
  mime_type: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  compressed_size: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: {
        args: [1], 
        msg: "Compressed size must be positive"
      }
    }
  },
  compression_ratio: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    validate: {
      min: {
        args: [0.01], 
        msg: "Compression ratio must be positive"
      },
      max: {
        args: [100], 
        msg: "Compression ratio cannot exceed 100"
      }
    }
  },
  upload_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  uploaded_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  }
}, {
  tableName: 'task_attachments',
  timestamps: false,
  indexes: [
    {
      fields: ['task_result_id']
    },
    {
      fields: ['stored_filename'],
      unique: true
    },
    {
      fields: ['file_type']
    },
    {
      fields: ['uploaded_at']
    }
  ]
});