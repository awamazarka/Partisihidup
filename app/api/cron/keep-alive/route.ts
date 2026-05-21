import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Verify that the request is coming from Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const supabase = await createClient();
    
    // Perform a very lightweight query to keep the project active
    const { error } = await supabase.from('inventory').select('id').limit(1);

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      message: 'Supabase heartbeat sent successfully',
      timestamp: new Date().toISOString() 
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
