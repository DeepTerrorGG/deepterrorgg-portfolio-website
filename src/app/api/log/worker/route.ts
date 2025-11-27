
import { NextResponse } from 'next/server';

// This is a placeholder for a real implementation that would control a separate worker process.
// In this simulation, we'll just modify the flag in the main log route's scope.
// This is NOT a robust way to handle this in production.

// This is a simple flag that will be imported and used by the main log route.
// It's a hack for this self-contained demo.
import { workerControl } from '../state';

export async function POST(request: Request) {
    try {
        const { running } = await request.json();
        if (typeof running !== 'boolean') {
             return NextResponse.json({ error: 'Invalid "running" status' }, { status: 400 });
        }
        workerControl.setRunning(running);
        return NextResponse.json({ success: true, workerRunning: running });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update worker status' }, { status: 500 });
    }
}
