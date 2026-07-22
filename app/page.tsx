'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/server';
import CheckoutButton from '@/components/CheckoutButton';

type StudyMaterial = {
  id: string;
  subject: string;
  output_type: string;
  content: string;
  created_at: string;
};

export default function ExamBotMVP() {
  const [subject, setSubject] = useState('Physics (JEE Main Level 2026)');
  const [outputType, setOutputType] = useState('Chapter Formula Sheet');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [history, setHistory] = useState<StudyMaterial[]>([]);
  const [isPremium, setIsPremium] = useState(false);
  
  const supabase = createClient();

  const fetchUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('is_premium').eq('id', user.id).single();
      if (profile) setIsPremium(profile.is_premium);
      
      const { data } = await supabase.from('study_materials').select('*').order('created_at', { ascending: false });
      if (data) setHistory(data);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult('');
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, outputType }),
      });

      const data = await response.json();
      if (response.ok) {
        setResult(data.result);
        fetchUserData(); 
      } else {
        setResult('Error: ' + data.error);
      }
    } catch (error) {
      setResult('Failed to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-8 font-sans flex items-start justify-center gap-8">
      
      <div className="w-full max-w-xl">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-3xl font-bold text-slate-900">Syllabus & Exam Bot</h1>
            {isPremium && <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">PRO</span>}
          </div>
          <p className="text-slate-500 mb-8">Generate highly accurate study materials instantly.</p>

          <form onSubmit={handleGenerate} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700">Subject & Syllabus</label>
              <select 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="mt-2 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 p-3 border bg-slate-50"
              >
                <option>Physics (JEE Main Level 2026)</option>
                <option>Mathematics (ISC Class 12)</option>
                <option>English Literature (ISC Macbeth)</option>
                <option>Chemistry</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700">Target Output</label>
              <select 
                value={outputType}
                onChange={(e) => setOutputType(e.target.value)}
                className="mt-2 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 p-3 border bg-slate-50"
              >
                <option>Chapter Formula Sheet</option>
                <option>10-Mark Structured Question</option>
                <option>15-Mark Structured Question</option>
                <option>Character Sketch</option>
              </select>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-slate-900 text-white font-medium py-3 px-4 rounded-md hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {loading ? 'Generating with AI...' : 'Generate Study Material'}
            </button>
          </form>
        </div>

        {result && (
          <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-100">
            <h3 className="font-semibold text-blue-900 mb-2">Result:</h3>
            <p className="text-blue-800 whitespace-pre-wrap">{result}</p>
          </div>
        )}
      </div>

      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 h-[70vh] overflow-y-auto">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Your Study Vault</h2>
          
          {history.length === 0 ? (
            <p className="text-slate-500 text-sm">You haven't generated any materials yet.</p>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <div key={item.id} className="p-4 border border-slate-100 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer" onClick={() => setResult(item.content)}>
                  <div className="text-xs font-bold text-blue-600 mb-1">{item.subject}</div>
                  <div className="text-sm font-medium text-slate-900">{item.output_type}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {!isPremium && <CheckoutButton />}
      </div>

    </main>
  );
}
