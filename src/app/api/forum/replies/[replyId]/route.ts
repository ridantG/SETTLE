import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ replyId: string }> }
) {
  const { replyId } = await context.params;
  const supabase = createClient();
  const { content } = await request.json();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  if (!content) return NextResponse.json({ error: 'Content is required.' }, { status: 400 });

  const { error } = await supabase
    .from('replies')
    .update({ content, updated_at: new Date().toISOString() })
    .eq('id', replyId)
    .eq('author_id', user.id);

  if (error) return NextResponse.json({ error: 'Failed to update reply.' }, { status: 500 });

  return NextResponse.json({ message: 'Reply updated successfully.' });
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ replyId: string }> }
) {
  const { replyId } = await context.params;
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  const { error } = await supabase
    .from('replies')
    .delete()
    .eq('id', replyId)
    .eq('author_id', user.id);

  if (error) return NextResponse.json({ error: 'Failed to delete reply.' }, { status: 500 });

  return NextResponse.json({ message: 'Reply deleted successfully.' });
}
