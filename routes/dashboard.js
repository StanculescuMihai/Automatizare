const express = require('express');
const router = express.Router();
const { FixedAsset, Level } = require('../models');
const { Op } = require('sequelize');

// GET /api/dashboard/statistics - Obține statistici pentru dashboard
router.get('/statistics', async (req, res) => {
  try {
    const stats = await FixedAsset.getStatistics();
    
    // Statistici suplimentare
    const recentAssets = await FixedAsset.findAll({
      include: [
        { model: Level, as: 'level1' },
        { model: Level, as: 'level2' },
        { model: Level, as: 'level3' }
      ],
      order: [['created_at', 'DESC']],
      limit: 5
    });

    // Mijloace fixe cu probleme (defecte sau propuse spre casare)
    const problematicAssets = await FixedAsset.findAll({
      where: {
        status: {
          [Op.in]: ['defect', 'propuse spre casare']
        }
      },
      include: [
        { model: Level, as: 'level1' },
        { model: Level, as: 'level2' }
      ],
      limit: 10
    });

    // Statistici pe ani (pentru grafice)
    const yearlyStats = await FixedAsset.findAll({
      attributes: [
        [FixedAsset.sequelize.fn('EXTRACT', FixedAsset.sequelize.literal('YEAR FROM installation_date')), 'year'],
        [FixedAsset.sequelize.fn('COUNT', FixedAsset.sequelize.col('id')), 'count']
      ],
      where: {
        installation_date: {
          [Op.not]: null
        }
      },
      group: [FixedAsset.sequelize.fn('EXTRACT', FixedAsset.sequelize.literal('YEAR FROM installation_date'))],
      order: [[FixedAsset.sequelize.fn('EXTRACT', FixedAsset.sequelize.literal('YEAR FROM installation_date')), 'DESC']],
      limit: 10
    });

    res.json({
      success: true,
      data: {
        ...stats,
        recent_assets: recentAssets,
        problematic_assets: problematicAssets,
        yearly_stats: yearlyStats
      }
    });
  } catch (error) {
    console.error('Eroare la obținerea statisticilor dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea statisticilor dashboard',
      error: error.message
    });
  }
});

// GET /api/dashboard/summary - Obține rezumatul pentru dashboard
router.get('/summary', async (req, res) => {
  try {
    const totalAssets = await FixedAsset.count();
    const activeAssets = await FixedAsset.count({
      where: { status: 'in functiune' }
    });
    const defectiveAssets = await FixedAsset.count({
      where: { status: 'defect' }
    });
    const reserveAssets = await FixedAsset.count({
      where: { status: 'in rezerva' }
    });

    // Valoarea totală contabilă
    const totalValue = await FixedAsset.sum('accounting_value', {
      where: {
        accounting_value: {
          [Op.not]: null
        }
      }
    });

    // Distribuția pe locații
    const locationDistribution = await FixedAsset.findAll({
      attributes: [
        [FixedAsset.sequelize.col('level1.name'), 'location'],
        [FixedAsset.sequelize.col('level1.code'), 'location_code'],
        [FixedAsset.sequelize.fn('COUNT', FixedAsset.sequelize.col('FixedAsset.id')), 'count']
      ],
      include: [{
        model: Level,
        as: 'level1',
        attributes: []
      }],
      group: ['level1.name', 'level1.code'],
      order: [[FixedAsset.sequelize.fn('COUNT', FixedAsset.sequelize.col('FixedAsset.id')), 'DESC']]
    });

    res.json({
      success: true,
      data: {
        totals: {
          total_assets: totalAssets,
          active_assets: activeAssets,
          defective_assets: defectiveAssets,
          reserve_assets: reserveAssets,
          total_value: totalValue || 0
        },
        location_distribution: locationDistribution
      }
    });
  } catch (error) {
    console.error('Eroare la obținerea rezumatului dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea rezumatului dashboard',
      error: error.message
    });
  }
});

// GET /api/dashboard/charts/status - Date pentru graficul de status
router.get('/charts/status', async (req, res) => {
  try {
    const statusData = await FixedAsset.findAll({
      attributes: [
        'status',
        [FixedAsset.sequelize.fn('COUNT', FixedAsset.sequelize.col('id')), 'count']
      ],
      group: ['status'],
      order: [[FixedAsset.sequelize.fn('COUNT', FixedAsset.sequelize.col('id')), 'DESC']]
    });

    const chartData = statusData.map(item => ({
      label: item.status,
      value: parseInt(item.dataValues.count),
      color: getStatusColor(item.status)
    }));

    res.json({
      success: true,
      data: chartData
    });
  } catch (error) {
    console.error('Eroare la obținerea datelor pentru graficul de status:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea datelor pentru graficul de status',
      error: error.message
    });
  }
});

// GET /api/dashboard/charts/locations - Date pentru graficul de locații
router.get('/charts/locations', async (req, res) => {
  try {
    const locationData = await FixedAsset.findAll({
      attributes: [
        [FixedAsset.sequelize.col('level1.name'), 'location'],
        [FixedAsset.sequelize.fn('COUNT', FixedAsset.sequelize.col('FixedAsset.id')), 'count']
      ],
      include: [{
        model: Level,
        as: 'level1',
        attributes: []
      }],
      group: ['level1.name'],
      order: [[FixedAsset.sequelize.fn('COUNT', FixedAsset.sequelize.col('FixedAsset.id')), 'DESC']]
    });

    const chartData = locationData.map((item, index) => ({
      label: item.dataValues.location,
      value: parseInt(item.dataValues.count),
      color: getLocationColor(index)
    }));

    res.json({
      success: true,
      data: chartData
    });
  } catch (error) {
    console.error('Eroare la obținerea datelor pentru graficul de locații:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea datelor pentru graficul de locații',
      error: error.message
    });
  }
});

// Funcții helper pentru culori
function getStatusColor(status) {
  const colors = {
    'in functiune': '#4CAF50',
    'in rezerva': '#FF9800',
    'defect': '#F44336',
    'propuse spre casare': '#9C27B0'
  };
  return colors[status] || '#757575';
}

function getLocationColor(index) {
  const colors = ['#2196F3', '#4CAF50', '#FF9800', '#F44336', '#9C27B0', '#607D8B'];
  return colors[index % colors.length];
}

module.exports = router;