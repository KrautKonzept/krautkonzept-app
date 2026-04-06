import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/api/base44Client';
const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) { setUser({ ...session.user, role: 'admin' }); setIsAuthenticated(true); }
      setIsLoadingAuth(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) { setUser({ ...session.user, role: 'admin' }); setIsAuthenticated(true); }
      else { setUser(null); setIsAuthenticated(false); }
      setIsLoadingAuth(false);
    });
    return () => subscription.unsubscribe();
  }, []);
  const logout = async () => { await supabase.auth.signOut(); window.location.href = '/'; };
  const navigateToLogin = () => { window.location.href = '/login'; };
  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoadingAuth, isLoadingPublicSettings: false, authError: null, appPublicSettings: {}, logout, navigateToLogin }}>
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => { const ctx = useContext(AuthContext); if (!ctx) throw new Error('no AuthProvider'); return ctx; };
