import { supabase } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { id, category } = await request.json();
    if (!id || !category) {
      return NextResponse.json({ success: false, message: 'Missing id or category' }, { status: 400 });
    }
    const { error } = await supabase
      .from('speaker_requests')
      .update({ category })
      .eq('id', id);
    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, message: 'Category updated' });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message || 'Unknown error' }, { status: 500 });
  }
}
