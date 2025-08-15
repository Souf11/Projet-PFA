require('dotenv').config();
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here'; // Utiliser la même clé par défaut

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Accès non autorisé: aucun token fourni' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // Attach user info to request object
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token invalide ou expiré' });
  }
};

module.exports = authenticate;
