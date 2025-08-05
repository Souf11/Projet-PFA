// /utils/validation.js
const Joi = require('joi');

const complaintSchema = Joi.object({
  type: Joi.string().valid('facture', 'service', 'compteur', 'autre').required(),
  subject: Joi.string().min(5).max(100).required(),
  description: Joi.string().min(10).max(1000).required()
});

const validateComplaint = (data) => {
  return complaintSchema.validate(data);
};

module.exports = {
  validateComplaint
};