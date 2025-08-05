# 🚀 Guide de Configuration - Système de Réclamations

## ❌ Problème Actuel
Le système de réclamations ne fonctionne pas car la base de données n'est pas configurée.

## 🔧 Étapes de Configuration

### 1. Installer MySQL (si pas déjà fait)
- Téléchargez MySQL depuis: https://dev.mysql.com/downloads/mysql/
- Ou utilisez XAMPP: https://www.apachefriends.org/

### 2. Créer la Base de Données
```sql
CREATE DATABASE srm_db;
USE srm_db;
```

### 3. Créer les Tables Nécessaires

#### Table `users` (si pas déjà créée)
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Table `invoices` (si pas déjà créée)
```sql
CREATE TABLE invoices (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  invoice_number VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status ENUM('paid', 'unpaid', 'overdue') DEFAULT 'unpaid',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### Table `complaints`
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
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL
);
```

### 4. Configurer les Variables d'Environnement

Créez un fichier `.env` dans le dossier `srmBackend` avec le contenu suivant:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe_mysql
DB_NAME=srm_db

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here

# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000
```

**⚠️ Important:** Remplacez `votre_mot_de_passe_mysql` par votre vrai mot de passe MySQL.

### 5. Tester la Configuration

Après avoir configuré la base de données et le fichier `.env`, exécutez:

```bash
node setup-database.js
```

### 6. Redémarrer le Serveur

```bash
npm start
```

## 🧪 Test du Système

1. **Créer un compte utilisateur** via l'interface web
2. **Se connecter** avec vos identifiants
3. **Aller sur la page des réclamations** et créer une nouvelle réclamation
4. **Vérifier** que la réclamation apparaît dans la liste

## 🔍 Dépannage

### Erreur "Access denied for user"
- Vérifiez que MySQL est installé et en cours d'exécution
- Vérifiez les identifiants dans le fichier `.env`
- Assurez-vous que l'utilisateur MySQL a les droits sur la base de données

### Erreur "Route not found"
- Vérifiez que le serveur backend est en cours d'exécution sur le port 3001
- Vérifiez que les tables sont créées dans la base de données

### Erreur "Token invalide"
- Vérifiez que JWT_SECRET est défini dans le fichier `.env`
- Redémarrez le serveur après avoir modifié le fichier `.env`

## 📞 Support

Si vous rencontrez des problèmes, vérifiez:
1. ✅ MySQL est installé et en cours d'exécution
2. ✅ Le fichier `.env` est configuré correctement
3. ✅ Les tables sont créées dans la base de données
4. ✅ Le serveur backend est en cours d'exécution
5. ✅ Le frontend peut se connecter au backend 