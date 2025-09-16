// File: app/api/forum/replies/[replyId]/route.ts
// Secure, server-side endpoints for UPDATING and DELETING a single reply.

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Function to handle UPDATING a reply
export async function PATCH(request: Request, { params }: { params: { replyId: string } }) {
    const supabase = createClient();
    const { content } = await request.json();
    const replyId = params.replyId;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    if (!content) return NextResponse.json({ error: 'Content is required.' }, { status: 400 });

    const { error } = await supabase
        .from('replies')
        .update({ content: content, updated_at: new Date().toISOString() })
        .eq('id', replyId)
        .eq('author_id', user.id);

    if (error) {
        console.error("API Update Reply Error:", error);
        return NextResponse.json({ error: 'Failed to update reply.' }, { status: 500 });
    }
    return NextResponse.json({ message: 'Reply updated successfully.' });
}

// Function to handle DELETING a reply
export async function DELETE(request: Request, { params }: { params: { replyId: string } }) {
    const supabase = createClient();
    const replyId = params.replyId;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    const { error } = await supabase
        .from('replies')
        .delete()
        .eq('id', replyId)
        .eq('author_id', user.id);

    if (error) {
        console.error("API Delete Reply Error:", error);
        return NextResponse.json({ error: 'Failed to delete reply.' }, { status: 500 });
    }
    return NextResponse.json({ message: 'Reply deleted successfully.' });
}