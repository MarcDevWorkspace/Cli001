import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from './firebase';

export const authService = {
  login: async (email: string, password: string): Promise<boolean> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error) {
      console.error("Login failed", error);
      return false;
    }
  },

  logout: async () => {
    try {
      await signOut(auth);
      window.location.reload();
    } catch (error) {
      console.error("Logout failed", error);
    }
  },

  // Note: This is now a synchronous check of state, but Firebase Auth is async.
  // Ideally, the app should subscribe to onAuthStateChanged.
  // For now, checking currentUser works if the auth state has initialized.
  isAuthenticated: (): boolean => {
    return !!auth.currentUser;
  },

  // Helper to subscribe to auth changes
  onAuthChange: (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
  }
};