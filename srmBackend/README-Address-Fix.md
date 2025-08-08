# 🛠️ Correction de la Table Users - Colonnes Manquantes

## 🔍 Problèmes Identifiés

Le système rencontre deux erreurs lors de la connexion en tant qu'administrateur :

1. **Erreur de colonne `address` manquante** :
```
ER_BAD_FIELD_ERROR: Unknown column 'address' in 'field list'
```

2. **Erreur de colonne `password_hash` manquante** :
```
ER_BAD_FIELD_ERROR: Unknown column 'password_hash' in 'field list'
```

Ces erreurs se produisent car le code fait référence à des colonnes qui n'existent pas dans la base de données actuelle.

## 🔄 Différence entre la Structure Attendue et Actuelle

### Structure Attendue (selon le code)
Le code de l'application s'attend à ce que la table `users` contienne les colonnes `address` et `password_hash` :

```sql
SELECT id, name, email, address, role, created_at FROM users
```

```sql
INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)
```

### Structure Actuelle (selon SETUP-GUIDE.md)
La structure définie dans le guide de configuration ne contient pas ces colonnes :

```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,  -- Devrait être password_hash
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  -- address manquant
);
```

## 🔧 Solutions

Deux scripts ont été créés pour résoudre les problèmes de colonnes manquantes :

### 1. Script pour ajouter la colonne `address`

```javascript
// add-address-column.js
require('dotenv').config();
const pool = require('./config/db');

async function addAddressColumn() {
  try {
    console.log('🔧 Ajout de la colonne address à la table users...');
    
    // Vérifier si la colonne existe déjà
    const [columns] = await pool.query('DESCRIBE users');
    const addressColumnExists = columns.some(col => col.Field === 'address');
    
    if (addressColumnExists) {
      console.log('✅ La colonne address existe déjà dans la table users');
    } else {
      // Ajouter la colonne address
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN address VARCHAR(255) NULL
      `);
      
      console.log('✅ Colonne address ajoutée avec succès!');
    }
    
    // Vérifier la structure de la table
    const [updatedColumns] = await pool.query('DESCRIBE users');
    console.log('\nStructure actuelle de la table users:');
    updatedColumns.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout de la colonne:', error);
  } finally {
    process.exit(0);
  }
}

addAddressColumn();
```

### 2. Script pour renommer la colonne `password` en `password_hash`

```javascript
// fix-password-column.js
require('dotenv').config();
const pool = require('./config/db');

async function fixPasswordColumn() {
  try {
    console.log('🔧 Vérification des colonnes de mot de passe dans la table users...');
    
    // Vérifier la structure actuelle
    const [columns] = await pool.query('DESCRIBE users');
    console.log('Structure actuelle de la table users:');
    columns.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Vérifier si password_hash existe
    const passwordHashExists = columns.some(col => col.Field === 'password_hash');
    const passwordExists = columns.some(col => col.Field === 'password');
    
    if (passwordHashExists) {
      console.log('✅ La colonne password_hash existe déjà');
    } else if (passwordExists) {
      console.log('🔄 Renommage de la colonne password en password_hash...');
      
      // Renommer la colonne password en password_hash
      await pool.query(`
        ALTER TABLE users 
        CHANGE COLUMN password password_hash VARCHAR(255) NOT NULL
      `);
      
      console.log('✅ Colonne password renommée en password_hash avec succès!');
    } else {
      console.log('❌ Ni password ni password_hash n\'existent dans la table users');
      console.log('🔄 Création de la colonne password_hash...');
      
      // Créer la colonne password_hash
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN password_hash VARCHAR(255) NOT NULL
      `);
      
      console.log('✅ Colonne password_hash créée avec succès!');
    }
    
    // Vérifier la structure mise à jour
    const [updatedColumns] = await pool.query('DESCRIBE users');
    console.log('\nStructure mise à jour de la table users:');
    updatedColumns.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la modification de la colonne:', error);
  } finally {
    process.exit(0);
  }
}

fixPasswordColumn();
```

## 🚀 Instructions d'Exécution

1. Assurez-vous que votre fichier `.env` est correctement configuré avec les informations de connexion à la base de données

2. Exécutez le script pour ajouter la colonne `address` :

```bash
node add-address-column.js
```

3. Exécutez le script pour corriger la colonne `password_hash` :

```bash
node fix-password-column.js
```

4. Vérifiez la structure de la table users :

```bash
node check-users-table.js
```

5. Créez un utilisateur administrateur (si nécessaire) :

```bash
node create-admin.js
```

6. Vérifiez que l'utilisateur a été créé :

```bash
node check-users.js
```

7. Redémarrez le serveur :

```bash
npm start
```

## 📝 Recommandations

### 1. Mise à jour du fichier SETUP-GUIDE.md

Mettez à jour le fichier `SETUP-GUIDE.md` pour inclure les colonnes manquantes dans la définition de la table `users` afin d'éviter ces problèmes à l'avenir :

```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  address VARCHAR(255) NULL,
  role ENUM('admin', 'technicien', 'agent') NOT NULL DEFAULT 'agent',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Cohérence du code

Assurez-vous que tous les fichiers du projet utilisent les mêmes noms de colonnes :

- Utilisez toujours `password_hash` au lieu de `password` pour le stockage des mots de passe hachés
- Incluez toujours la colonne `address` dans les requêtes SQL concernant les utilisateurs

### 3. Validation des données

Ajoutez une validation pour la colonne `address` dans les contrôleurs et les modèles pour s'assurer que les données sont correctement traitées, même si la colonne est facultative (NULL).