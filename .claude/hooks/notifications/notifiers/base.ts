export interface HookEvent {
  hook_event_name: string;
  session_id?: string;
  transcript_path?: string;
  cwd?: string;
  tool_name?: string;
  tool_input?: any;
  notification?: {
    type: string;
    message: string;
  };
}

export interface NotifierConfig {
  enabled: boolean;
  [key: string]: any;
}

export interface NotificationContext {
  event: HookEvent;
  config: NotifierConfig;
  projectRoot: string;
}

export abstract class BaseNotifier {
  protected name: string;
  protected config: NotifierConfig;

  constructor(name: string, config: NotifierConfig) {
    this.name = name;
    this.config = config;
  }

  isEnabled(): boolean {
    return this.config.enabled === true;
  }

  abstract notify(context: NotificationContext): Promise<void>;

  protected log(message: string): void {
    console.error(`[${this.name}] ${message}`);
  }

  protected logError(error: any): void {
    console.error(`[${this.name}] Error:`, error.message || error);
  }
}