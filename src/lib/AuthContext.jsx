import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase, base44 } from '@/api/base44Client';
const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) loadUser(); else setIsLoadingAuth(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) loadUser();
      else { setUser(null); setIsAuthenticated(false); setIsLoadingAuth(false); }
    });
    return () => subscription.unsubscribe();
  }, []);
  const loadUser = async () => {
    try { const profile = await base44.auth.me(); setUser(profile); setIsAuthenticated(true); }
    catch { setIsAuthenticated(false); }
    finally { setIsLoadingAuth(false); }
  };
  const logout = () => base44.auth.logout();
  const navigateToLogin = () => { window.location.href = '/login'; };
  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoadingAuth, isLoadingPublicSettings: false, authError: null, appPublicSettings: {}, logout, navigateToLogin }}>
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
