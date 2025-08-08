// /src/pages/NewComplaint.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/newComplaint.css';

const NewComplaint = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    type: '',
    invoice_id: '',
    contrat_numero: '', // Ajout du champ numéro de contrat
    subject: '',
    phone_number: '', // Add phone number field
    description: '',
    attachments: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      attachments: Array.from(e.target.files),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Token d\'authentification manquant');
        setIsSubmitting(false);
        return;
      }

      const response = await fetch('http://localhost:3001/api/complaints', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          invoice_id: formData.invoice_id || null,
          contrat_numero: formData.contrat_numero, // Envoi du numéro de contrat
          objet: formData.subject, // Backend expects 'objet' instead of 'subject'
          phone_number: formData.phone_number || null, // Include phone number
          description: formData.description,
          type: formData.type // Envoi du type de réclamation
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la création de la réclamation');
      }

      const data = await response.json();
      console.log('Réclamation créée:', data);
      navigate('/complaints');
    } catch (error) {
      console.error('Erreur:', error);
      setError(error.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="new-complaint-page">
      <h1>Déposer une réclamation</h1>

      {error && (
        <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="complaint-form">
        <div className="form-group">
          <label htmlFor="type">Type de réclamation</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
          >
            <option value="">Sélectionnez un type</option>
            <option value="eau">Eau</option>
            <option value="electricite">Électricité</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="contrat_numero">Numéro de contrat</label>
          <input
            type="text"
            id="contrat_numero"
            name="contrat_numero"
            value={formData.contrat_numero}
            onChange={handleChange}
            placeholder="Ex: CONT-2023-001"
            required
          />
          <small>Entrez le numéro de votre contrat pour identifier votre compte</small>
        </div>

        <div className="form-group">
          <label htmlFor="invoice_id">Numéro de facture concernée (optionnel)</label>
          <input
            type="text"
            id="invoice_id"
            name="invoice_id"
            value={formData.invoice_id}
            onChange={handleChange}
            placeholder="Ex: 2023-001"
          />
          <small>Si votre réclamation concerne une facture spécifique</small>
        </div>

        <div className="form-group">
          <label htmlFor="subject">Sujet</label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="Décrivez brièvement votre réclamation"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone_number">Numéro de téléphone</label>
          <input
            type="tel"
            id="phone_number"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            placeholder="Ex: +33 1 23 45 67 89"
            required
          />
          <small>Votre numéro de téléphone pour vous contacter</small>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description détaillée</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="5"
            placeholder="Décrivez en détail votre réclamation..."
            required
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="attachments">Pièces jointes (optionnel)</label>
          <input
            type="file"
            id="attachments"
            name="attachments"
            onChange={handleFileChange}
            multiple
          />
          <small>Vous pouvez joindre jusqu'à 5 fichiers (PDF, JPG, PNG)</small>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate(-1)}
          >
            Annuler
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Envoi en cours...' : 'Soumettre la réclamation'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewComplaint;