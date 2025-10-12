import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { adminService } from '../services/adminService';

const UserDashboard = ({ user, onLogout }) => {
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      setMessage('Bitte geben Sie ein neues Passwort ein');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const result = await adminService.setUserPassword(user.uid, newPassword);
      if (result.success) {
        setMessage('Passwort erfolgreich geändert!');
        setNewPassword('');
      } else {
        setMessage(`Fehler beim Ändern des Passworts: ${result.error}`);
      }
    } catch (error) {
      setMessage(`Fehler: ${error.message}`);
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    const result = await authService.logout();
    if (result.success) {
      onLogout && onLogout();
    }
  };

  const dashboardStyle = {
    maxWidth: '600px',
    margin: '20px auto',
    padding: '20px',
    border: '1px solid #0085be',
    borderRadius: '8px',
    backgroundColor: 'white',
    boxShadow: '0 4px 6px rgba(0, 133, 190, 0.1)'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '10px',
    borderBottom: '2px solid #0085be'
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    margin: '10px 0',
    border: '2px solid #0085be',
    borderRadius: '4px',
    fontSize: '16px',
    transition: 'border-color 0.3s ease'
  };

  const buttonStyle = {
    padding: '10px 20px',
    backgroundColor: '#0085be',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '10px',
    transition: 'background-color 0.3s ease',
    fontWeight: 'bold'
  };

  const logoutButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#e74c3c',
    transition: 'background-color 0.3s ease'
  };

  return (
    <div style={dashboardStyle}>
      <div style={headerStyle}>
        <div>
          <h2 style={{ margin: 0, color: '#0085be' }}>Willkommen!</h2>
          <p style={{ margin: '5px 0', color: '#666' }}>
            Eingeloggt als: {user.email}
          </p>
          <p style={{ margin: '5px 0', color: '#666' }}>
            User ID: {user.uid}
          </p>
        </div>
        <button onClick={handleLogout} style={logoutButtonStyle}>
          Abmelden
        </button>
      </div>

      <div>
        <h3 style={{ color: '#0085be' }}>Passwort ändern</h3>
        <form onSubmit={handlePasswordChange}>
          <input
            type="password"
            placeholder="Neues Passwort"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={inputStyle}
            required
          />
          <button 
            type="submit" 
            style={buttonStyle}
            disabled={loading}
          >
            {loading ? 'Wird geändert...' : 'Passwort ändern'}
          </button>
        </form>
      </div>

      {message && (
        <div style={{ 
          marginTop: '15px', 
          padding: '10px', 
          backgroundColor: message.includes('erfolgreich') ? '#e8f5e8' : '#ffe6e6',
          color: message.includes('erfolgreich') ? '#2d5a2d' : '#8b0000',
          borderRadius: '4px',
          border: message.includes('erfolgreich') ? '1px solid #27ae60' : '1px solid #e74c3c'
        }}>
          {message}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;