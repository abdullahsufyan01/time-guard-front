import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { auth, functions } from '../config/firebase';

export const authService = {
  // Login with email and password
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login erfolgreich:', userCredential.user.uid);
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('Login Fehler:', error);
      return { success: false, error: error.message };
    }
  },

  // Register new user (client-side)
  async register(email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Registrierung erfolgreich:', userCredential.user.uid);
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('Registrierung Fehler:', error);
      return { success: false, error: error.message };
    }
  },

  // Create user with password using Firebase Function
  async createUserWithPassword(email, password, displayName) {
    try {
      const createUserFunction = httpsCallable(functions, 'createUserWithPassword');
      const result = await createUserFunction({
        email: email,
        password: password,
        name: displayName || ''
      });
      
      console.log('Benutzer erstellt mit Function:', result.data);
      return { success: true, user: result.data };
    } catch (error) {
      console.error('Fehler beim Erstellen des Benutzers mit Function:', error);
      return { success: false, error: error.message };
    }
  },

  // Logout
  async logout() {
    try {
      await signOut(auth);
      console.log('Logout erfolgreich');
      return { success: true };
    } catch (error) {
      console.error('Logout Fehler:', error);
      return { success: false, error: error.message };
    }
  },

  // Get current user
  getCurrentUser() {
    return auth.currentUser;
  },

  // Listen to auth state changes
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  }
};