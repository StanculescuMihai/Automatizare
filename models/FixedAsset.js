const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FixedAsset = sequelize.define('FixedAsset', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  unique_code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  level1_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'levels',
      key: 'id'
    }
  },
  level2_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'levels',
      key: 'id'
    }
  },
  level3_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'levels',
      key: 'id'
    }
  },
  level4_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'levels',
      key: 'id'
    }
  },
  level5_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'levels',
      key: 'id'
    }
  },
  equipment_name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  asset_type: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('in functiune', 'in rezerva', 'defect', 'propuse spre casare'),
    allowNull: false,
    defaultValue: 'in functiune'
  },
  installation_address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  technical_specs: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  manufacturer: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  model: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  serial_number: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  installation_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  accounting_value: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true
  },
  lifespan: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Durata de viață în ani'
  },
  observations: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  drive_link: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      isUrl: true
    }
  }
}, {
  tableName: 'fixed_assets',
  indexes: [
    {
      unique: true,
      fields: ['unique_code']
    },
    {
      fields: ['level1_id']
    },
    {
      fields: ['level2_id']
    },
    {
      fields: ['level3_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['equipment_name']
    },
    {
      fields: ['installation_date']
    }
  ]
});

// Metode statice
FixedAsset.getByLocation = async function(locationCode) {
  const Level = require('./Level');
  
  return await this.findAll({
    include: [
      {
        model: Level,
        as: 'level1',
        where: { code: locationCode }
      },
      {
        model: Level,
        as: 'level2'
      },
      {
        model: Level,
        as: 'level3'
      },
      {
        model: Level,
        as: 'level4'
      },
      {
        model: Level,
        as: 'level5'
      }
    ],
    order: [['unique_code', 'ASC']]
  });
};

FixedAsset.searchByName = async function(searchTerm) {
  const { Op } = require('sequelize');
  const Level = require('./Level');
  
  return await this.findAll({
    where: {
      [Op.or]: [
        { equipment_name: { [Op.iLike]: `%${searchTerm}%` } },
        { description: { [Op.iLike]: `%${searchTerm}%` } },
        { unique_code: { [Op.iLike]: `%${searchTerm}%` } }
      ]
    },
    include: [
      { model: Level, as: 'level1' },
      { model: Level, as: 'level2' },
      { model: Level, as: 'level3' },
      { model: Level, as: 'level4' },
      { model: Level, as: 'level5' }
    ],
    order: [['equipment_name', 'ASC']]
  });
};

FixedAsset.getStatistics = async function() {
  const { Op } = require('sequelize');
  
  const totalAssets = await this.count();
  const statusStats = await this.findAll({
    attributes: [
      'status',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    group: ['status']
  });
  
  const locationStats = await this.findAll({
    attributes: [
      [sequelize.col('level1.name'), 'location'],
      [sequelize.fn('COUNT', sequelize.col('FixedAsset.id')), 'count']
    ],
    include: [{
      model: require('./Level'),
      as: 'level1',
      attributes: []
    }],
    group: ['level1.name']
  });
  
  return {
    total: totalAssets,
    byStatus: statusStats,
    byLocation: locationStats
  };
};

module.exports = FixedAsset;