# Système d'Historique des Statuts de Réclamations

Ce module permet de suivre l'historique des changements de statut pour chaque réclamation dans le système SRM.

## 🚀 Fonctionnalités

- ✅ **Suivi automatique** - Enregistrement automatique de chaque changement de statut
- ✅ **Traçabilité complète** - Stockage de l'ancien statut, du nouveau statut, de l'utilisateur ayant effectué le changement et de la date/heure
- ✅ **Visualisation** - Interface utilisateur pour visualiser l'historique des changements
- ✅ **API dédiée** - Endpoints pour récupérer l'historique des statuts

## 📋 Structure de la Base de Données

### Table `status_history`

```sql
CREATE TABLE srmdb.status_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  reclamation_id INT NOT NULL,
  old_status ENUM('en attente', 'en cours', 'résolue', 'rejetée') NOT NULL,
  new_status ENUM('en attente', 'en cours', 'résolue', 'rejetée') NOT NULL,
  changed_by INT NOT NULL,
  changed_at DATETIME NOT NULL,
  FOREIGN KEY (reclamation_id) REFERENCES srmdb.reclamations(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by) REFERENCES srmdb.users(id) ON DELETE CASCADE,
  INDEX (reclamation_id),
  INDEX (changed_by),
  INDEX (changed_at)
);
```

## 📝 API Endpoints

### Récupérer l'historique des statuts d'une réclamation

```
GET /api/admin/complaints/:id/history
```

**Paramètres URL:**
- `id` - ID de la réclamation

**Réponse:**
```json
[
  {
    "id": 1,
    "reclamation_id": 5,
    "old_status": "en attente",
    "new_status": "en cours",
    "changed_by": 2,
    "changed_at": "2023-06-15T14:30:45.000Z",
    "changed_by_name": "Jean Dupont"
  },
  {
    "id": 2,
    "reclamation_id": 5,
    "old_status": "en cours",
    "new_status": "résolue",
    "changed_by": 3,
    "changed_at": "2023-06-16T09:15:22.000Z",
    "changed_by_name": "Marie Martin"
  }
]
```

## 💻 Modèles

### StatusHistory.js

Le modèle `StatusHistory` fournit les méthodes suivantes:

- `create(statusHistoryData)` - Crée un nouvel enregistrement d'historique
- `findByReclamationId(reclamationId)` - Récupère tout l'historique pour une réclamation
- `findLastStatusChange(reclamationId)` - Récupère le dernier changement de statut

## 🧪 Tests

Pour tester le système d'historique des statuts, utilisez le script `test-status-history.js`:

```bash
node test-status-history.js
```

## 📊 Intégration Frontend

Le composant React `StatusHistory.jsx` permet d'afficher l'historique des statuts d'une réclamation avec une interface utilisateur intuitive:

```jsx
<StatusHistory reclamationId={reclamationId} />
```

## 🔧 Configuration

Le système d'historique des statuts est automatiquement configuré lors de la mise à jour du statut d'une réclamation. Aucune configuration supplémentaire n'est nécessaire.

## 🚀 Déploiement

Le système d'historique des statuts est déployé avec le reste de l'application SRM. Assurez-vous que la table `status_history` est créée dans la base de données en exécutant le script `setup-status-history.js`:

```bash
node setup-status-history.js
```