const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const codingService = require('../services/codingService');

// POST /api/fixed-assets/generate-code - Generate code for fixed asset
router.post('/generate-code', authenticateToken, async (req, res) => {
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

    // Generate the code
    const code = await codingService.generateAssetCode({
      sucursalaId,
      tipSistemId,
      categorieId,
      functionalitateId,
      componentaId,
      equipmentName
    });

    res.json({ code });
  } catch (error) {
    console.error('Error generating code:', error);
    res.status(500).json({
      message: 'Eroare la generarea codului',
      error: error.message
    });
  }
});

module.exports = router;