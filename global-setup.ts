import { FullConfig } from '@playwright/test';
import { exec } from 'child_process';
import { promisify } from 'util';
import fetch from 'node-fetch';

const execAsync = promisify(exec);

async function waitForServer(url: string, maxAttempts = 3): Promise<boolean> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await fetch(url);
      const text = await response.text();
      
      // Check for "Upgrade Required" error
      if (text.includes('Upgrade Required')) {
        console.log('Detected Vite upgrade required error, restarting server...');
        await restartDevServer();
        // Wait a bit for the server to restart
        await new Promise(resolve => setTimeout(resolve, 5000));
        continue;
      }
      
      return true;
    } catch (error) {
      console.log(`Server check attempt ${attempt + 1} failed:`, error.message);
      if (attempt === maxAttempts - 1) {
        throw new Error(`Server failed to start after ${maxAttempts} attempts`);
      }
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  return false;
}

async function restartDevServer() {
  try {
    // Kill any existing Vite processes
    if (process.platform === 'win32') {
      await execAsync('taskkill /F /IM node.exe /T');
    } else {
      await execAsync('pkill -f vite');
    }
    
    // Clean Vite cache
    await execAsync('rm -rf node_modules/.vite');
    
    // Optional: Clear npm cache and reinstall dependencies
    // await execAsync('npm cache clean --force');
    // await execAsync('npm install');
    
    console.log('Dev server restarted successfully');
  } catch (error) {
    console.error('Error restarting dev server:', error);
  }
}

async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0].use.baseURL as string;
  
  try {
    // Wait for server with retry mechanism
    await waitForServer(baseURL);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

export default globalSetup;