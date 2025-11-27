
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

type LogLevel = 'info' | 'warn' | 'error';
type LogMessage = {
    id: string;
    level: LogLevel;
    msg: string;
    timestamp: number;
};

// --- In-memory, non-persistent "database" and "queue" for demonstration ---
let logQueue: Omit<LogMessage, 'id'>[] = [];
let processedLogs: LogMessage[] = [];
let isWorkerRunning = true;
let workerInterval: NodeJS.Timeout | null = null;
const MAX_PROCESSED_LOGS = 500; // Keep memory usage in check

// The "Worker" logic
const processLogQueue = () => {
    if (!isWorkerRunning) return;

    const batchSize = 100; // Process up to 100 logs at a time
    const batch = logQueue.splice(0, batchSize);

    if (batch.length > 0) {
        const newProcessedLogs: LogMessage[] = batch.map(log => ({ ...log, id: uuidv4() }));
        processedLogs = [...newProcessedLogs, ...processedLogs].slice(0, MAX_PROCESSED_LOGS);
    }
};

// Start the worker immediately on server startup
if (!workerInterval) {
    workerInterval = setInterval(processLogQueue, 1000);
}

// --- API Route Handlers ---

// POST /api/log: Ingest new logs
export async function POST(request: Request) {
    try {
        const log = await request.json();
        if (!log.level || !log.msg) {
            return NextResponse.json({ error: 'Invalid log message format' }, { status: 400 });
        }
        
        const newLogEntry = {
            level: log.level,
            msg: log.msg,
            timestamp: Date.now(),
        };

        logQueue.push(newLogEntry);

        return NextResponse.json({ success: true, queueSize: logQueue.length });
    } catch (error) {
        console.error("Ingest error:", error);
        return NextResponse.json({ error: 'Failed to process log' }, { status: 500 });
    }
}

// GET /api/log: Dashboard polling endpoint
export async function GET() {
    // Return the latest processed logs and the current queue size
    return NextResponse.json({
        logs: processedLogs.slice(0, 50), // Return latest 50 for the dashboard
        queueSize: logQueue.length,
        isWorkerRunning,
    });
}
