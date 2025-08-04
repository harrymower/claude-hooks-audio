#!/usr/bin/env tsx

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface Activity {
  timestamp: Date;
  tool: string;
  description: string;
  details?: any;
}

interface ActivityLog {
  session_id: string;
  activities: Activity[];
  lastUpdate: Date;
}

class ActivityTracker {
  private logPath: string;
  private maxActivities = 10;
  private sessionTimeout = 30 * 60 * 1000; // 30 minutes

  constructor() {
    this.logPath = join(__dirname, 'activity-log.json');
  }

  private loadLog(): Record<string, ActivityLog> {
    try {
      if (existsSync(this.logPath)) {
        const data = readFileSync(this.logPath, 'utf-8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading activity log:', error);
    }
    return {};
  }

  private saveLog(log: Record<string, ActivityLog>) {
    try {
      writeFileSync(this.logPath, JSON.stringify(log, null, 2));
    } catch (error) {
      console.error('Error saving activity log:', error);
    }
  }

  private cleanOldSessions(log: Record<string, ActivityLog>) {
    const now = new Date().getTime();
    for (const sessionId in log) {
      const lastUpdate = new Date(log[sessionId].lastUpdate).getTime();
      if (now - lastUpdate > this.sessionTimeout) {
        delete log[sessionId];
      }
    }
  }

  public trackActivity(sessionId: string, tool: string, params: any) {
    const log = this.loadLog();
    this.cleanOldSessions(log);

    if (!log[sessionId]) {
      log[sessionId] = {
        session_id: sessionId,
        activities: [],
        lastUpdate: new Date()
      };
    }

    const activity: Activity = {
      timestamp: new Date(),
      tool: tool,
      description: this.generateDescription(tool, params),
      details: params
    };

    log[sessionId].activities.push(activity);
    log[sessionId].lastUpdate = new Date();

    // Keep only the last N activities
    if (log[sessionId].activities.length > this.maxActivities) {
      log[sessionId].activities = log[sessionId].activities.slice(-this.maxActivities);
    }

    this.saveLog(log);
  }

  private generateDescription(tool: string, params: any): string {
    const getFileName = (path: string) => path ? path.split(/[/\\]/).pop() : 'file';
    
    switch (tool) {
      case 'Read':
        return `Read ${getFileName(params.file_path)}`;
      case 'Write':
        return `Created ${getFileName(params.file_path)}`;
      case 'Edit':
        return `Edited ${getFileName(params.file_path)}`;
      case 'MultiEdit':
        return `Edited ${getFileName(params.file_path)}`;
      case 'Bash':
        const cmd = params.command || 'command';
        // Extract just the command name (first word)
        const cmdName = cmd.trim().split(/\s+/)[0];
        // Use the description if provided, otherwise show command
        const description = params.description || `Ran ${cmdName}`;
        return description;
      case 'TodoWrite':
        return `Updated todo list`;
      case 'Grep':
        return `Searched for "${params.pattern || 'pattern'}"`;
      case 'LS':
        return `Listed ${getFileName(params.path)}`;
      case 'WebFetch':
        return `Fetched ${params.url || 'URL'}`;
      case 'WebSearch':
        return `Searched: "${params.query || 'query'}"`;
      default:
        return `Used ${tool}`;
    }
  }

  public getRecentActivities(sessionId: string, count: number = 3): Activity[] {
    const log = this.loadLog();
    const session = log[sessionId];
    
    if (!session || session.activities.length === 0) {
      return [];
    }

    return session.activities.slice(-count);
  }

  public getSummary(sessionId: string): string {
    const activities = this.getRecentActivities(sessionId, 5);
    
    if (activities.length === 0) {
      return "Completed task";
    }

    // Get unique tools used
    const tools = [...new Set(activities.map(a => a.tool))];
    
    // Generate a summary based on the activities
    if (tools.includes('Write') || tools.includes('Edit') || tools.includes('MultiEdit')) {
      const fileActivities = activities.filter(a => ['Write', 'Edit', 'MultiEdit'].includes(a.tool));
      const files = fileActivities.map(a => a.details?.file_path).filter(Boolean);
      const uniqueFiles = [...new Set(files)].map(f => f.split('/').pop()).slice(0, 2);
      return `Updated ${uniqueFiles.join(', ')}`;
    }
    
    if (tools.includes('Bash')) {
      return "Executed commands";
    }
    
    if (tools.includes('Read') || tools.includes('Grep')) {
      return "Analyzed code";
    }

    // Default summary
    return activities[activities.length - 1].description;
  }
}

// Main execution
async function main() {
  try {
    const input = readFileSync(0, 'utf-8').trim();
    if (!input) {
      process.exit(0);
    }

    const event = JSON.parse(input);
    
    if (event.hook_event_name === 'PreToolUse' && event.tool_name) {
      const tracker = new ActivityTracker();
      tracker.trackActivity(event.session_id, event.tool_name, event.tool_input);
    }
    
    // Always approve
    console.log(JSON.stringify({ decision: 'approve' }));
  } catch (error) {
    // Silent fail - don't interfere with hooks
    console.log(JSON.stringify({ decision: 'approve' }));
  }
}

main();