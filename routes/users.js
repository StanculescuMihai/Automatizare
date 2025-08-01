const express = require('express');
const router = express.Router();
const { User } = require('../models');
const jwt = require('jsonwebtoken');

// Middleware pentru a verifica dacă utilizatorul este autentificat
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token de acces lipsă' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here', (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Token invalid' });
    }
    req.user = user;
    next();
  });
}

// Middleware pentru a verifica dacă utilizatorul este administrator
function isAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Acces interzis: Rol de administrator necesar' });
  }
  next();
}

// GET /api/users - Obține toți utilizatorii (doar pentru admin)
router.get('/', [authenticateToken, isAdmin], async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Eroare la preluarea utilizatorilor:', error);
    res.status(500).json({ success: false, message: 'Eroare de server' });
  }
});

// PUT /api/users/toggle-admin/:id - Schimbă rolul unui utilizator (doar pentru admin)
router.put('/toggle-admin/:id', [authenticateToken, isAdmin], async (req, res) => {
  try {
    const userToUpdate = await User.findByPk(req.params.id);

    if (!userToUpdate) {
      return res.status(404).json({ success: false, message: 'Utilizatorul nu a fost găsit' });
    }

    // Previne un admin să-și scoată propriul rol
    if (userToUpdate.id === req.user.id) {
        return res.status(400).json({ success: false, message: 'Administratorii nu își pot revoca propriile drepturi.' });
    }

    userToUpdate.role = userToUpdate.role === 'admin' ? 'user' : 'admin';
    await userToUpdate.save();

    res.json({ success: true, message: 'Rolul utilizatorului a fost actualizat.', data: userToUpdate });
  } catch (error) {
    console.error('Eroare la actualizarea rolului:', error);
    res.status(500).json({ success: false, message: 'Eroare de server' });
  }
});

module.exports = router;