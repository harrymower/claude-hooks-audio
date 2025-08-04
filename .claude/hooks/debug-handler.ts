#!/usr/bin/env tsx

import { readFileSync, appendFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Log the raw event Claude sends
try {
  const input = readFileSync(0, 'utf-8').trim();
  const timestamp = new Date().toISOString();
  const logPath = join(__dirname, 'debug-events.log');
  
  appendFileSync(logPath, `\n=== ${timestamp} ===\n${input}\n`);
  
  // Try to parse and log structured
  try {
    const parsed = JSON.parse(input);
    appendFileSync(logPath, `Parsed: ${JSON.stringify(parsed, null, 2)}\n`);
  } catch (e) {
    appendFileSync(logPath, `Parse error: ${e}\n`);
  }
  
  console.log('Event logged to debug-events.log');
} catch (error) {
  console.error('Debug handler error:', error);
}