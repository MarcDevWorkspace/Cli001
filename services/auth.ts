import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from './firebase';

export const authService = {
  login: async (email: string, password: string): Promise<boolean> => {
    console.log(`[Auth] Attempting login for: ${email}`);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("[Auth] Login successful");
      return true;
    } catch (error) {
      console.error("[Auth] Login failed", error);
      return false;
    }
  },

  logout: async () => {
    console.log("[Auth] Logging out...");
    try {
      await signOut(auth);
      console.log("[Auth] Logout successful, reloading...");
      window.location.reload();
    } catch (error) {
      console.error("[Auth] Logout failed", error);
    }
  },

  isAuthenticated: (): boolean => {
    const isAuth = !!auth.currentUser;
    console.log(`[Auth] isAuthenticated check synchronous: ${isAuth}`);
    return isAuth;
  },

  onAuthChange: (callback: (user: User | null) => void) => {
    console.log("[Auth] Subscribing to auth state changes");
    return onAuthStateChanged(auth, (user) => {
      console.log(`[Auth] Auth state changed. User: ${user ? user.email : 'null'}`);
      callback(user);
    });
  }
};