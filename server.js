const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
require('dotenv').config();

const db = require('./config/database');

const app = express();

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Disable caching for all API routes
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/levels', require('./routes/levels'));
app.use('/api/fixed-assets', require('./routes/fixedAssets'));
app.use('/api/code-mappings', require('./routes/codeMappings'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/users', require('./routes/users'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Ceva nu a mers bine!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta nu a fost găsită' });
});

const PORT = process.env.PORT || 3001;

// Database connection and server start
const startServer = async () => {
  try {
    await db.authenticate();
    console.log('✅ Conexiunea la baza de date a fost stabilită cu succes.');
    
    // Sync database in development
    if (process.env.NODE_ENV === 'development') {
      await db.sync();
      console.log('✅ Modelele bazei de date au fost sincronizate.');
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 Serverul rulează pe portul ${PORT}`);
      console.log(`🌍 Mediu: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('❌ Nu s-a putut conecta la baza de date:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;