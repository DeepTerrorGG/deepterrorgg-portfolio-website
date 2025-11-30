
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getDatabase, ref, runTransaction, serverTimestamp, set } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';

let firebaseApp;
let db;
let isWorking = false;
let workerId;
let localWorkerId;
let displayName;
let completedCount = 0;

const MAX_ITERATIONS = 100;
const TILE_SIZE = 256;

// Function to draw the Mandelbrot set for a given tile
function drawMandelbrot(tileX, tileY, zoom) {
    const canvas = new OffscreenCanvas(TILE_SIZE, TILE_SIZE);
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(TILE_SIZE, TILE_SIZE);

    const startX = -2.0 / zoom + (tileX * TILE_SIZE) / (zoom * TILE_SIZE);
    const startY = -1.5 / zoom + (tileY * TILE_SIZE) / (zoom * TILE_SIZE);
    const step = 3.5 / (zoom * TILE_SIZE);

    for (let x = 0; x < TILE_SIZE; x++) {
        for (let y = 0; y < TILE_SIZE; y++) {
            const cx = startX + x * step;
            const cy = startY + y * step;
            let zx = 0;
            let zy = 0;
            let iter = 0;

            while (zx * zx + zy * zy < 4 && iter < MAX_ITERATIONS) {
                const xtemp = zx * zx - zy * zy + cx;
                zy = 2 * zx * zy + cy;
                zx = xtemp;
                iter++;
            }

            const pixelIndex = (y * TILE_SIZE + x) * 4;
            const color = iter === MAX_ITERATIONS ? 0 : 255 - (iter * 255 / MAX_ITERATIONS);
            imageData.data[pixelIndex] = color;
            imageData.data[pixelIndex + 1] = color;
            imageData.data[pixelIndex + 2] = color;
            imageData.data[pixelIndex + 3] = 255;
        }
    }
    ctx.putImageData(imageData, 0, 0);
    return canvas.convertToBlob().then(blob => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
    });
}

// Function to find and claim a job
async function findAndClaimJob() {
    if (!isWorking) return null;
    postMessage({ status: 'info', message: 'Searching for a job...', workerId });

    let claimedJob = null;

    try {
        const jobsRef = ref(db, 'fractal-jobs');
        const result = await runTransaction(jobsRef, (currentData) => {
            if (currentData) {
                const jobIds = Object.keys(currentData);
                const pendingJobId = jobIds.find(id => currentData[id].status === 'pending');
                if (pendingJobId) {
                    currentData[pendingJobId].status = 'claimed';
                    currentData[pendingJobId].claimedBy = localWorkerId;
                    currentData[pendingJobId].claimedAt = serverTimestamp();
                    claimedJob = { id: pendingJobId, ...currentData[pendingJobId] };
                    return currentData;
                }
            }
            return currentData; // No pending jobs or no data
        });

        if (result.committed && claimedJob) {
             postMessage({ status: 'info', message: `Claimed job ${claimedJob.id}`, workerId });
            return claimedJob;
        } else {
             postMessage({ status: 'info', message: 'No pending jobs found.', workerId });
            return null;
        }

    } catch (error) {
        postMessage({ status: 'error', error: `Transaction failed: ${error.message}`, workerId });
        return null;
    }
}


async function processJob() {
  if (!isWorking) return;
  const job = await findAndClaimJob();

  if (job) {
    postMessage({ status: 'working', message: `Rendering tile ${job.tileX}, ${job.tileY}`, workerId });
    try {
      const imageData = await drawMandelbrot(job.tileX, job.tileY, job.zoom);
      const tileId = `${job.zoom}-${job.tileX}-${job.tileY}`;
      
      const tileRef = ref(db, `fractal-tiles/${tileId}`);
      await set(tileRef, { imageData, createdAt: serverTimestamp() });
      
      const jobRef = ref(db, `fractal-jobs/${job.id}/status`);
      await set(jobRef, 'completed');
      
      const workerRef = ref(db, `fractal-workers/${localWorkerId}`);
      await runTransaction(workerRef, (currentData) => {
          if (currentData === null) {
              return { displayName: displayName, tilesCompleted: 1, createdAt: serverTimestamp() };
          } else {
              return { ...currentData, tilesCompleted: (currentData.tilesCompleted || 0) + 1 };
          }
      });

      completedCount++;
      postMessage({ status: 'completed', message: `Finished job ${job.id}. Total: ${completedCount}`, workerId });
      setTimeout(processJob, 100);

    } catch (error) {
      postMessage({ status: 'error', error: error.message, workerId });
      // Re-queue the job by setting status back to 'pending'
      const jobStatusRef = ref(db, `fractal-jobs/${job.id}/status`);
      await set(jobStatusRef, 'pending');
      setTimeout(processJob, 5000); // Wait before retrying
    }
  } else {
    // No jobs, wait and try again
    setTimeout(processJob, 5000);
  }
}

self.onmessage = async (e) => {
  const { type, workerId: assignedId, localWorkerId: assignedLocalId, displayName: assignedName } = e.data;
  
  if (type === 'init') {
    workerId = assignedId;
    localWorkerId = assignedLocalId;
    displayName = assignedName;
    
    // Fetch Firebase config to initialize the app
    const configResponse = await fetch('/__/firebase/init.json');
    const firebaseConfig = await configResponse.json();
    firebaseApp = initializeApp(firebaseConfig);
    db = getDatabase(firebaseApp);
    postMessage({ status: 'info', message: 'Worker initialized.', workerId });
  } else if (type === 'start') {
    if (!isWorking) {
        isWorking = true;
        postMessage({ status: 'info', message: 'Starting work...', workerId });
        processJob();
    }
  } else if (type === 'stop') {
    isWorking = false;
    postMessage({ status: 'info', message: 'Stopping work...', workerId });
  }
};
