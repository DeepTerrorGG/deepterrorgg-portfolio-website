
import { NextResponse } from 'next/server';
import { workerControl } from '../state';

export async function POST(request: Request) {
    try {
        workerControl.reset();
        return NextResponse.json({ success: true, message: "System reset." });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to reset system' }, { status: 500 });
    }
}
