const express = require('express');
const router = express.Router();
const { Level } = require('../models');
const Joi = require('joi');

// Schema de validare pentru nivel
const levelSchema = Joi.object({
  level_number: Joi.number().integer().min(1).max(5).required(),
  name: Joi.string().min(1).max(100).required(),
  code: Joi.string().min(1).max(10).required(),
  parent_id: Joi.number().integer().allow(null),
  description: Joi.string().allow('', null),
  sort_order: Joi.number().integer().default(0),
  is_active: Joi.boolean().default(true)
});

// GET /api/levels - Obține toate nivelurile
router.get('/', async (req, res) => {
  try {
    const { level_number, active_only } = req.query;
    
    let whereClause = {};
    if (level_number) {
      whereClause.level_number = level_number;
    }
    if (active_only === 'true') {
      whereClause.is_active = true;
    }

    const levels = await Level.findAll({
      where: whereClause,
      include: [
        {
          model: Level,
          as: 'parent',
          attributes: ['id', 'name', 'code']
        },
        {
          model: Level,
          as: 'children',
          attributes: ['id', 'name', 'code', 'level_number'],
          where: active_only === 'true' ? { is_active: true } : {},
          required: false
        }
      ],
      order: [
        ['level_number', 'ASC'],
        ['sort_order', 'ASC'],
        ['name', 'ASC']
      ]
    });

    res.json({
      success: true,
      data: levels,
      count: levels.length
    });
  } catch (error) {
    console.error('Eroare la obținerea nivelurilor:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea nivelurilor',
      error: error.message
    });
  }
});

// GET /api/levels/hierarchy - Obține ierarhia completă
router.get('/hierarchy', async (req, res) => {
  try {
    const hierarchy = await Level.getHierarchy();
    
    res.json({
      success: true,
      data: hierarchy
    });
  } catch (error) {
    console.error('Eroare la obținerea ierarhiei:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea ierarhiei',
      error: error.message
    });
  }
});

// GET /api/levels/:id - Obține un nivel specific
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const level = await Level.findByPk(id, {
      include: [
        {
          model: Level,
          as: 'parent',
          attributes: ['id', 'name', 'code']
        },
        {
          model: Level,
          as: 'children',
          attributes: ['id', 'name', 'code', 'level_number']
        }
      ]
    });

    if (!level) {
      return res.status(404).json({
        success: false,
        message: 'Nivelul nu a fost găsit'
      });
    }

    res.json({
      success: true,
      data: level
    });
  } catch (error) {
    console.error('Eroare la obținerea nivelului:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea nivelului',
      error: error.message
    });
  }
});

// POST /api/levels - Creează un nivel nou
router.post('/', async (req, res) => {
  try {
    const { error, value } = levelSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Date invalide',
        errors: error.details.map(detail => detail.message)
      });
    }

    // Verifică dacă codul este unic pentru nivelul respectiv
    const existingLevel = await Level.findOne({
      where: {
        level_number: value.level_number,
        code: value.code
      }
    });

    if (existingLevel) {
      return res.status(400).json({
        success: false,
        message: 'Codul există deja pentru acest nivel'
      });
    }

    const level = await Level.create(value);
    
    res.status(201).json({
      success: true,
      message: 'Nivelul a fost creat cu succes',
      data: level
    });
  } catch (error) {
    console.error('Eroare la crearea nivelului:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la crearea nivelului',
      error: error.message
    });
  }
});

// PUT /api/levels/:id - Actualizează un nivel
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = levelSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Date invalide',
        errors: error.details.map(detail => detail.message)
      });
    }

    const level = await Level.findByPk(id);
    if (!level) {
      return res.status(404).json({
        success: false,
        message: 'Nivelul nu a fost găsit'
      });
    }

    // Verifică unicitatea codului (excluzând nivelul curent)
    const existingLevel = await Level.findOne({
      where: {
        level_number: value.level_number,
        code: value.code,
        id: { [require('sequelize').Op.ne]: id }
      }
    });

    if (existingLevel) {
      return res.status(400).json({
        success: false,
        message: 'Codul există deja pentru acest nivel'
      });
    }

    await level.update(value);
    
    res.json({
      success: true,
      message: 'Nivelul a fost actualizat cu succes',
      data: level
    });
  } catch (error) {
    console.error('Eroare la actualizarea nivelului:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la actualizarea nivelului',
      error: error.message
    });
  }
});

// DELETE /api/levels/:id - Șterge un nivel
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const level = await Level.findByPk(id);
    if (!level) {
      return res.status(404).json({
        success: false,
        message: 'Nivelul nu a fost găsit'
      });
    }

    // Verifică dacă nivelul este folosit în mijloace fixe
    const { FixedAsset } = require('../models');
    const levelFields = ['level1_id', 'level2_id', 'level3_id', 'level4_id', 'level5_id'];
    
    for (const field of levelFields) {
      const usedInAssets = await FixedAsset.findOne({
        where: { [field]: id }
      });
      
      if (usedInAssets) {
        return res.status(400).json({
          success: false,
          message: 'Nu se poate șterge nivelul deoarece este folosit în mijloace fixe'
        });
      }
    }

    // Verifică dacă are nivele copil
    const childLevels = await Level.findOne({
      where: { parent_id: id }
    });

    if (childLevels) {
      return res.status(400).json({
        success: false,
        message: 'Nu se poate șterge nivelul deoarece are sub-nivele'
      });
    }

    await level.destroy();
    
    res.json({
      success: true,
      message: 'Nivelul a fost șters cu succes'
    });
  } catch (error) {
    console.error('Eroare la ștergerea nivelului:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la ștergerea nivelului',
      error: error.message
    });
  }
});

// PATCH /api/levels/:id/toggle - Activează/dezactivează un nivel
router.patch('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    
    const level = await Level.findByPk(id);
    if (!level) {
      return res.status(404).json({
        success: false,
        message: 'Nivelul nu a fost găsit'
      });
    }

    await level.update({ is_active: !level.is_active });
    
    res.json({
      success: true,
      message: `Nivelul a fost ${level.is_active ? 'activat' : 'dezactivat'} cu succes`,
      data: level
    });
  } catch (error) {
    console.error('Eroare la schimbarea stării nivelului:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la schimbarea stării nivelului',
      error: error.message
    });
  }
});

module.exports = router;