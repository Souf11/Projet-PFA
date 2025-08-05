require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes'); // <-- adapte le nom si besoin
const pool = require('./config/db');
const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
// Après les middlewares, avant les autres routes
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Bienvenue sur l\'API SRM',
    endpoints: {
      documentation: '/api-docs',
      healthcheck: '/api/healthcheck',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login'
      },
      complaints: '/api/complaints'
    },
    timestamp: new Date().toISOString()
  });
});
app.get('/api/healthcheck', (req, res) => {
  res.json({ status: 'OK', message: 'API is working' });
});

// Test de connexion à la base de données
app.get('/api/dbtest', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    res.json({ success: true, dbResult: rows[0].result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Monte les routes d'authentification sous /api/auth
app.use('/api/auth', authRoutes);

// Monte les routes de réclamations sous /api/complaints
const complaintRoutes = require('./routes/complaintRoutes');
app.use('/api/complaints', complaintRoutes);

// Monte les routes admin sous /api/admin
const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});