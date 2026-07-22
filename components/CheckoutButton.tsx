'use client';

import { useState, useEffect } from 'react';
import { createClientBrowser } from '@/utils/supabase';

export default function CheckoutButton() {
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClientBrowser();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    getUser();
  }, [supabase.auth]);

  const handleCheckout = () => {
    if (!userId) {
      alert("Please log in to purchase the premium pass.");
      return;
    }

    setLoading(true);
    const PRODUCT_URL = "https://your-store.lemonsqueezy.com/checkout/buy/YOUR_PRODUCT_ID";
    const checkoutUrl = new URL(PRODUCT_URL);
    checkoutUrl.searchParams.append('checkout[custom][user_id]', userId);
    window.location.href = checkoutUrl.toString();
  };

  return (
    <div className="p-6 bg-white border border-blue-200 rounded-xl shadow-sm text-center mt-6">
      <h3 className="text-lg font-bold text-slate-900 mb-2">Premium Exam Pass</h3>
      <p className="text-slate-500 mb-4 text-xs">Unlock unlimited generations and bypass free-tier rate limits.</p>
      <button 
        onClick={handleCheckout}
        disabled={loading || !userId}
        className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {loading ? 'Redirecting...' : 'Upgrade Now - $9.99'}
      </button>
    </div>
  );
}
