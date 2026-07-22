import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  
  if (!secret) {
    return NextResponse.json({ error: "Webhook secret missing" }, { status: 500 });
  }

  const rawBody = await request.text();
  const signatureHeader = request.headers.get("X-Signature") ?? "";
  const signature = Buffer.from(signatureHeader, "hex");
  const hmac = Buffer.from(crypto.createHmac("sha256", secret).update(rawBody).digest("hex"), "hex");

  if (signature.length === 0 || rawBody.length === 0 || !crypto.timingSafeEqual(hmac, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const data = JSON.parse(rawBody);
  
  // Unlocks the premium account automatically
  if (data.meta.event_name === 'order_created') {
    const supabaseUserId = data.meta.custom_data.user_id;
    if (supabaseUserId) {
      await supabaseAdmin.from('profiles').update({ is_premium: true }).eq('id', supabaseUserId);
    }
  }

  return NextResponse.json({ status: "success" }, { status: 200 });
}
