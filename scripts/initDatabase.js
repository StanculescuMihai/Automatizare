const { sequelize, Level, FixedAsset } = require('../models');
require('dotenv').config();

async function initDatabase() {
  try {
    console.log('🚀 Inițializarea bazei de date...');
    
    // Verifică conexiunea la baza de date
    console.log('🔍 Verificarea conexiunii la baza de date...');
    await sequelize.authenticate();
    console.log('✅ Conexiunea la baza de date este stabilită.');
    
    // Șterge toate tabelele existente și le recreează
    console.log('🗑️  Ștergerea tabelelor existente...');
    await sequelize.drop();
    console.log('✅ Tabelele au fost șterse.');
    
    // Creează tabelele din nou
    console.log('🏗️  Crearea tabelelor...');
    await sequelize.sync({ force: true });
    console.log('✅ Tabelele au fost create cu succes.');
    
    // Verifică că tabelele au fost create
    const tables = await sequelize.getQueryInterface().showAllTables();
    console.log('📋 Tabele create:', tables);
    
    console.log('🎉 Inițializarea bazei de date completă cu succes!');
    
  } catch (error) {
    console.error('❌ Eroare la inițializarea bazei de date:', error);
    throw error;
  }
}

// Rulează scriptul dacă este apelat direct
if (require.main === module) {
  initDatabase()
    .then(() => {
      console.log('✅ Script de inițializare finalizat cu succes!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script de inițializare eșuat:', error);
      process.exit(1);
    });
}

module.exports = { initDatabase };