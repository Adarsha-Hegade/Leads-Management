import { Lead } from '../types/lead';

// Debug levels
export const DEBUG_LEVELS = {
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  DB: 'DB',
} as const;

type DebugLevel = typeof DEBUG_LEVELS[keyof typeof DEBUG_LEVELS];

// Enable debug mode in development
const isDebugMode = import.meta.env.DEV;

export function debugLog(level: DebugLevel, message: string, data?: any) {
  if (!isDebugMode) return;

  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}`;

  switch (level) {
    case DEBUG_LEVELS.ERROR:
      console.error(logMessage, data);
      break;
    case DEBUG_LEVELS.WARN:
      console.warn(logMessage, data);
      break;
    case DEBUG_LEVELS.DB:
      console.log('%c🗄 ' + logMessage, 'color: #9333ea', data);
      break;
    default:
      console.log(logMessage, data);
  }
}