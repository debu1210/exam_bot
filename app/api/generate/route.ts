import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server'; //
import Groq from 'groq-sdk'; //

// Initialize Groq securely on the server
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY }); //

export async function POST(request: NextRequest) {
  try {
    // 1. Verify the user using the new Server Client
    const supabase = await createClient(); //
    const { data: { user }, error: authError } = await supabase.auth.getUser(); //

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    // 2. Parse the request from the frontend
    const body = await request.json();
    const { subject, topic, type } = body;

    if (!subject || !topic || !type) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // 3. Check if the user is premium (Optional check from your database)
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_premium')
      .eq('id', user.id)
      .single();

    // 4. Generate the AI Study Material via Groq
    const prompt = `Create a highly accurate ${type} for the subject ${subject} focusing on ${topic}. Tailor it for an advanced high school (ISC/JEE) level.`;
    
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }], //
      model: "llama3-8b-8192", 
    });

    const aiResponse = completion.choices[0]?.message?.content || "Generation failed.";

    // 5. Save the generated material to the database
    const { error: dbError } = await supabase
      .from('study_materials')
      .insert([
        { user_id: user.id, subject, topic, content: aiResponse }
      ]);

    if (dbError) {
      console.error("Database save error:", dbError);
    }

    return NextResponse.json({ success: true, data: aiResponse });

  } catch (error) {
    console.error("Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate material." }, { status: 500 });
  }
}
