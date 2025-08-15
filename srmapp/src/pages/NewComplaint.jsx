// /src/pages/NewComplaint.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/user-dashboard.css';
import '../assets/styles/complaints.css';
import '../assets/styles/newComplaint.css';

const NewComplaint = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    type: '',
    contrat_numero: '', // Ajout du champ numéro de contrat
    subject: '',
    phone_number: '', // Add phone number field
    description: '',
    attachments: [],
  });
  
  // Sujets prédéfinis selon le type de réclamation
  const subjectOptions = {
    electricite: [
      'arrachement de cable',
      'cable en feu',
      'chute de tension',
      'compteur brûlé',
      'compteur volé',
      'surtension',
      'verifier compteur'
    ],
    eau: [
      'affaissement',
      'bouchage reseau assainissement',
      'casse de conduite',
      'compteur bloqué',
      'compteur cassé',
      'compteur volé',
      'debordement',
      'verifier compteur'
    ]
  };
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
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="section-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h1 className="section-title" style={{ margin: 0 }}>Déposer une réclamation</h1>
          </div>
          
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
            className="form-control"
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
            className="form-control"
          />
          <small>Entrez le numéro de votre contrat pour identifier votre compte</small>
        </div>



        <div className="form-group">
          <label htmlFor="subject">Sujet</label>
          <select
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            className="form-control"
          >
            <option value="">Sélectionnez un sujet</option>
            {formData.type && subjectOptions[formData.type] ? 
              subjectOptions[formData.type].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))
            : null}
          </select>
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
            className="form-control"
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
            className="form-control"
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
            className="form-control"
          />
          <small>Vous pouvez joindre jusqu'à 5 fichiers (PDF, JPG, PNG)</small>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="filter-btn"
            onClick={() => navigate(-1)}
          >
            Annuler
          </button>
          <button 
            type="submit" 
            className="view-all-btn" 
            style={{ textDecoration: 'none', display: 'inline-block', padding: '0.75rem 1.5rem', border: 'none', cursor: 'pointer' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Envoi en cours...' : 'Soumettre la réclamation'}
          </button>
        </div>
      </form>
        </div>
      </div>
    </div>
  );
};

export default NewComplaint;