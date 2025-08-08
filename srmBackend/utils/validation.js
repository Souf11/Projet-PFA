// /utils/validation.js
const Joi = require('joi');

const complaintSchema = Joi.object({
  objet: Joi.string().min(5).max(150).required(),
  description: Joi.string().min(10).max(1000).required(),
  client_id: Joi.number().integer().positive().allow(null),
  contrat_id: Joi.number().integer().positive().allow(null),
  contrat_numero: Joi.string().min(5).max(50).allow(null, ''),
  type: Joi.string().valid('standard', 'urgent', 'technique', 'commercial').default('standard'),
  phone_number: Joi.string().min(8).max(20).allow(null, '')
});

const clientSchema = Joi.object({
  nom: Joi.string().min(2).max(100).required(),
  adresse: Joi.string().min(5).max(255).allow(null, ''),
  telephone: Joi.string().min(8).max(20).required()
});

const contratSchema = Joi.object({
  client_id: Joi.number().integer().positive().required(),
  type_service: Joi.string().valid('eau', 'electricite').required(),
  numero_contrat: Joi.string().min(5).max(50).required()
});

const demandeSchema = Joi.object({
  reclamation_id: Joi.number().integer().positive().required(),
  type_demande: Joi.string().valid('assistance_technicien', 'materiel').required(),
  description: Joi.string().min(10).max(1000).required(),
  materiel_demande: Joi.string().min(3).max(255).when('type_demande', {
    is: 'materiel',
    then: Joi.required(),
    otherwise: Joi.allow(null, '')
  })
});

const validateComplaint = (data) => {
  return complaintSchema.validate(data);
};

const validateClient = (data) => {
  return clientSchema.validate(data);
};

const validateContrat = (data) => {
  return contratSchema.validate(data);
};

const validateDemande = (data) => {
  return demandeSchema.validate(data);
};

module.exports = {
  validateComplaint,
  validateClient,
  validateContrat,
  validateDemande
};