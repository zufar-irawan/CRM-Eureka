import { DataTypes } from "sequelize";
import { sequelize } from "../../config/db.js";

export const SalesKpiDaily = sequelize.define('SalesKpiDaily', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sales_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  sales_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  kanvasing_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  followup_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  penawaran_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  kesepakatan_tarif_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  deal_do_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status_kpi: {
    type: DataTypes.ENUM('Terpenuhi', 'Tidak Terpenuhi'),
    defaultValue: 'Tidak Terpenuhi'
  }
}, {
  tableName: 'sales_kpi_daily',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['sales_id', 'date'],
      name: 'unique_sales_date'
    }
  ]
});

export const SalesKpiMonthly = sequelize.define('SalesKpiMonthly', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sales_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  sales_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  month: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  kanvasing_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  followup_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  penawaran_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  kesepakatan_tarif_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  deal_do_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status_kpi: {
    type: DataTypes.ENUM('Terpenuhi', 'Tidak Terpenuhi'),
    defaultValue: 'Tidak Terpenuhi'
  }
}, {
  tableName: 'sales_kpi_monthly',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['sales_id', 'year', 'month'],
      name: 'unique_sales_month'
    }
  ]
});

export const KpiTargets = sequelize.define('KpiTargets', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  type: {
    type: DataTypes.ENUM('daily', 'monthly'),
    allowNull: false
  },
  kanvasing_target: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  followup_target: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  penawaran_target: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  kesepakatan_tarif_target: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  deal_do_target: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'kpi_targets',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default {
  SalesKpiDaily,
  SalesKpiMonthly,
  KpiTargets
};