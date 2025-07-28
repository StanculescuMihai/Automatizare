const { sequelize, Level, FixedAsset } = require('../models');
const CodingService = require('../services/codingService');

async function testDatabaseConnection() {
  console.log('🔍 Testarea conexiunii la baza de date...');
  
  try {
    await sequelize.authenticate();
    console.log('✅ Conexiunea la baza de date a fost stabilită cu succes.');
    return true;
  } catch (error) {
    console.error('❌ Nu s-a putut conecta la baza de date:', error.message);
    return false;
  }
}

async function testModels() {
  console.log('\n🔍 Testarea modelelor...');
  
  try {
    // Test Level model
    const levelCount = await Level.count();
    console.log(`✅ Model Level: ${levelCount} înregistrări găsite`);
    
    // Test FixedAsset model
    const assetCount = await FixedAsset.count();
    console.log(`✅ Model FixedAsset: ${assetCount} înregistrări găsite`);
    
    return true;
  } catch (error) {
    console.error('❌ Eroare la testarea modelelor:', error.message);
    return false;
  }
}

async function testCodingService() {
  console.log('\n🔍 Testarea serviciului de codificare...');
  
  try {
    // Găsește primul nivel de fiecare tip pentru test
    const level1 = await Level.findOne({ where: { level: 1 } });
    const level2 = await Level.findOne({ where: { level: 2 } });
    const level3 = await Level.findOne({ where: { level: 3 } });
    const level4 = await Level.findOne({ where: { level: 4 } });
    const level5 = await Level.findOne({ where: { level: 5 } });
    
    if (!level1 || !level2 || !level3 || !level4 || !level5) {
      console.log('⚠️  Nu există suficiente nivele pentru testarea codificării');
      return false;
    }
    
    const testData = {
      level1_id: level1.id,
      level2_id: level2.id,
      level3_id: level3.id,
      level4_id: level4.id,
      level5_id: level5.id,
      equipment_name: 'Test Equipment'
    };
    
    const generatedCode = await CodingService.generateAssetCode(testData);
    console.log(`✅ Cod generat cu succes: ${generatedCode}`);
    
    return true;
  } catch (error) {
    console.error('❌ Eroare la testarea serviciului de codificare:', error.message);
    return false;
  }
}

async function testHierarchicalStructure() {
  console.log('\n🔍 Testarea structurii ierarhice...');
  
  try {
    const levels = await Level.findAll({
      order: [['level', 'ASC'], ['name', 'ASC']]
    });
    
    const levelsByType = {};
    levels.forEach(level => {
      if (!levelsByType[level.level]) {
        levelsByType[level.level] = [];
      }
      levelsByType[level.level].push(level);
    });
    
    console.log('📊 Structura ierarhică:');
    for (let i = 1; i <= 5; i++) {
      const count = levelsByType[i] ? levelsByType[i].length : 0;
      const levelName = ['Sucursale', 'Tipuri Sisteme', 'Categorii', 'Funcționalități', 'Componente'][i-1];
      console.log(`   Nivel ${i} (${levelName}): ${count} elemente`);
    }
    
    // Verifică relațiile părinte-copil
    let relationshipErrors = 0;
    for (let i = 2; i <= 5; i++) {
      if (levelsByType[i]) {
        for (const level of levelsByType[i]) {
          if (level.parentId) {
            const parent = levels.find(l => l.id === level.parentId);
            if (!parent || parent.level !== i - 1) {
              console.error(`❌ Relație invalidă: ${level.name} (nivel ${i}) -> părinte invalid`);
              relationshipErrors++;
            }
          }
        }
      }
    }
    
    if (relationshipErrors === 0) {
      console.log('✅ Toate relațiile ierarhice sunt valide');
    } else {
      console.log(`⚠️  ${relationshipErrors} relații ierarhice invalide găsite`);
    }
    
    return relationshipErrors === 0;
  } catch (error) {
    console.error('❌ Eroare la testarea structurii ierarhice:', error.message);
    return false;
  }
}

async function testFixedAssets() {
  console.log('\n🔍 Testarea mijloacelor fixe...');
  
  try {
    const assets = await FixedAsset.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']]
    });
    
    console.log(`✅ ${assets.length} mijloace fixe găsite (ultimele 5):`);
    
    assets.forEach(asset => {
      console.log(`   - ${asset.unique_code}: ${asset.equipment_name}`);
      console.log(`     Status: ${asset.status}, Locație: ${asset.installation_address || 'N/A'}`);
    });
    
    // Verifică codurile unice
    const totalAssets = await FixedAsset.count();
    const uniqueCodes = await FixedAsset.count({
      distinct: true,
      col: 'unique_code'
    });
    
    if (totalAssets === uniqueCodes) {
      console.log('✅ Toate codurile mijloacelor fixe sunt unice');
    } else {
      console.log(`⚠️  ${totalAssets - uniqueCodes} coduri duplicate găsite`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Eroare la testarea mijloacelor fixe:', error.message);
    return false;
  }
}

async function testPerformance() {
  console.log('\n🔍 Testarea performanței...');
  
  try {
    const startTime = Date.now();
    
    // Test query complex
    const complexQuery = await FixedAsset.findAll({
      include: [
        { model: Level, as: 'level1', attributes: ['name', 'code'] },
        { model: Level, as: 'level2', attributes: ['name', 'code'] },
        { model: Level, as: 'level3', attributes: ['name', 'code'] },
        { model: Level, as: 'level4', attributes: ['name', 'code'] },
        { model: Level, as: 'level5', attributes: ['name', 'code'] }
      ],
      limit: 100
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`✅ Query complex executat în ${duration}ms pentru ${complexQuery.length} înregistrări`);
    
    if (duration < 1000) {
      console.log('✅ Performanța este bună (< 1s)');
    } else if (duration < 3000) {
      console.log('⚠️  Performanța este acceptabilă (1-3s)');
    } else {
      console.log('❌ Performanța este slabă (> 3s)');
    }
    
    return duration < 3000;
  } catch (error) {
    console.error('❌ Eroare la testarea performanței:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Începerea testelor aplicației...\n');
  
  const tests = [
    { name: 'Conexiune bază de date', fn: testDatabaseConnection },
    { name: 'Modele', fn: testModels },
    { name: 'Serviciu codificare', fn: testCodingService },
    { name: 'Structură ierarhică', fn: testHierarchicalStructure },
    { name: 'Mijloace fixe', fn: testFixedAssets },
    { name: 'Performanță', fn: testPerformance }
  ];
  
  let passedTests = 0;
  let totalTests = tests.length;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passedTests++;
      }
    } catch (error) {
      console.error(`❌ Test ${test.name} a eșuat:`, error.message);
    }
  }
  
  console.log('\n📊 Rezultate finale:');
  console.log(`✅ Teste reușite: ${passedTests}/${totalTests}`);
  console.log(`❌ Teste eșuate: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('🎉 Toate testele au trecut cu succes!');
  } else {
    console.log('⚠️  Unele teste au eșuat. Verificați erorile de mai sus.');
  }
  
  return passedTests === totalTests;
}

// Rulează testele dacă scriptul este executat direct
if (require.main === module) {
  runAllTests()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('❌ Eroare fatală:', error);
      process.exit(1);
    });
}

module.exports = {
  testDatabaseConnection,
  testModels,
  testCodingService,
  testHierarchicalStructure,
  testFixedAssets,
  testPerformance,
  runAllTests
};