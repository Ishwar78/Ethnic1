#!/usr/bin/env node
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🚀 Starting Vasstra Development Servers...\n');

// Start frontend server
console.log('📱 Starting Frontend Server (Vite)...');
const frontend = spawn('npm', ['run', 'dev:frontend'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

// Give frontend a moment to start, then start backend
setTimeout(() => {
  console.log('\n🔌 Starting Backend Server (Express)...');
  const backend = spawn('npm', ['run', 'dev:backend'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true
  });

  backend.on('error', (err) => {
    console.error('❌ Backend server error:', err);
  });

  backend.on('exit', (code) => {
    if (code !== 0) {
      console.error(`❌ Backend server exited with code ${code}`);
    }
  });
}, 2000);

frontend.on('error', (err) => {
  console.error('❌ Frontend server error:', err);
});

frontend.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ Frontend server exited with code ${code}`);
  }
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down servers...');
  frontend.kill('SIGINT');
  backend?.kill('SIGINT');
  process.exit(0);
});
