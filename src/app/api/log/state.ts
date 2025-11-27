
// This file acts as a shared memory/state for our server-side simulation.
// In a real-world serverless environment, this is NOT a reliable way to share state
// between different function invocations. You would use a database or a service like Redis.
// For this self-contained demo, it works.

type LogLevel = 'info' | 'warn' | 'error';
export type LogMessage = {
    id: string;
    level: LogLevel;
    msg: string;
    timestamp: number;
};

let logQueue: Omit<LogMessage, 'id'>[] = [];
let processedLogs: LogMessage[] = [];
let isWorkerRunning = true;
let workerInterval: NodeJS.Timeout | null = null;
const MAX_PROCESSED_LOGS = 500;

const processLogQueue = () => {
    if (!isWorkerRunning) return;

    const batchSize = 100;
    const batch = logQueue.splice(0, batchSize);

    if (batch.length > 0) {
        const newProcessedLogs: LogMessage[] = batch.map(log => ({ ...log, id: Math.random().toString(36).substring(2, 11) }));
        processedLogs = [...newProcessedLogs, ...processedLogs].slice(0, MAX_PROCESSED_LOGS);
    }
};

const startWorker = () => {
    if (!workerInterval) {
        workerInterval = setInterval(processLogQueue, 1000);
    }
};

startWorker(); // Start on module load

export const workerControl = {
    getQueue: () => logQueue,
    getProcessedLogs: () => processedLogs,
    addToQueue: (log: Omit<LogMessage, 'id'>) => {
        logQueue.push(log);
    },
    setRunning: (running: boolean) => {
        isWorkerRunning = running;
    },
    isRunning: () => isWorkerRunning,
    reset: () => {
        logQueue = [];
        processedLogs = [];
        isWorkerRunning = true;
    }
};
