const { Level, FixedAsset, sequelize } = require('../models');
require('dotenv').config();

// Date pentru popularea inițială bazate pe fișierul de codificare
const initialLevels = [
  // Nivel 1 - Sucursale
  { level_number: 1, name: 'Sucursala Otopeni', code: 'OTP', sort_order: 1 },
  { level_number: 1, name: 'Sucursala Chitila', code: 'CHI', sort_order: 2 },
  { level_number: 1, name: 'Sucursala Chiajna', code: 'CJN', sort_order: 3 },
  { level_number: 1, name: 'Sucursala Popesti', code: 'POP', sort_order: 4 },

  // Nivel 2 - Tipuri sisteme
  { level_number: 2, name: 'Retele apa', code: 'RA', sort_order: 1 },
  { level_number: 2, name: 'Retele canal menajer', code: 'CM', sort_order: 2 },
  { level_number: 2, name: 'Retele canal pluvial', code: 'CP', sort_order: 3 },
  { level_number: 2, name: 'Statie epurare', code: 'SE', sort_order: 4 },
  { level_number: 2, name: 'Gospodarie de apa', code: 'GA', sort_order: 5 },

  // Nivel 3 - Categorii
  { level_number: 3, name: 'SPA', code: 'PA', sort_order: 1 },
  { level_number: 3, name: 'SPAU', code: 'PU', sort_order: 2 },
  { level_number: 3, name: 'SPAP', code: 'PP', sort_order: 3 },
  { level_number: 3, name: 'Conducte apa', code: 'CA', sort_order: 4 },
  { level_number: 3, name: 'Conducte canal menajer', code: 'CM', sort_order: 5 },
  { level_number: 3, name: 'Conducte canal pluvial', code: 'CP', sort_order: 6 },
  { level_number: 3, name: 'Rezervor inmagazinare apa', code: 'RA', sort_order: 7 },
  { level_number: 3, name: 'Foraj', code: 'FA', sort_order: 8 },
  { level_number: 3, name: 'Statie clorinare', code: 'SC', sort_order: 9 },

  // Nivel 4 - Funcționalități
  { level_number: 4, name: 'Constructii', code: 'C', sort_order: 1 },
  { level_number: 4, name: 'Pompare apa', code: 'P', sort_order: 2 },
  { level_number: 4, name: 'Automatizare si control', code: 'A', sort_order: 3 },
  { level_number: 4, name: 'Instalatii electrice', code: 'E', sort_order: 4 },
  { level_number: 4, name: 'Instalatii hidraulice', code: 'H', sort_order: 5 },
  { level_number: 4, name: 'Filtrare', code: 'F', sort_order: 6 },

  // Nivel 5 - Componente
  { level_number: 5, name: 'Pompe', code: 'P', sort_order: 1 },
  { level_number: 5, name: 'Vane', code: 'V', sort_order: 2 },
  { level_number: 5, name: 'Gratar', code: 'G', sort_order: 3 },
  { level_number: 5, name: 'Filtre', code: 'F', sort_order: 4 },
  { level_number: 5, name: 'Lant', code: 'D', sort_order: 5 },
  { level_number: 5, name: 'Apometru', code: 'APO', sort_order: 6 },
  { level_number: 5, name: 'Debitmetru', code: 'DEB', sort_order: 7 },
  { level_number: 5, name: 'Foraj', code: 'FOR', sort_order: 8 },
  { level_number: 5, name: 'Cladire', code: 'CL', sort_order: 9 },
  { level_number: 5, name: 'Rezervor', code: 'RE', sort_order: 10 }
];

// Funcție pentru popularea nivelurilor
async function seedLevels() {
  console.log('🌱 Popularea nivelurilor...');
  
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
        console.log(`ℹ️  Nivel existent: ${levelData.name} (${levelData.code})`);
      }
    }
    
    console.log('✅ Popularea nivelurilor completă!');
  } catch (error) {
    console.error('❌ Eroare la popularea nivelurilor:', error);
    throw error;
  }
}

// Funcție pentru popularea cu câteva mijloace fixe de exemplu
async function seedSampleAssets() {
  console.log('🌱 Popularea mijloacelor fixe de exemplu...');
  
  try {
    // Obține ID-urile nivelurilor pentru exemplele de mijloace fixe
    const otopeni = await Level.findOne({ where: { code: 'OTP', level_number: 1 } });
    const ga = await Level.findOne({ where: { code: 'GA', level_number: 2 } });
    const pa = await Level.findOne({ where: { code: 'PA', level_number: 3 } });
    const p = await Level.findOne({ where: { code: 'P', level_number: 4 } });
    const pompe = await Level.findOne({ where: { code: 'P', level_number: 5 } });

    if (!otopeni || !ga || !pa || !p || !pompe) {
      console.log('⚠️  Nu s-au găsit toate nivelurile necesare pentru exemplele de mijloace fixe');
      return;
    }

    const sampleAssets = [
      {
        unique_code: 'OTPGAPAPP0001',
        level1_id: otopeni.id,
        level2_id: ga.id,
        level3_id: pa.id,
        level4_id: p.id,
        level5_id: pompe.id,
        equipment_name: 'pompa 1',
        asset_type: 'echipament',
        status: 'in functiune',
        installation_address: 'Otopeni, str. Polona',
        description: 'Pompa centrifugala de apa',
        technical_specs: 'Q=2 mc/h; H=72CA',
        manufacturer: 'Grundfos',
        model: 'A 43 102 1 10 P2 1044',
        installation_date: '2021-04-15',
        accounting_value: 23556.00,
        lifespan: 15,
        observations: 'Pompa functionala',
        drive_link: 'https://drive.google.com/drive/folders/1XADPQi31-Zg88QM0Y4ryE8-GuUauNW1t'
      },
      {
        unique_code: 'OTPGAPAPP0002',
        level1_id: otopeni.id,
        level2_id: ga.id,
        level3_id: pa.id,
        level4_id: p.id,
        level5_id: pompe.id,
        equipment_name: 'pompa 2',
        asset_type: 'echipament',
        status: 'in functiune',
        installation_address: 'Otopeni, str. Polona',
        description: 'Pompa centrifugala de apa',
        technical_specs: 'Q=70 mc/h; H=180CA',
        manufacturer: 'Wilo',
        model: 'MVI 7002-3/16/E/3-400-50-2',
        installation_date: '2020-03-10',
        accounting_value: 45000.00,
        lifespan: 15,
        observations: 'Pompa in stare buna',
        drive_link: 'https://drive.google.com/drive/folders/1e6EQauMhHKxqkfSYnS5d6mFXeze4Amum'
      }
    ];

    for (const assetData of sampleAssets) {
      const [asset, created] = await FixedAsset.findOrCreate({
        where: { unique_code: assetData.unique_code },
        defaults: assetData
      });
      
      if (created) {
        console.log(`✅ Creat mijloc fix: ${assetData.equipment_name} (${assetData.unique_code})`);
      } else {
        console.log(`ℹ️  Mijloc fix existent: ${assetData.equipment_name} (${assetData.unique_code})`);
      }
    }
    
    console.log('✅ Popularea mijloacelor fixe de exemplu completă!');
  } catch (error) {
    console.error('❌ Eroare la popularea mijloacelor fixe:', error);
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
    
    // Populează datele
    await seedLevels();
    await seedSampleAssets();
    
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

module.exports = { seedDatabase, seedLevels, seedSampleAssets };