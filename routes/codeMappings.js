const express = require('express');
const router = express.Router();
const { Level } = require('../models');

// GET /api/code-mappings - Obține toate mapările de codificare
router.get('/', async (req, res) => {
  try {
    const mappings = await Level.findAll({
      where: { is_active: true },
      attributes: ['id', 'level_number', 'name', 'code', 'description'],
      order: [
        ['level_number', 'ASC'],
        ['sort_order', 'ASC'],
        ['name', 'ASC']
      ]
    });

    // Grupează mapările pe nivele
    const groupedMappings = {};
    mappings.forEach(mapping => {
      if (!groupedMappings[mapping.level_number]) {
        groupedMappings[mapping.level_number] = [];
      }
      groupedMappings[mapping.level_number].push(mapping);
    });

    res.json({
      success: true,
      data: groupedMappings
    });
  } catch (error) {
    console.error('Eroare la obținerea mapărilor de codificare:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea mapărilor de codificare',
      error: error.message
    });
  }
});

// GET /api/code-mappings/level/:levelNumber - Obține mapările pentru un nivel specific
router.get('/level/:levelNumber', async (req, res) => {
  try {
    const { levelNumber } = req.params;
    
    if (levelNumber < 1 || levelNumber > 5) {
      return res.status(400).json({
        success: false,
        message: 'Numărul nivelului trebuie să fie între 1 și 5'
      });
    }

    const mappings = await Level.getByLevelNumber(parseInt(levelNumber));
    
    res.json({
      success: true,
      data: mappings
    });
  } catch (error) {
    console.error('Eroare la obținerea mapărilor pentru nivel:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea mapărilor pentru nivel',
      error: error.message
    });
  }
});

// GET /api/code-mappings/generate-preview - Generează preview pentru cod
router.post('/generate-preview', async (req, res) => {
  try {
    const { level1_id, level2_id, level3_id, level4_id, level5_id, equipment_name } = req.body;
    
    if (!level1_id || !level2_id || !level3_id || !level4_id || !level5_id || !equipment_name) {
      return res.status(400).json({
        success: false,
        message: 'Toate nivelurile și numele echipamentului sunt obligatorii'
      });
    }

    const CodingService = require('../services/codingService');
    
    const levels = { level1_id, level2_id, level3_id, level4_id, level5_id };
    const previewCode = await CodingService.generateUniqueCode(levels, equipment_name);
    
    res.json({
      success: true,
      data: {
        preview_code: previewCode,
        levels: levels,
        equipment_name: equipment_name
      }
    });
  } catch (error) {
    console.error('Eroare la generarea preview-ului codului:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la generarea preview-ului codului',
      error: error.message
    });
  }
});

module.exports = router;