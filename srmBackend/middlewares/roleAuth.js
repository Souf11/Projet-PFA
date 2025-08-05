const roleAuth = (allowedRoles) => {
  return (req, res, next) => {
    // Vérifier si l'utilisateur est authentifié
    if (!req.user) {
      return res.status(401).json({ message: 'Accès non autorisé' });
    }

    // Vérifier si le rôle de l'utilisateur est autorisé
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Accès refusé: permissions insuffisantes' 
      });
    }

    next();
  };
};

// Middleware spécifique pour les admins
const requireAdmin = roleAuth(['admin']);

// Middleware pour les collaborateurs et admins
const requireCollaborator = roleAuth(['collaborator', 'admin']);

// Middleware pour tous les utilisateurs authentifiés
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Accès non autorisé' });
  }
  next();
};

module.exports = {
  roleAuth,
  requireAdmin,
  requireCollaborator,
  requireAuth
}; 