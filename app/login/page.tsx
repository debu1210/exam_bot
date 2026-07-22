'use client';

import { createClientBrowser } from '@/utils/supabase';
import { useState } from 'react';

export default function Login() {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    const supabase = createClientBrowser();
    
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome Back</h1>
        <p className="text-slate-500 mb-8">Sign in to access your study materials.</p>
        
        <button 
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-slate-900 text-white font-medium py-3 px-4 rounded-md hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          {loading ? 'Connecting...' : 'Continue with Google'}
        </button>
      </div>
    </main>
  );
}
