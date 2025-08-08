# Système de Réclamations (Complaints System)

Ce système permet aux utilisateurs d'ajouter des réclamations et de voir leurs propres réclamations.

## 🚀 Fonctionnalités

### Pour les Utilisateurs
- ✅ **Créer une réclamation** - Ajouter une nouvelle réclamation
- ✅ **Voir ses réclamations** - Lister toutes ses réclamations
- ✅ **Voir une réclamation spécifique** - Obtenir les détails d'une réclamation
- ✅ **Modifier une réclamation** - Mettre à jour une réclamation (si statut "pending")
- ✅ **Supprimer une réclamation** - Supprimer une réclamation

## 📋 API Endpoints

### Authentification
```
POST /api/auth/login
POST /api/auth/register
```

### Réclamations
```
POST   /api/complaints          - Créer une réclamation
GET    /api/complaints          - Lister ses réclamations
GET    /api/complaints/:id      - Voir une réclamation spécifique
PUT    /api/complaints/:id      - Modifier une réclamation
DELETE /api/complaints/:id      - Supprimer une réclamation
```

## 🔐 Authentification

Toutes les routes de réclamations nécessitent une authentification JWT. Incluez le token dans le header :
```
Authorization: Bearer <your_jwt_token>
```

## 📝 Types de Réclamations

Les réclamations peuvent être de type :
- `facture` - Problèmes de facturation
- `service` - Problèmes de service
- `compteur` - Problèmes de compteur
- `autre` - Autres types de problèmes

## 📊 Statuts des Réclamations

- `en attente` - En attente (par défaut)
- `en cours` - En cours de traitement
- `résolue` - Résolue
- `rejetée` - Rejetée

## 💻 Exemples d'Utilisation

### 1. Créer une Réclamation

```javascript
const response = await fetch('/api/complaints', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    type: 'facture',
    subject: 'Problème avec ma facture',
    description: 'Je n\'ai pas reçu ma facture du mois dernier.'
  })
});
```

### 2. Voir ses Réclamations

```javascript
const response = await fetch('/api/complaints', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const complaints = await response.json();
```

### 3. Voir une Réclamation Spécifique

```javascript
const response = await fetch(`/api/complaints/${complaintId}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const complaint = await response.json();
```

### 4. Modifier une Réclamation

```javascript
const response = await fetch(`/api/complaints/${complaintId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    description: 'Nouvelle description de la réclamation'
  })
});
```

## 🧪 Test du Système

Pour tester le système, utilisez le fichier `test-complaints.js` :

```bash
npm install axios
node test-complaints.js
```

## 📋 Structure de la Base de Données

### Table `complaints`
```sql
CREATE TABLE complaints (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  invoice_id INT,
  type ENUM('facture', 'service', 'compteur', 'autre') NOT NULL,
  subject VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  status ENUM('pending', 'in_progress', 'resolved', 'closed') DEFAULT 'pending',
  response TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (invoice_id) REFERENCES invoices(id)
);
```

## 🔧 Configuration

Assurez-vous que les variables d'environnement suivantes sont configurées :

```env
JWT_SECRET=your_jwt_secret_key
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_database_name
```

## 🚀 Démarrage

1. Installer les dépendances :
```bash
npm install
```

2. Configurer la base de données (voir `config/db.js`)

3. Démarrer le serveur :
```bash
npm start
```

Le serveur sera accessible sur `http://localhost:3001`

## 📝 Validation

Les réclamations sont validées avec les règles suivantes :
- `type` : Doit être l'un des types autorisés
- `subject` : 5-100 caractères
- `description` : 10-1000 caractères

## 🔒 Sécurité

- ✅ Authentification JWT obligatoire
- ✅ Validation des données d'entrée
- ✅ Les utilisateurs ne peuvent voir que leurs propres réclamations
- ✅ Les utilisateurs ne peuvent modifier que leurs réclamations en attente