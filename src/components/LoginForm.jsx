import React, { useState } from 'react';
import { authService } from '../services/authService';
import { adminService } from '../services/adminService';

const LoginForm = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isLogin) {
        // Login
        const result = await authService.login(email, password);
        if (result.success) {
          setMessage('Login erfolgreich!');
          onLoginSuccess && onLoginSuccess(result.user);
        } else {
          setMessage(`Login Fehler: ${result.error}`);
        }
      } else {
        // Register - use Firebase Function to create user with password
        const functionResult = await authService.createUserWithPassword(email, password, displayName);
        if (functionResult.success) {
          setMessage('Benutzer erfolgreich erstellt! Sie können sich jetzt einloggen.');
          setIsLogin(true);
          setPassword('');
        } else {
          setMessage(`Registrierung Fehler: ${functionResult.error}`);
        }
      }
    } catch (error) {
      setMessage(`Fehler: ${error.message}`);
    }

    setLoading(false);
  };

  const formStyle = {
    maxWidth: '400px',
    margin: '50px auto',
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9'
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    margin: '10px 0',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px'
  };

  const buttonStyle = {
    width: '100%',
    padding: '12px',
    backgroundColor: '#0085be',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
    marginTop: '10px'
  };

  const switchButtonStyle = {
    background: 'none',
    border: 'none',
    color: '#0085be',
    cursor: 'pointer',
    textDecoration: 'underline',
    marginTop: '10px'
  };

  return (
    <div style={formStyle}>
      <h2 style={{ textAlign: 'center', color: '#0085be' }}>
        {isLogin ? 'Anmelden' : 'Registrieren'}
      </h2>
      
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <input
            type="text"
            placeholder="Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            style={inputStyle}
            required
          />
        )}
        
        <input
          type="email"
          placeholder="E-Mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
          required
        />
        
        <input
          type="password"
          placeholder="Passwort"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
          required
        />
        
        <button 
          type="submit" 
          style={buttonStyle}
          disabled={loading}
        >
          {loading ? 'Wird verarbeitet...' : (isLogin ? 'Anmelden' : 'Registrieren')}
        </button>
      </form>
      
      <div style={{ textAlign: 'center', marginTop: '15px' }}>
        <button
          type="button"
          onClick={() => {
            setIsLogin(!isLogin);
            setMessage('');
            setPassword('');
          }}
          style={switchButtonStyle}
        >
          {isLogin ? 'Noch kein Konto? Registrieren' : 'Bereits ein Konto? Anmelden'}
        </button>
      </div>
      
      {message && (
        <div style={{ 
          marginTop: '15px', 
          padding: '10px', 
          backgroundColor: message.includes('erfolgreich') ? '#d4edda' : '#f8d7da',
          color: message.includes('erfolgreich') ? '#155724' : '#721c24',
          borderRadius: '4px',
          textAlign: 'center'
        }}>
          {message}
        </div>
      )}
    </div>
  );
};

export default LoginForm;