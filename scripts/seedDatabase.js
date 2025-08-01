const { Level, FixedAsset, sequelize, User } = require('../models');
require('dotenv').config();

// Date pentru popularea inițială cu noua structură
const initialLevels = [
  // Nivel 1: Site
  { level_number: 1, name: 'Bucuresti', code: 'B' },
  { level_number: 1, name: 'Cluj-Napoca', code: 'CJ' },

  // Nivel 2: Entitate
  { level_number: 2, name: 'Cladirea A', code: 'CLA' },
  { level_number: 2, name: 'Cladirea B', code: 'CLB' },
  { level_number: 2, name: 'Depozit Principal', code: 'DP' },

  // Nivel 3: Unitate
  { level_number: 3, name: 'Etaj 1', code: 'E1' },
  { level_number: 3, name: 'Etaj 2', code: 'E2' },
  { level_number: 3, name: 'Zona de Productie', code: 'ZP' },

  // Nivel 4: Ansamblu funcțional
  { level_number: 4, name: 'Sistem HVAC', code: 'HVAC' },
  { level_number: 4, name: 'Retea Electrica', code: 'RE' },
  { level_number: 4, name: 'Linie de Asamblare', code: 'LA' },

  // Nivel 5: Locație funcțională
  { level_number: 5, name: 'Unitate Centrala', code: 'UC' },
  { level_number: 5, name: 'Panou de Control', code: 'PC' },
  { level_number: 5, name: 'Post de Lucru 1', code: 'PL1' },
];

// Funcție pentru popularea nivelurilor
async function seedLevels() {
  console.log('🌱 Popularea nivelurilor cu noua structură...');
  
  try {
    for (const levelData of initialLevels) {
      const [level, created] = await Level.findOrCreate({
        where: {
          level_number: levelData.level_number,
          code: levelData.code
        },
        defaults: levelData
      });
      
      if (created) {
        console.log(`✅ Creat nivel: ${levelData.name} (${levelData.code})`);
      } else {
        // Optional: Update existing levels if needed
        await level.update(levelData);
        console.log(`🔄️ Actualizat nivel existent: ${levelData.name} (${levelData.code})`);
      }
    }
    
    console.log('✅ Popularea nivelurilor completă!');
  } catch (error) {
    console.error('❌ Eroare la popularea nivelurilor:', error);
    throw error;
  }
}

// Funcția principală de populare
async function seedDatabase() {
  try {
    console.log('🚀 Începerea populării bazei de date...');
    
    // Verifică conexiunea la baza de date
    await sequelize.authenticate();
    console.log('✅ Conexiunea la baza de date este stabilită.');
    
    // Sincronizează modelele
    await sequelize.sync({ alter: true });
    console.log('✅ Modelele au fost sincronizate.');

    // Șterge datele vechi din tabela Levels
    console.log('🗑️  Ștergerea datelor vechi din tabela de nivele...');
    await Level.destroy({ where: {}, truncate: false }); // Use truncate: false for where clause to work
    console.log('✅ Datele vechi au fost șterse.');
    
    // Populează datele
    await seedLevels();
    
    console.log('🎉 Popularea bazei de date completă cu succes!');
  } catch (error) {
    console.error('❌ Eroare la popularea bazei de date:', error);
    process.exit(1);
  }
}

// Rulează scriptul dacă este apelat direct
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('✅ Script de populare finalizat cu succes!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script de populare eșuat:', error);
      process.exit(1);
    });
}

module.exports = { seedDatabase, seedLevels };