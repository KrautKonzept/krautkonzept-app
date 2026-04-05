import { useState } from 'react';
import { supabase } from '@/api/base44Client';
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const handleLogin = async () => {
    setLoading(true); setError('');
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      window.location.href = '/';
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-1 text-gray-900">KrautKonzept</h1>
        <p className="text-sm text-gray-400 mb-6">Struktur schafft Raum für Wachstum.</p>
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        <input type="email" placeholder="E-Mail" value={email} onChange={e => setEmail(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 mb-3 text-sm outline-none focus:ring-2 focus:ring-green-700" />
        <input type="password" placeholder="Passwort" value={password} onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          className="w-full border rounded-lg px-3 py-2 mb-4 text-sm outline-none focus:ring-2 focus:ring-green-700" />
        <button onClick={handleLogin} disabled={loading}
          className="w-full bg-green-700 hover:bg-green-800 text-white rounded-lg py-2 text-sm font-medium transition-colors">
          {loading ? 'Einloggen...' : 'Einloggen'}
        </button>
      </div>
    </div>
  );
}
