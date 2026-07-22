"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client"; //

export default function CheckoutButton() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Initialize the Supabase Browser Client
  const supabase = createClient(); //

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser(); //
      if (user) {
        setUserId(user.id);
      }
      setLoading(false);
    }
    getUser();
  }, [supabase]);

  const handleCheckout = () => {
    // Replace YOUR_PRODUCT_ID with your actual Lemon Squeezy product URL
    const PRODUCT_URL = "https://your-store.lemonsqueezy.com/checkout/buy/YOUR_PRODUCT_ID";
    
    // Attach the Supabase user ID to the checkout URL so the webhook knows who paid
    if (userId) {
      window.location.href = `${PRODUCT_URL}?checkout[custom][user_id]=${userId}`;
    } else {
      alert("Please log in first to purchase a premium pass.");
    }
  };

  if (loading) return <button className="bg-gray-300 px-4 py-2 rounded-md animate-pulse">Loading...</button>;

  return (
    <button 
      onClick={handleCheckout}
      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-all shadow-md"
    >
      Upgrade to Premium
    </button>
  );
}
