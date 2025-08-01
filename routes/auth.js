const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');

// POST /api/auth/register
router.post(
  '/register',
  [
    check('fullName', 'Numele complet este obligatoriu').not().isEmpty(),
    check('username', 'Numele de utilizator este obligatoriu').not().isEmpty(),
    check('password', 'Parola trebuie să aibă minim 6 caractere').isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Date invalide',
        errors: errors.array().map((error) => error.msg),
      });
    }

    const { fullName, username, password } = req.body;

    try {
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Utilizatorul există deja' });
      }

      const user = await User.create({ fullName, username, password, role: 'user' });

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET || 'your_jwt_secret_key_here',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.status(201).json({
        success: true,
        message: 'Utilizator înregistrat cu succes',
        data: {
          token,
          user: { id: user.id, username: user.username, name: user.fullName, role: user.role },
        },
      });
    } catch (error) {
      console.error('Eroare la înregistrare:', error);
      res.status(500).json({ success: false, message: 'Eroare la înregistrare', error: error.message });
    }
  }
);

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Numele de utilizator și parola sunt obligatorii' });
  }

  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Credențiale invalide' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Credențiale invalide' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret_key_here',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      message: 'Autentificare reușită',
      data: {
        token,
        user: { id: user.id, username: user.username, name: user.fullName, role: user.role },
      },
    });
  } catch (error) {
    console.error('Eroare la autentificare:', error);
    res.status(500).json({ success: false, message: 'Eroare la autentificare', error: error.message });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'username', 'fullName', 'role'],
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilizatorul nu a fost găsit' });
    }

    res.json({
      success: true,
      data: { id: user.id, username: user.username, name: user.fullName, role: user.role },
    });
  } catch (error) {
    console.error('Eroare la /me:', error);
    res.status(500).json({ success: false, message: 'Eroare de server', error: error.message });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Deconectare reușită' });
});

// Middleware pentru autentificare
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

module.exports = router;