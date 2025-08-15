import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../assets/styles/login.css';

// Import SVG icons
import emailIcon from '../assets/icons/email.svg';
import lockIcon from '../assets/icons/lock.svg';
import eyeIcon from '../assets/icons/eye.svg';
import eyeOffIcon from '../assets/icons/eye-off.svg';
import googleIcon from '../assets/icons/google.svg';
import facebookIcon from '../assets/icons/facebook.svg';
import srmlogoIcon from '../assets/icons/srmlogo.webp';

export default function Login() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      const userData = JSON.parse(user);
      // Redirect based on role
      if (userData.role === 'admin') {
        navigate('/admin');
      } else if (userData.role === 'technicien') {
        navigate('/technicien');
      } else if (userData.role === 'agent') {
        navigate('/agent');
      } else {
        navigate('/home');
      }
    }
  }, [navigate]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        // If API sends error message in data.message, show it
        throw new Error(data.message || 'Email ou mot de passe incorrect');
      }

      // Show success animation
      setSuccess(true);
      
      // Store token and user in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // If remember me is checked, store email in localStorage
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', credentials.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      // Wait for animation to complete before redirecting
      setTimeout(() => {
        // Redirect based on role
        if (data.user.role === 'admin') {
          navigate('/admin');
        } else if (data.user.role === 'technicien') {
          navigate('/technicien');
        } else if (data.user.role === 'agent') {
          navigate('/agent');
        } else {
          navigate('/home');
        }
      }, 1000);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Load remembered email if exists
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setCredentials(prev => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="login-container">
      <div className="login-image-side">
        <div className="login-image-overlay">
          <div className="login-image-logo">
            <img src={srmlogoIcon} alt="SRM Logo" />
          </div>
          <h1 className="login-image-title">Société Régionale Multiservices</h1>
          <p className="login-image-subtitle">
            Bienvenue sur notre plateforme de gestion des réclamations.
          </p>
        </div>
      </div>
      
      <div className="login-form-side">
        <div className="login-card">
          <div className="login-logo">
            <img src={srmlogoIcon} alt="SRM Logo" />
          </div>
          
          <h1 className="login-title">Connexion</h1>
          <p className="login-subtitle">Entrez vos identifiants pour accéder à votre compte</p>
          
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}
          
          {success && (
            <div className="success-checkmark show">
              <div className="check-icon">
                <span className="icon-line line-tip"></span>
                <span className="icon-line line-long"></span>
                <div className="icon-circle"></div>
                <div className="icon-fix"></div>
              </div>
            </div>
          )}
          
          {!success && (
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <img src={emailIcon} alt="Email" className="input-icon" />
                <input
                  type="email"
                  className="form-input"
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                  placeholder="Adresse email"
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="input-group">
                <img src={lockIcon} alt="Password" className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  placeholder="Mot de passe"
                  required
                  disabled={loading}
                />
                <div className="password-toggle" onClick={togglePasswordVisibility}>
                  <img src={showPassword ? eyeOffIcon : eyeIcon} alt="Toggle password visibility" />
                </div>
              </div>
              
              <div className="remember-forgot">
                <label className="remember-me">
                  <input 
                    type="checkbox" 
                    checked={rememberMe} 
                    onChange={() => setRememberMe(!rememberMe)}
                    disabled={loading}
                  />
                  Se souvenir de moi
                </label>
                <a href="#" className="forgot-password">Mot de passe oublié?</a>
              </div>
              
              <button 
                type="submit" 
                className={`login-button ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                <span className="login-button-text">Se connecter</span>
                <div className="login-button-loading"></div>
              </button>              
            </form>
          )}
          
          <div className="signup-link">
            Pas encore de compte? <Link to="/signup">Créer un compte</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
