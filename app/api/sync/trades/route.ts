import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const cookieStore = cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
  
  try {
    const body = await request.json();
    const { accountId, trades } = body;
    
    // Verify user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify account belongs to user
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('id')
      .eq('id', accountId)
      .eq('user_id', user.id)
      .single();
    
    if (accountError || !account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }
    
    // Upsert trades
    const tradesToUpsert = trades.map((t: any) => ({
      account_id: accountId,
      ticket: t.ticket?.toString(),
      symbol: t.symbol,
      side: t.side?.toLowerCase(),
      open_time: t.openTime ? new Date(t.openTime).toISOString() : null,
      close_time: t.closeTime ? new Date(t.closeTime).toISOString() : null,
      lots: parseFloat(t.lots) || 0,
      profit: parseFloat(t.profit) || 0,
      notes: null,
      rating: null,
      mistakes: null,
      setup_tags: null,
      r_multiple: null,
    }));
    
    const { data, error } = await supabase
      .from('trades')
      .upsert(tradesToUpsert, { onConflict: 'ticket' });
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      synced: trades.length 
    });
    
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}