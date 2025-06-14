import { exec, spawn, ChildProcess } from 'child_process';
import { promisify } from 'util';
import fetch from 'node-fetch';
import * as ps from 'ps-node';
import * as path from 'path';

const execAsync = promisify(exec);
const psLookup = promisify(ps.lookup);

let viteProcess: ChildProcess | null = null;
let currentPort: number | null = null;

async function findViteProcess(): Promise<number | null> {
  try {
    const processes = await psLookup({ command: 'node', arguments: /vite/ });
    return processes.length > 0 ? processes[0].pid : null;
  } catch (error) {
    console.error('Error finding Vite process:', error);
    return null;
  }
}

async function killProcess(pid: number): Promise<void> {
  return new Promise<void>(resolve => {
    ps.kill(pid, 'SIGTERM', () => resolve());
  });
}

async function waitForServerReady(url: string, timeout = 60000): Promise<boolean> {
  const startTime = Date.now();
  let lastError = '';

  console.info(`Waiting for server at ${url} to be ready...`);

  while (Date.now() - startTime < timeout) {
    try {
      const response = await fetch(url);
      const text = await response.text();

      // Check for multiple indicators of readiness
      const isReady =
        text.includes('<div id="root">') &&
        !text.includes('Upgrade Required') &&
        text.includes('</body>'); // Make sure we got the full HTML

      if (isReady) {
        console.info('Server is serving content successfully');
        // Add extra wait to ensure everything is loaded
        await new Promise(resolve => setTimeout(resolve, 2000));
        return true;
      }

      console.info('Server responded but waiting for full content...');
      // Shorter wait between checks
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      const errorMessage = error.message;
      if (errorMessage !== lastError) {
        console.info('Server check failed:', errorMessage);
        lastError = errorMessage;
      }
      // Shorter wait on error
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  console.info('Server readiness check timed out after', timeout, 'ms');
  return false;
}

function extractPortFromViteOutput(output: string): number | null {
  // Match patterns like "Local: http://localhost:5173/" or "➜  Local:   http://localhost:5174/"
  const portMatch = output.match(/localhost:(\d+)/);
  if (portMatch) {
    return parseInt(portMatch[1], 10);
  }
  return null;
}

async function startViteServer(): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    try {
      console.info('Starting new Vite process...');
      const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

      viteProcess = spawn(npmCommand, ['run', 'dev'], {
        stdio: ['ignore', 'pipe', 'pipe'],
        detached: false,
        env: {
          ...process.env,
          FORCE_COLOR: 'true', // Enable colored output
          NODE_ENV: 'development',
        },
      });

      let output = '';
      let readyTimeout: NodeJS.Timeout;

      viteProcess.stdout?.on('data', (data: Buffer) => {
        const chunk = data.toString();
        output += chunk;
        console.info('Vite output:', chunk);

        // Extract port from Vite output
        const port = extractPortFromViteOutput(chunk);
        if (port) {
          console.info(`Detected Vite running on port ${port}`);
          currentPort = port;
          process.env.PLAYWRIGHT_TEST_BASE_URL = `http://localhost:${port}`;
        }

        // Clear existing timeout if any
        if (readyTimeout) {
          clearTimeout(readyTimeout);
        }

        // Check for Vite ready message
        if (output.includes('VITE') && output.includes('ready')) {
          console.info('Vite ready message detected');
          // Wait a bit after ready message before resolving
          readyTimeout = setTimeout(() => {
            resolve();
          }, 2000);
        }
      });

      viteProcess.stderr?.on('data', (data: Buffer) => {
        console.error('Vite error:', data.toString());
      });

      viteProcess.on('error', err => {
        console.error('Failed to start Vite:', err);
        reject(err);
      });

      // Increase the overall timeout
      setTimeout(() => {
        resolve();
      }, 30000);
    } catch (error) {
      console.error('Error in startViteServer:', error);
      reject(error);
    }
  });
}

async function getCurrentBaseUrl(): Promise<string> {
  if (currentPort) {
    return `http://localhost:${currentPort}`;
  }
  return process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:5173';
}

async function restartDevServer(): Promise<void> {
  try {
    console.info('Attempting to stop existing Vite process...');

    // Kill existing process if we have one
    if (viteProcess) {
      console.info('Killing tracked Vite process');
      viteProcess.kill();
      viteProcess = null;
    }

    // Also try to find and kill any other Vite processes
    const pid = await findViteProcess();
    if (pid) {
      console.info(`Found additional Vite process (PID: ${pid}), stopping it...`);
      await killProcess(pid);
    }

    // Wait for processes to stop
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Clean Vite cache
    console.info('Cleaning Vite cache...');
    const cachePath = path.join(process.cwd(), 'node_modules', '.vite');
    try {
      await execAsync(`rm -rf "${cachePath}"`);
    } catch (error) {
      console.info('Cache cleanup failed, continuing anyway:', error.message);
    }

    // Start new server
    await startViteServer();

    // Wait for server to be ready using the current port
    const baseUrl = await getCurrentBaseUrl();
    console.info(`Checking server readiness at ${baseUrl}`);
    const isReady = await waitForServerReady(baseUrl);

    if (!isReady) {
      throw new Error('Server failed to serve content within timeout');
    }

    console.info('Dev server restart completed successfully');
  } catch (error) {
    console.error('Error during server restart:', error);
    throw error;
  }
}

export async function waitForServer(url: string, maxAttempts = 3): Promise<boolean> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      // Use the current port
      const currentUrl = await getCurrentBaseUrl();
      console.info(`Checking server (attempt ${attempt + 1}/${maxAttempts}) at ${currentUrl}...`);

      const response = await fetch(currentUrl);
      const text = await response.text();

      if (text.includes('Upgrade Required') || !text.includes('<div id="root">')) {
        console.info('Server needs restart...');
        await restartDevServer();
        continue;
      }

      console.info('Server is responding normally with expected content');
      return true;
    } catch (error) {
      console.info(`Server check failed:`, error.message);
      await restartDevServer();
    }
  }

  throw new Error(`Server failed to start after ${maxAttempts} attempts`);
}

// Clean up on process exit
process.on('exit', () => {
  if (viteProcess) {
    viteProcess.kill();
  }
});
