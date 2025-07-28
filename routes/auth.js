const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Joi = require('joi');

// Schema de validare pentru login
const loginSchema = Joi.object({
  username: Joi.string().min(3).max(50).required(),
  password: Joi.string().min(6).required()
});

// Utilizatori hardcodați pentru început (în producție ar trebui să fie în baza de date)
const users = [
  {
    id: 1,
    username: 'admin',
    password: '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjdKXvqCyqgjW8oJIjNQu0g6T0flHm', // admin123
    role: 'admin',
    name: 'Administrator'
  },
  {
    id: 2,
    username: 'user',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'user',
    name: 'Utilizator'
  }
];

// POST /api/auth/login - Autentificare
router.post('/login', async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Date invalide',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { username, password } = value;

    // Găsește utilizatorul
    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credențiale invalide'
      });
    }

    // Verifică parola
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Credențiale invalide'
      });
    }

    // Generează token JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'your_jwt_secret_key_here',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      message: 'Autentificare reușită',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Eroare la autentificare:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la autentificare',
      error: error.message
    });
  }
});

// GET /api/auth/me - Obține informații despre utilizatorul curent
router.get('/me', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Utilizatorul nu a fost găsit'
    });
  }

  res.json({
    success: true,
    data: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role
    }
  });
});

// POST /api/auth/refresh - Reîmprospătează token-ul
router.post('/refresh', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Utilizatorul nu a fost găsit'
    });
  }

  // Generează un nou token
  const token = jwt.sign(
    { 
      id: user.id, 
      username: user.username, 
      role: user.role 
    },
    process.env.JWT_SECRET || 'your_jwt_secret_key_here',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  res.json({
    success: true,
    message: 'Token reîmprospătat cu succes',
    data: { token }
  });
});

// POST /api/auth/logout - Deconectare (pentru moment doar confirmă)
router.post('/logout', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Deconectare reușită'
  });
});

// Middleware pentru autentificare
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token de acces lipsă'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here', (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Token invalid'
      });
    }
    req.user = user;
    next();
  });
}

// Middleware pentru verificarea rolului de admin
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Acces interzis - necesită rol de administrator'
    });
  }
  next();
}

// Exportă middleware-urile pentru folosire în alte rute
module.exports = router;
module.exports.authenticateToken = authenticateToken;
module.exports.requireAdmin = requireAdmin;