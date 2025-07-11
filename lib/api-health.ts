// API health check and configuration validation utilities

export interface APIStatus {
  connected: boolean;
  configured: boolean;
  endpoint?: string;
  error?: string;
}

export class APIHealthCheck {
  static async checkAlleAIConnection(): Promise<APIStatus> {
    try {
      const response = await fetch('/api/health/alle-ai', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      return result;
    } catch (error) {
      return {
        connected: false,
        configured: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
