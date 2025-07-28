const sequelize = require('../config/database');
const Level = require('./Level');
const FixedAsset = require('./FixedAsset');

// Definirea asocierilor între modele
const defineAssociations = () => {
  // FixedAsset belongsTo Level pentru fiecare nivel
  FixedAsset.belongsTo(Level, {
    as: 'level1',
    foreignKey: 'level1_id'
  });

  FixedAsset.belongsTo(Level, {
    as: 'level2',
    foreignKey: 'level2_id'
  });

  FixedAsset.belongsTo(Level, {
    as: 'level3',
    foreignKey: 'level3_id'
  });

  FixedAsset.belongsTo(Level, {
    as: 'level4',
    foreignKey: 'level4_id'
  });

  FixedAsset.belongsTo(Level, {
    as: 'level5',
    foreignKey: 'level5_id'
  });

  // Level hasMany FixedAsset pentru fiecare nivel
  Level.hasMany(FixedAsset, {
    as: 'assetsLevel1',
    foreignKey: 'level1_id'
  });

  Level.hasMany(FixedAsset, {
    as: 'assetsLevel2',
    foreignKey: 'level2_id'
  });

  Level.hasMany(FixedAsset, {
    as: 'assetsLevel3',
    foreignKey: 'level3_id'
  });

  Level.hasMany(FixedAsset, {
    as: 'assetsLevel4',
    foreignKey: 'level4_id'
  });

  Level.hasMany(FixedAsset, {
    as: 'assetsLevel5',
    foreignKey: 'level5_id'
  });
};

// Inițializarea asocierilor
defineAssociations();

// Exportarea modelelor și a conexiunii
module.exports = {
  sequelize,
  Level,
  FixedAsset
};

// Funcție pentru sincronizarea bazei de date
const syncDatabase = async (options = {}) => {
  try {
    await sequelize.sync(options);
    console.log('✅ Baza de date a fost sincronizată cu succes.');
  } catch (error) {
    console.error('❌ Eroare la sincronizarea bazei de date:', error);
    throw error;
  }
};

module.exports.syncDatabase = syncDatabase;