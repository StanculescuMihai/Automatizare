const express = require('express');
const router = express.Router();
const { FixedAsset, Level } = require('../models');
const CodingService = require('../services/codingService');
const Joi = require('joi');
const { Op } = require('sequelize');

// Schema de validare pentru mijloc fix
const fixedAssetSchema = Joi.object({
  level1_id: Joi.number().integer().required(),
  level2_id: Joi.number().integer().required(),
  level3_id: Joi.number().integer().required(),
  level4_id: Joi.number().integer().required(),
  level5_id: Joi.number().integer().required(),
  equipment_name: Joi.string().min(1).max(200).required(),
  unique_code: Joi.string().max(50).optional(),
  asset_type: Joi.string().max(50).allow('', null),
  status: Joi.string().valid('in functiune', 'in rezerva', 'defect', 'propuse spre casare').default('in functiune'),
  installation_address: Joi.string().allow('', null),
  description: Joi.string().allow('', null),
  technical_specs: Joi.string().allow('', null),
  manufacturer: Joi.string().max(100).allow('', null),
  model: Joi.string().max(100).allow('', null),
  serial_number: Joi.string().max(100).allow('', null),
  installation_date: Joi.date().allow(null),
  accounting_value: Joi.number().precision(2).allow(null),
  lifespan: Joi.number().integer().allow(null),
  observations: Joi.string().allow('', null),
  drive_link: Joi.string().uri().allow('', null)
});

// GET /api/fixed-assets - Obține toate mijloacele fixe cu filtrare și paginare
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      location,
      status,
      search,
      level2,
      level3,
      sort_by = 'unique_code',
      sort_order = 'ASC'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Construiește clauza WHERE
    let whereClause = {};
    
    if (status) {
      whereClause.status = status;
    }
    
    if (search) {
      whereClause[Op.or] = [
        { equipment_name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { unique_code: { [Op.iLike]: `%${search}%` } },
        { manufacturer: { [Op.iLike]: `%${search}%` } },
        { model: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Construiește include-urile cu filtrare
    const includeOptions = [
      {
        model: Level,
        as: 'level1',
        where: location ? { code: location } : undefined
      },
      {
        model: Level,
        as: 'level2',
        where: level2 ? { id: level2 } : undefined
      },
      {
        model: Level,
        as: 'level3',
        where: level3 ? { id: level3 } : undefined
      },
      {
        model: Level,
        as: 'level4'
      },
      {
        model: Level,
        as: 'level5'
      }
    ];

    const { count, rows } = await FixedAsset.findAndCountAll({
      where: whereClause,
      include: includeOptions,
      limit: parseInt(limit),
      offset: offset,
      order: [[sort_by, sort_order.toUpperCase()]],
      distinct: true
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        current_page: parseInt(page),
        per_page: parseInt(limit),
        total: count,
        total_pages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Eroare la obținerea mijloacelor fixe:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea mijloacelor fixe',
      error: error.message
    });
  }
});

// GET /api/fixed-assets/statistics - Obține statistici
router.get('/statistics', async (req, res) => {
  try {
    const stats = await FixedAsset.getStatistics();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Eroare la obținerea statisticilor:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea statisticilor',
      error: error.message
    });
  }
});

// GET /api/fixed-assets/:id - Obține un mijloc fix specific
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const asset = await FixedAsset.findByPk(id, {
      include: [
        { model: Level, as: 'level1' },
        { model: Level, as: 'level2' },
        { model: Level, as: 'level3' },
        { model: Level, as: 'level4' },
        { model: Level, as: 'level5' }
      ]
    });

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Mijlocul fix nu a fost găsit'
      });
    }

    res.json({
      success: true,
      data: asset
    });
  } catch (error) {
    console.error('Eroare la obținerea mijlocului fix:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea mijlocului fix',
      error: error.message
    });
  }
});

// POST /api/fixed-assets - Creează un mijloc fix nou
router.post('/', async (req, res) => {
  try {
    const { error, value } = fixedAssetSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Date invalide',
        errors: error.details.map(detail => detail.message)
      });
    }

    // Generează codul unic dacă nu este furnizat
    if (!value.unique_code) {
      const levels = {
        level1_id: value.level1_id,
        level2_id: value.level2_id,
        level3_id: value.level3_id,
        level4_id: value.level4_id,
        level5_id: value.level5_id
      };
      
      value.unique_code = await CodingService.generateUniqueCode(levels, value.equipment_name);
// POST /api/fixed-assets/generate-code - Generate code for fixed asset
router.post('/generate-code', async (req, res) => {
  try {
    const {
      sucursalaId,
      tipSistemId,
      categorieId,
      functionalitateId,
      componentaId,
      equipmentName
    } = req.body;

    // Validate required fields
    if (!sucursalaId || !tipSistemId || !categorieId || !functionalitateId || !componentaId || !equipmentName) {
      return res.status(400).json({
        message: 'Toate câmpurile sunt obligatorii pentru generarea codului'
      });
    }

    // Generate the code using the coding service
    const code = await CodingService.generateUniqueCode({
      level1_id: sucursalaId,
      level2_id: tipSistemId,
      level3_id: categorieId,
      level4_id: functionalitateId,
      level5_id: componentaId
    }, equipmentName);

    res.json({ code });
  } catch (error) {
    console.error('Error generating code:', error);
    res.status(500).json({
      message: 'Eroare la generarea codului',
      error: error.message
    });
  }
});
    } else {
      // Validează codul furnizat manual
      const validation = await CodingService.validateCode(value.unique_code);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: validation.message
        });
      }
    }

    const asset = await FixedAsset.create(value);
    
    // Obține mijlocul fix cu toate relațiile
    const createdAsset = await FixedAsset.findByPk(asset.id, {
      include: [
        { model: Level, as: 'level1' },
        { model: Level, as: 'level2' },
        { model: Level, as: 'level3' },
        { model: Level, as: 'level4' },
        { model: Level, as: 'level5' }
      ]
    });
    
    res.status(201).json({
      success: true,
      message: 'Mijlocul fix a fost creat cu succes',
      data: createdAsset
    });
  } catch (error) {
    console.error('Eroare la crearea mijlocului fix:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la crearea mijlocului fix',
      error: error.message
    });
  }
});

// PUT /api/fixed-assets/:id - Actualizează un mijloc fix
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = fixedAssetSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Date invalide',
        errors: error.details.map(detail => detail.message)
      });
    }

    const asset = await FixedAsset.findByPk(id);
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Mijlocul fix nu a fost găsit'
      });
    }

    // Dacă codul a fost modificat manual, validează-l
    if (value.unique_code && value.unique_code !== asset.unique_code) {
      const validation = await CodingService.validateCode(value.unique_code, id);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: validation.message
        });
      }
    }

    await asset.update(value);
    
    // Obține mijlocul fix actualizat cu toate relațiile
    const updatedAsset = await FixedAsset.findByPk(id, {
      include: [
        { model: Level, as: 'level1' },
        { model: Level, as: 'level2' },
        { model: Level, as: 'level3' },
        { model: Level, as: 'level4' },
        { model: Level, as: 'level5' }
      ]
    });
    
    res.json({
      success: true,
      message: 'Mijlocul fix a fost actualizat cu succes',
      data: updatedAsset
    });
  } catch (error) {
    console.error('Eroare la actualizarea mijlocului fix:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la actualizarea mijlocului fix',
      error: error.message
    });
  }
});

// DELETE /api/fixed-assets/:id - Șterge un mijloc fix
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const asset = await FixedAsset.findByPk(id);
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Mijlocul fix nu a fost găsit'
      });
    }

    await asset.destroy();
    
    res.json({
      success: true,
      message: 'Mijlocul fix a fost șters cu succes'
    });
  } catch (error) {
    console.error('Eroare la ștergerea mijlocului fix:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la ștergerea mijlocului fix',
      error: error.message
    });
  }
});

// POST /api/fixed-assets/:id/regenerate-code - Regenerează codul pentru un mijloc fix
router.post('/:id/regenerate-code', async (req, res) => {
  try {
    const { id } = req.params;
    
    const newCode = await CodingService.regenerateCode(id);
    
    res.json({
      success: true,
      message: 'Codul a fost regenerat cu succes',
      data: { unique_code: newCode }
    });
  } catch (error) {
    console.error('Eroare la regenerarea codului:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la regenerarea codului',
      error: error.message
    });
  }
});

// POST /api/fixed-assets/validate-code - Validează un cod
router.post('/validate-code', async (req, res) => {
  try {
    const { code, exclude_id } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Codul este obligatoriu'
      });
    }
    
    const validation = await CodingService.validateCode(code, exclude_id);
    
    res.json({
      success: true,
      data: validation
    });
  } catch (error) {
    console.error('Eroare la validarea codului:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la validarea codului',
      error: error.message
    });
  }
});

// GET /api/fixed-assets/by-location/:locationCode - Obține mijloacele fixe după locație
router.get('/by-location/:locationCode', async (req, res) => {
  try {
    const { locationCode } = req.params;
    
    const assets = await FixedAsset.getByLocation(locationCode);
    
    res.json({
      success: true,
      data: assets,
      count: assets.length
    });
  } catch (error) {
    console.error('Eroare la obținerea mijloacelor fixe după locație:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea mijloacelor fixe după locație',
      error: error.message
    });
  }
});

module.exports = router;