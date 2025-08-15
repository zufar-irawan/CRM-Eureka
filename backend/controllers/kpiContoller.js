// controllers/kpiController.js
import { SalesKpiDaily, SalesKpiMonthly, KpiTargets, TaskKpiLogs } from '../models/kpi/kpiModel.js';
import { User } from '../models/usersModel.js';
import { Tasks } from '../models/tasks/tasksModel.js';
import { Deals } from '../models/deals/dealsModel.js';
import { Op, QueryTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const calculateDailyKPI = async (userId, date) => {
  try {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    console.log(`Calculating daily KPI for user ${user.name} (${userId}) on ${targetDate}`);

    const taskCounts = await Tasks.findAll({
      attributes: [
        'category',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        assigned_to: userId,
        status: 'completed',
        [Op.and]: [
          sequelize.where(sequelize.fn('DATE', sequelize.col('updated_at')), targetDate)
        ]
      },
      group: ['category'],
      raw: true
    });

    console.log(`Task counts for ${targetDate}:`, taskCounts);

    const dealDoCount = await Deals.count({
      where: {
        created_by: userId,
        stage: 'won',
        [Op.and]: [
          sequelize.where(sequelize.fn('DATE', sequelize.col('updated_at')), targetDate)
        ]
      }
    });

    const kesepakatanTarifCount = await Deals.count({
      where: {
        created_by: userId,
        stage: {
          [Op.in]: ['negotiation', 'proposal', 'qualified', 'won']
        },
        [Op.and]: [
          sequelize.where(sequelize.fn('DATE', sequelize.col('updated_at')), targetDate)
        ]
      }
    });

    console.log(`Deal DO count: ${dealDoCount}, Kesepakatan Tarif count: ${kesepakatanTarifCount}`);

    let counts = {
      kanvasing_count: 0,
      followup_count: 0,
      penawaran_count: 0,
      kesepakatan_tarif_count: kesepakatanTarifCount,
      deal_do_count: dealDoCount
    };

    taskCounts.forEach(task => {
      const count = parseInt(task.count);
      switch (task.category) {
        case 'Kanvasing':
          counts.kanvasing_count = count;
          break;
        case 'Followup':
          counts.followup_count = count;
          break;
        case 'Penawaran':
          counts.penawaran_count = count;
          break;
        default:
          break;
      }
    });

    console.log(`📊 Final counts for ${targetDate}:`, counts);

    const dailyTarget = await KpiTargets.findOne({
      where: { type: 'daily', is_active: true }
    });

    let statusKpi = 'Tidak Terpenuhi';
    if (dailyTarget) {
      const isTargetMet = [
        counts.kanvasing_count >= dailyTarget.kanvasing_target,
        counts.followup_count >= dailyTarget.followup_target,
        counts.penawaran_count >= dailyTarget.penawaran_target,
      ].every(v => v === true);

      if (isTargetMet) {
        statusKpi = 'Terpenuhi';
      }

      console.log(`Target comparison:`, {
        kanvasing: `${counts.kanvasing_count}/${dailyTarget.kanvasing_target}`,
        followup: `${counts.followup_count}/${dailyTarget.followup_target}`,
        penawaran: `${counts.penawaran_count}/${dailyTarget.penawaran_target}`,
        status: statusKpi
      });
    }

    const [kpiDaily, created] = await SalesKpiDaily.upsert({
      sales_id: userId,
      sales_name: user.name,
      date: targetDate,
      ...counts,
      status_kpi: statusKpi
    }, {
      returning: true
    });

    console.log(`Daily KPI ${created ? 'created' : 'updated'} for user ${user.name} on ${targetDate}:`, counts);
    return kpiDaily;
  } catch (error) {
    console.error('Error calculating daily KPI:', error);
    throw error;
  }
};

export const calculateMonthlyKPI = async (userId, year, month) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    console.log(`📊 Calculating monthly KPI for user ${user.name} (${userId}) for ${year}-${month}`);

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    endDate.setHours(23, 59, 59, 999);

    const taskCounts = await Tasks.findAll({
      attributes: [
        'category',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        assigned_to: userId,
        status: 'completed',
        updated_at: {
          [Op.between]: [startDate, endDate]
        }
      },
      group: ['category'],
      raw: true
    });

    console.log(`Monthly task counts for ${year}-${month}:`, taskCounts);

    const dealDoCount = await Deals.count({
      where: {
        created_by: userId,
        stage: 'won',
        updated_at: {
          [Op.between]: [startDate, endDate]
        }
      }
    });

    const kesepakatanTarifCount = await Deals.count({
      where: {
        created_by: userId,
        stage: {
          [Op.in]: ['negotiation', 'proposal', 'qualified', 'won']
        },
        updated_at: {
          [Op.between]: [startDate, endDate]
        }
      }
    });

    console.log(`Monthly - Deal DO count: ${dealDoCount}, Kesepakatan Tarif count: ${kesepakatanTarifCount}`);

    let counts = {
      kanvasing_count: 0,
      followup_count: 0,
      penawaran_count: 0,
      kesepakatan_tarif_count: kesepakatanTarifCount,
      deal_do_count: dealDoCount
    };

    taskCounts.forEach(task => {
      const count = parseInt(task.count);
      switch (task.category) {
        case 'Kanvasing':
          counts.kanvasing_count = count;
          break;
        case 'Followup':
          counts.followup_count = count;
          break;
        case 'Penawaran':
          counts.penawaran_count = count;
          break;
        default:
          break;
      }
    });

    console.log(`Final monthly counts for ${year}-${month}:`, counts);

    const monthlyTarget = await KpiTargets.findOne({
      where: { type: 'monthly', is_active: true }
    });

    let statusKpi = 'Tidak Terpenuhi';
if (monthlyTarget) {
  const isTargetMet = counts.deal_do_count >= monthlyTarget.deal_do_target;
  if (isTargetMet) {
    statusKpi = 'Terpenuhi';
  }
  console.log(`Monthly target comparison (deal_do only):`, {
    deal_do: `${counts.deal_do_count}/${monthlyTarget.deal_do_target}`,
    status: statusKpi
  });
}

    const [kpiMonthly, created] = await SalesKpiMonthly.upsert({
      sales_id: userId,
      sales_name: user.name,
      year: year,
      month: month,
      ...counts,
      status_kpi: statusKpi
    }, {
      returning: true
    });

    console.log(`Monthly KPI ${created ? 'created' : 'updated'} for user ${user.name} for ${year}-${month}:`, counts);
    return kpiMonthly;
  } catch (error) {
    console.error('Error calculating monthly KPI:', error);
    throw error;
  }
};

export const autoUpdateKPI = async (taskId, userId) => {
  try {
    const task = await Tasks.findByPk(taskId);
    if (!task || task.status !== 'completed') {
      console.log(`Task ${taskId} not found or not completed`);
      return;
    }

    const completedDate = new Date(task.updated_at);
    const dateStr = completedDate.toISOString().split('T')[0];
    const year = completedDate.getFullYear();
    const month = completedDate.getMonth() + 1;

    console.log(`Auto-updating KPI for task ${task.code} (${task.category}) completed by user ${userId}`);

    await calculateDailyKPI(userId, dateStr);
    await calculateMonthlyKPI(userId, year, month);

    console.log(`KPI auto-updated for user ${userId} on ${dateStr}`);
  } catch (error) {
    console.error('Error auto-updating KPI:', error);
  }
};

export const autoUpdateKPIForDeal = async (dealId, userId, transaction) => {
  const transactionOption = transaction ? { transaction } : {};

  try {
    const deal = await Deals.findByPk(dealId, transactionOption);
    if (!deal) {
      console.log(`Deal ${dealId} not found`);
      return;
    }

    const updatedDate = new Date(deal.updated_at);
    const dateStr = updatedDate.toISOString().split('T')[0];
    const year = updatedDate.getFullYear();
    const month = updatedDate.getMonth() + 1;

    console.log(`Auto-updating KPI for deal ${deal.code} (stage: ${deal.stage}) by user ${userId}`);

    await calculateDailyKPI(userId, dateStr);
    await calculateMonthlyKPI(userId, year, month);

    console.log(`KPI auto-updated for deal ${deal.code} on ${dateStr}`);
  } catch (error) {
    console.error('Error auto-updating KPI for deal:', error);
  }
};

// API ENDPOINTS
export const getDailyKPI = async (req, res) => {
  try {
    const { date, sales_id, start_date, end_date } = req.query;
    let whereClause = {};

    if (sales_id) {
      whereClause.sales_id = sales_id;
    }

    if (start_date && end_date) {
      whereClause.date = {
        [Op.between]: [start_date, end_date]
      };
    } else if (date) {
      whereClause.date = date;
    } else {
      whereClause.date = new Date().toISOString().split('T')[0];
    }

    const kpiData = await SalesKpiDaily.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'sales_user',
          attributes: ['id', 'name', 'email'],
          required: false
        }
      ],
      order: [['date', 'DESC'], ['sales_name', 'ASC']]
    });

    const dailyTarget = await KpiTargets.findOne({
      where: { type: 'daily', is_active: true }
    });

    res.status(200).json({
      success: true,
      data: kpiData,
      target: dailyTarget,
      message: `Found ${kpiData.length} daily KPI records`
    });
  } catch (error) {
    console.error('Error fetching daily KPI:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching daily KPI',
      error: error.message
    });
  }
};

export const getMonthlyKPI = async (req, res) => {
  try {
    const { year, month, sales_id } = req.query;
    let whereClause = {};

    if (sales_id) {
      whereClause.sales_id = sales_id;
    }

    if (year) {
      whereClause.year = parseInt(year);
    }

    if (month) {
      whereClause.month = parseInt(month);
    }

    if (!year && !month) {
      const currentDate = new Date();
      whereClause.year = currentDate.getFullYear();
      whereClause.month = currentDate.getMonth() + 1;
    }

    const kpiData = await SalesKpiMonthly.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'sales_user',
          attributes: ['id', 'name', 'email'],
          required: false
        }
      ],
      order: [['year', 'DESC'], ['month', 'DESC'], ['sales_name', 'ASC']]
    });

    const monthlyTarget = await KpiTargets.findOne({
      where: { type: 'monthly', is_active: true }
    });

    res.status(200).json({
      success: true,
      data: kpiData,
      target: monthlyTarget,
      message: `Found ${kpiData.length} monthly KPI records`
    });
  } catch (error) {
    console.error('Error fetching monthly KPI:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching monthly KPI',
      error: error.message
    });
  }
};

export const getKPIReport = async (req, res) => {
  try {
    const {
      view_type = 'BULANAN',
      start_date,
      end_date,
      sales_name,
      year,
      month
    } = req.query;

    let data = [];
    let formattedData = [];

    if (view_type === 'HARIAN') {
      let whereClause = {};

      if (sales_name) {
        whereClause.sales_name = {
          [Op.like]: `%${sales_name}%`
        };
      }

      if (start_date && end_date) {
        whereClause.date = {
          [Op.between]: [start_date, end_date]
        };
      } else if (start_date) {
        whereClause.date = {
          [Op.gte]: start_date
        };
      } else if (end_date) {
        whereClause.date = {
          [Op.lte]: end_date
        };
      } else {
        // Default to today if no date specified
        const today = new Date().toISOString().split('T')[0];
        whereClause.date = today;
      }

      data = await SalesKpiDaily.findAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'sales_user',
            attributes: ['id', 'name', 'email'],
            required: false
          }
        ],
        order: [['date', 'DESC'], ['sales_name', 'ASC']]
      });

      // Format data untuk frontend
      formattedData = data.map(item => ({
        id: item.id,
        nama_sales: item.sales_name,
        kanvasing_task: item.kanvasing_count,
        followup_task: item.followup_count,
        penawaran_task: item.penawaran_count,
        kesepakatan_tarif_task: item.kesepakatan_tarif_count,
        deal_do_task: item.deal_do_count,
        status_kpi: item.status_kpi,
        tanggal: item.date,
        bulan: ""
      }));

    } else {
      let whereClause = {};

      if (sales_name) {
        whereClause.sales_name = {
          [Op.like]: `%${sales_name}%`
        };
      }

      if (year) {
        whereClause.year = parseInt(year);
      }
      if (month) {
        whereClause.month = parseInt(month);
      }

      if (!year && !month) {
        const currentDate = new Date();
        whereClause.year = currentDate.getFullYear();
        whereClause.month = currentDate.getMonth() + 1;
      }

      data = await SalesKpiMonthly.findAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'sales_user',
            attributes: ['id', 'name', 'email'],
            required: false
          }
        ],
        order: [['year', 'DESC'], ['month', 'DESC'], ['sales_name', 'ASC']]
      });

      formattedData = data.map(item => {
        const monthNames = [
          'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
          'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];

        return {
          id: item.id,
          nama_sales: item.sales_name,
          kanvasing_task: item.kanvasing_count,
          followup_task: item.followup_count,
          penawaran_task: item.penawaran_count,
          kesepakatan_tarif_task: item.kesepakatan_tarif_count,
          deal_do_task: item.deal_do_count,
          status_kpi: item.status_kpi,
          bulan: `${monthNames[item.month - 1]} ${item.year}`,
          tanggal: ""
        };
      });
    }

    const totalRecords = formattedData.length;
    const targetMet = formattedData.filter(record => record.status_kpi === 'Terpenuhi').length;
    const targetNotMet = totalRecords - targetMet;

    const summary = {
      total_records: totalRecords,
      target_met: targetMet,
      target_not_met: targetNotMet,
      percentage_met: totalRecords > 0 ? ((targetMet / totalRecords) * 100).toFixed(2) : 0
    };

    res.status(200).json({
      success: true,
      data: formattedData,
      summary: summary,
      view_type: view_type,
      filters: req.query,
      message: `Found ${totalRecords} KPI records`
    });
  } catch (error) {
    console.error('Error fetching KPI report:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching KPI report',
      error: error.message
    });
  }
};

export const triggerDailyKPI = async (req, res) => {
  try {
    const { user_id, date } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'user_id is required'
      });
    }

    const kpiResult = await calculateDailyKPI(user_id, date);

    res.status(200).json({
      success: true,
      message: 'Daily KPI calculated successfully',
      data: kpiResult
    });
  } catch (error) {
    console.error('Error calculating daily KPI:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating daily KPI',
      error: error.message
    });
  }
};

export const triggerMonthlyKPI = async (req, res) => {
  try {
    const { user_id, year, month } = req.body;

    if (!user_id || !year || !month) {
      return res.status(400).json({
        success: false,
        message: 'user_id, year, and month are required'
      });
    }

    const kpiResult = await calculateMonthlyKPI(user_id, parseInt(year), parseInt(month));

    res.status(200).json({
      success: true,
      message: 'Monthly KPI calculated successfully',
      data: kpiResult
    });
  } catch (error) {
    console.error('Error calculating monthly KPI:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating monthly KPI',
      error: error.message
    });
  }
};

export const getKPISummary = async (req, res) => {
  try {
    const { type = 'monthly' } = req.query;
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const currentDate = today.toISOString().split('T')[0];

    let summaryData;

    if (type === 'daily') {
      const totalSales = await SalesKpiDaily.count({
        where: { date: currentDate },
        distinct: true,
        col: 'sales_id'
      });

      const targetMet = await SalesKpiDaily.count({
        where: {
          date: currentDate,
          status_kpi: 'Terpenuhi'
        }
      });

      const aggregates = await SalesKpiDaily.findAll({
        attributes: [
          [sequelize.fn('SUM', sequelize.col('kanvasing_count')), 'totalKanvasing'],
          [sequelize.fn('SUM', sequelize.col('followup_count')), 'totalFollowup'],
          [sequelize.fn('SUM', sequelize.col('penawaran_count')), 'totalPenawaran'],
          [sequelize.fn('SUM', sequelize.col('kesepakatan_tarif_count')), 'totalKesepakatan'],
          [sequelize.fn('SUM', sequelize.col('deal_do_count')), 'totalDeals']
        ],
        where: { date: currentDate },
        raw: true
      });

      const agg = aggregates[0] || {};

      summaryData = {
        total_sales: totalSales,
        kpi_terpenuhi: targetMet,
        total_kanvasing: parseInt(agg.totalKanvasing) || 0,
        total_followup: parseInt(agg.totalFollowup) || 0,
        total_penawaran: parseInt(agg.totalPenawaran) || 0,
        total_kesepakatan_tarif: parseInt(agg.totalKesepakatan) || 0,
        total_deals: parseInt(agg.totalDeals) || 0
      };
    } else {
      const totalSales = await SalesKpiMonthly.count({
        where: { year: currentYear, month: currentMonth },
        distinct: true,
        col: 'sales_id'
      });

      const targetMet = await SalesKpiMonthly.count({
        where: {
          year: currentYear,
          month: currentMonth,
          status_kpi: 'Terpenuhi'
        }
      });

      const aggregates = await SalesKpiMonthly.findAll({
        attributes: [
          [sequelize.fn('SUM', sequelize.col('kanvasing_count')), 'totalKanvasing'],
          [sequelize.fn('SUM', sequelize.col('followup_count')), 'totalFollowup'],
          [sequelize.fn('SUM', sequelize.col('penawaran_count')), 'totalPenawaran'],
          [sequelize.fn('SUM', sequelize.col('kesepakatan_tarif_count')), 'totalKesepakatan'],
          [sequelize.fn('SUM', sequelize.col('deal_do_count')), 'totalDeals']
        ],
        where: { year: currentYear, month: currentMonth },
        raw: true
      });

      const agg = aggregates[0] || {};

      summaryData = {
        total_sales: totalSales,
        kpi_terpenuhi: targetMet,
        total_kanvasing: parseInt(agg.totalKanvasing) || 0,
        total_followup: parseInt(agg.totalFollowup) || 0,
        total_penawaran: parseInt(agg.totalPenawaran) || 0,
        total_kesepakatan_tarif: parseInt(agg.totalKesepakatan) || 0,
        total_deals: parseInt(agg.totalDeals) || 0
      };
    }

    res.status(200).json({
      success: true,
      data: summaryData,
      type: type,
      period: type === 'daily' ? currentDate : `${currentYear}-${currentMonth}`
    });
  } catch (error) {
    console.error('Error fetching KPI summary:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching KPI summary',
      error: error.message
    });
  }
};

export const getKPITargets = async (req, res) => {
  try {
    const { type } = req.query;
    let whereClause = { is_active: true };

    if (type) {
      whereClause.type = type;
    }

    const targets = await KpiTargets.findAll({
      where: whereClause,
      order: [['type', 'ASC']]
    });

    res.status(200).json({
      success: true,
      data: targets,
      message: `Found ${targets.length} KPI targets`
    });
  } catch (error) {
    console.error('Error fetching KPI targets:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching KPI targets',
      error: error.message
    });
  }
};

export const updateKPITargets = async (req, res) => {
  try {
    const { type, targets } = req.body;

    if (!type || !targets) {
      return res.status(400).json({
        success: false,
        message: 'type and targets are required'
      });
    }

    await KpiTargets.update(
      { is_active: false },
      { where: { type: type } }
    );

    const newTarget = await KpiTargets.create({
      type: type,
      kanvasing_target: targets.kanvasing_target || 0,
      followup_target: targets.followup_target || 0,
      penawaran_target: targets.penawaran_target || 0,
      kesepakatan_tarif_target: targets.kesepakatan_tarif_target || 0,
      deal_do_target: targets.deal_do_target || 0,
      is_active: true
    });

    res.status(200).json({
      success: true,
      message: 'KPI targets updated successfully',
      data: newTarget
    });
  } catch (error) {
    console.error('Error updating KPI targets:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating KPI targets',
      error: error.message
    });
  }
};

export const triggerAllUsersKPI = async (req, res) => {
  try {
    const { date, type = 'daily' } = req.body;

    const users = await User.findAll({
      attributes: ['id', 'name'],
      where: {
        id: {
          [Op.in]: sequelize.literal(`(
            SELECT DISTINCT assigned_to FROM tasks WHERE assigned_to IS NOT NULL
            UNION 
            SELECT DISTINCT created_by FROM deals WHERE created_by IS NOT NULL
          )`)
        }
      }
    });

    const results = [];
    const targetDate = date || new Date().toISOString().split('T')[0];
    const dateObj = new Date(targetDate);
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;

    console.log(`Starting bulk KPI calculation for ${users.length} users (${type})`);

    for (const user of users) {
      try {
        let kpiResult;
        if (type === 'daily') {
          kpiResult = await calculateDailyKPI(user.id, targetDate);
        } else {
          kpiResult = await calculateMonthlyKPI(user.id, year, month);
        }

        results.push({
          user_id: user.id,
          user_name: user.name,
          success: true,
          data: kpiResult
        });
      } catch (error) {
        console.error(`Error calculating KPI for user ${user.id}:`, error.message);
        results.push({
          user_id: user.id,
          user_name: user.name,
          success: false,
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const errorCount = results.filter(r => !r.success).length;

    console.log(`Bulk KPI calculation completed: ${successCount} successful, ${errorCount} failed`);

    res.status(200).json({
      success: true,
      message: `Bulk KPI calculation completed. ${successCount} successful, ${errorCount} failed.`,
      results: results,
      summary: {
        total_users: users.length,
        successful: successCount,
        failed: errorCount,
        type: type,
        date: type === 'daily' ? targetDate : `${year}-${month}`
      }
    });
  } catch (error) {
    console.error('Error in bulk KPI calculation:', error);
    res.status(500).json({
      success: false,
      message: 'Error in bulk KPI calculation',
      error: error.message
    });
  }
};

export const initializeKPITargets = async (req, res) => {
  try {
    const existingTargets = await KpiTargets.count();

    if (existingTargets > 0) {
      const activeTargets = await KpiTargets.findAll({ where: { is_active: true } });
      return res.status(200).json({
        success: true,
        message: 'KPI targets already initialized',
        data: activeTargets
      });
    }

    const defaultTargets = [
      {
        type: 'daily',
        kanvasing_target: 5,
        followup_target: 5,
        penawaran_target: 1,
        kesepakatan_tarif_target: 1,
        deal_do_target: 1,
        is_active: true
      },
      {
        type: 'monthly',
        kanvasing_target: 150,
        followup_target: 150,
        penawaran_target: 30,
        kesepakatan_tarif_target: 4,
        deal_do_target: 1,
        is_active: true
      }
    ];

    const createdTargets = await KpiTargets.bulkCreate(defaultTargets);

    console.log('KPI targets initialized success');

    res.status(201).json({
      success: true,
      message: 'Default KPI targets initialized success',
      data: createdTargets
    });
  } catch (error) {
    console.error('Error initializing KPI targets:', error);
    res.status(500).json({
      success: false,
      message: 'Error initializing KPI targets',
      error: error.message
    });
  }
};

// DEBUG ENDPOINTS
export const debugKPI = async (req, res) => {
  try {
    const { user_id, date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];
    const userId = parseInt(user_id);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'user_id is required'
      });
    }

    const tasks = await Tasks.findAll({
      where: {
        assigned_to: userId,
        status: 'completed',
        [Op.and]: [
          sequelize.where(sequelize.fn('DATE', sequelize.col('updated_at')), targetDate)
        ]
      },
      attributes: ['id', 'code', 'category', 'title', 'updated_at'],
      raw: true
    });

    const dealsWon = await Deals.findAll({
      where: {
        created_by: userId,
        stage: 'won',
        [Op.and]: [
          sequelize.where(sequelize.fn('DATE', sequelize.col('updated_at')), targetDate)
        ]
      },
      attributes: ['id', 'code', 'title', 'stage', 'updated_at'],
      raw: true
    });

    const dealsNegotiation = await Deals.findAll({
      where: {
        created_by: userId,
        stage: {
          [Op.in]: ['negotiation', 'proposal', 'qualified']
        },
        [Op.and]: [
          sequelize.where(sequelize.fn('DATE', sequelize.col('updated_at')), targetDate)
        ]
      },
      attributes: ['id', 'code', 'title', 'stage', 'updated_at'],
      raw: true
    });

    const currentKPI = await SalesKpiDaily.findOne({
      where: {
        sales_id: userId,
        date: targetDate
      }
    });

    res.status(200).json({
      success: true,
      debug_data: {
        user_id: userId,
        date: targetDate,
        tasks: tasks,
        deals_won: dealsWon,
        deals_negotiation: dealsNegotiation,
        current_kpi: currentKPI,
        task_counts: {
          kanvasing: tasks.filter(t => t.category === 'Kanvasing').length,
          followup: tasks.filter(t => t.category === 'Followup').length,
          penawaran: tasks.filter(t => t.category === 'Penawaran').length
        }
      }
    });
  } catch (error) {
    console.error('Error in debug KPI:', error);
    res.status(500).json({
      success: false,
      message: 'Error in debug KPI',
      error: error.message
    });
  }
};