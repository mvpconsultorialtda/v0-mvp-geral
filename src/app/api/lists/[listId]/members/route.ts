
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { firestore } from '@/lib/firebase-admin.server';
import { auth } from '@/lib/firebase-admin.server';

const addMemberSchema = z.object({
    email: z.string().email(),
    role: z.enum(['editor', 'viewer'])
});

export async function POST(req: Request, { params }: { params: { listId: string } }) {
    try {
        const { listId } = params;
        const body = await req.json();
        const { email, role } = addMemberSchema.parse(body);

        const user = await auth.getUserByEmail(email);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const listRef = firestore.collection('lists').doc(listId);
        await listRef.update({
            [`members.${user.uid}`]: role
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error(error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
}
