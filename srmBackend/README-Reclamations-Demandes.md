# Système de Gestion des Réclamations et Demandes

Ce document explique les modifications apportées au système pour gérer les réclamations des clients et les demandes de techniciens.

## Schéma de Base de Données

Le schéma de base de données a été étendu avec les tables suivantes :

### Table `reclamations`

- `id` : Identifiant unique de la réclamation
- `contrat_id` : Référence au contrat concerné
- `client_id` : Référence au client concerné
- `objet` : Objet de la réclamation
- `description` : Description détaillée de la réclamation
- `status` : Statut de la réclamation (en attente, en cours, résolue, rejetée)
- `created_at` : Date de création
- `created_by` : Utilisateur ayant créé la réclamation
- `assigned_to` : Technicien assigné à la réclamation

### Table `status_history`

- `id` : Identifiant unique
- `reclamation_id` : Référence à la réclamation
- `old_status` : Ancien statut
- `new_status` : Nouveau statut
- `changed_by` : Utilisateur ayant effectué le changement
- `changed_at` : Date du changement

### Table `demandes`

- `id` : Identifiant unique
- `reclamation_id` : Référence à la réclamation
- `demandeur_id` : Technicien qui fait la demande
- `type_demande` : Type de demande (assistance_technicien, materiel)
- `description` : Description de la demande
- `status` : Statut de la demande (en_attente, approuvee, rejetee, terminee)
- `technicien_assigne_id` : Technicien assigné à la demande (si assistance)
- `materiel_demande` : Matériel demandé (si demande de matériel)
- `created_at` : Date de création
- `reponse` : Réponse à la demande
- `resolved_at` : Date de résolution

## Flux de Travail

1. **Création d'une réclamation** : Un agent du centre d'appel crée une réclamation pour un client, en spécifiant le contrat concerné.

2. **Affectation à un technicien** : L'agent affecte la réclamation à un technicien si elle est de nature technique.

3. **Traitement par le technicien** : Le technicien traite la réclamation et peut :
   - Mettre à jour le statut de la réclamation
   - Faire une demande d'assistance à un autre technicien
   - Faire une demande de matériel

4. **Suivi des demandes** : Les demandes sont suivies et peuvent être approuvées ou rejetées.

5. **Résolution** : Une fois la réclamation traitée, son statut est mis à jour et l'historique est enregistré.

## API Endpoints

### Réclamations

- `POST /api/complaints` : Créer une nouvelle réclamation
- `GET /api/complaints` : Lister les réclamations de l'utilisateur
- `GET /api/complaints/:id` : Obtenir les détails d'une réclamation
- `PUT /api/complaints/:id` : Mettre à jour une réclamation
- `DELETE /api/complaints/:id` : Supprimer une réclamation
- `PUT /api/complaints/:id/assign` : Affecter une réclamation à un technicien
- `PUT /api/complaints/:id/status` : Mettre à jour le statut d'une réclamation
- `GET /api/complaints/admin/all` : Lister toutes les réclamations (admin et agents)
- `GET /api/complaints/technicien/assigned` : Lister les réclamations assignées à un technicien

### Contrats et Clients

- `GET /api/clients/contrats/:id/reclamations` : Récupérer les réclamations associées à un contrat
- `GET /api/clients/:clientId/reclamations` : Récupérer les réclamations associées à un client

### Demandes

- `POST /api/demandes` : Créer une nouvelle demande
- `GET /api/demandes/mes-demandes` : Lister les demandes du technicien
- `GET /api/demandes/:id` : Obtenir les détails d'une demande
- `PUT /api/demandes/:id/status` : Mettre à jour le statut d'une demande
- `GET /api/demandes` : Lister toutes les demandes (admin)

## Installation

Pour mettre à jour la base de données avec le nouveau schéma, exécutez :

```bash
node update-database-schema.js
```

## Rôles Utilisateurs

- **Agent** : Peut créer des réclamations et les affecter à des techniciens
- **Technicien** : Peut traiter les réclamations et faire des demandes
- **Admin** : A accès à toutes les fonctionnalités