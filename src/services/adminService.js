// Client-side service to interact with Firebase Admin API
const API_BASE_URL = 'http://localhost:3001/api';

export const adminService = {
  async setUserPassword(uid, newPassword) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/set-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uid, newPassword }),
      });
      
      return await response.json();
    } catch (error) {
      console.error('Fehler beim Setzen des Passworts:', error);
      return { success: false, error: error.message };
    }
  },

  async createUser(email, password, displayName) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, displayName }),
      });
      
      return await response.json();
    } catch (error) {
      console.error('Fehler beim Erstellen des Benutzers:', error);
      return { success: false, error: error.message };
    }
  },

  async deleteUser(uid) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${uid}`, {
        method: 'DELETE',
      });
      
      return await response.json();
    } catch (error) {
      console.error('Fehler beim Löschen des Benutzers:', error);
      return { success: false, error: error.message };
    }
  },

  async getUserByEmail(email) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/email/${encodeURIComponent(email)}`);
      
      return await response.json();
    } catch (error) {
      console.error('Fehler beim Abrufen des Benutzers:', error);
      return { success: false, error: error.message };
    }
  }
};