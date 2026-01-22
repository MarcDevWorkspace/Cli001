// In a real serverless setup, this would be a secure HTTP-only cookie session check.
// For this client-side demo, we use simple localStorage + hardcoded check.

const AUTH_KEY = 'bertrand_admin_session';
const MOCK_PASSWORD = 'admin'; // Hardcoded for demo purposes

export const authService = {
  login: async (password: string): Promise<boolean> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (password === MOCK_PASSWORD) {
      localStorage.setItem(AUTH_KEY, 'true');
      return true;
    }
    return false;
  },

  logout: () => {
    localStorage.removeItem(AUTH_KEY);
    window.location.reload();
  },

  isAuthenticated: (): boolean => {
    return localStorage.getItem(AUTH_KEY) === 'true';
  }
};