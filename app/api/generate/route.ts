import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { createClient } from '@supabase/supabase-js';
import { createClientServer } from '@/utils/supabase';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const supabaseSession = await createClientServer();
    const { data: { user } } = await supabaseSession.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const { subject, outputType } = await req.json();

    const prompt = `
      You are an expert academic tutor. The user needs a ${outputType} for the subject: ${subject}. 
      Ensure the output is highly accurate, formatted beautifully in Markdown, and directly addresses standard syllabus requirements. 
      Do not include conversational filler; go straight to the educational material.
    `;

    let generatedContent = '';
    try {
      const response = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
      });
      generatedContent = response.choices[0]?.message?.content || '';
    } catch (aiError: any) {
      console.error('Groq API Error:', aiError);
      if (aiError.status === 429) {
        return NextResponse.json({ error: 'Free tier limit reached. Please wait or upgrade.' }, { status: 429 });
      }
      throw aiError;
    }

    const { data, error } = await supabaseAdmin
      .from('study_materials')
      .insert([{ user_id: user.id, subject, output_type, content: generatedContent }])
      .select();

    if (error) throw error;

    return NextResponse.json({ result: generatedContent, record: data[0] });

  } catch (error) {
    console.error('Generation Error:', error);
    return NextResponse.json({ error: 'Failed to generate material.' }, { status: 500 });
  }
}
