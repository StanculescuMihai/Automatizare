const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Level = sequelize.define('Level', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  level_number: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  code: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  parent_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'levels',
      key: 'id'
    }
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'levels',
  indexes: [
    {
      unique: true,
      fields: ['level_number', 'code']
    },
    {
      fields: ['parent_id']
    },
    {
      fields: ['is_active']
    }
  ]
});

// Asocieri
Level.belongsTo(Level, { 
  as: 'parent', 
  foreignKey: 'parent_id' 
});

Level.hasMany(Level, { 
  as: 'children', 
  foreignKey: 'parent_id' 
});

// Metode statice
Level.getByLevelNumber = async function(levelNumber) {
  return await this.findAll({
    where: { 
      level_number: levelNumber,
      is_active: true 
    },
    order: [['sort_order', 'ASC'], ['name', 'ASC']]
  });
};

Level.getHierarchy = async function() {
  const levels = await this.findAll({
    where: { is_active: true },
    order: [['level_number', 'ASC'], ['sort_order', 'ASC'], ['name', 'ASC']]
  });
  
  const hierarchy = {};
  for (let i = 1; i <= 5; i++) {
    hierarchy[i] = levels.filter(level => level.level_number === i);
  }
  
  return hierarchy;
};

module.exports = Level;