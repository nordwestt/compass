import { logsAtom } from '@/hooks/atoms';
import { getDefaultStore, useAtom } from 'jotai';

type LogLevel = 'error' | 'info' | 'warn' | 'debug';

class LogService {
  static async log(
    message: string | Error,
    context: { component: string; function: string },
    level: LogLevel = 'error'
  ) {
    const store = getDefaultStore();
    const logs = await store.get(logsAtom);
    
    if (!Array.isArray(logs)) {
        throw new Error('logsAtom must return an array');
    }

    const logEntry = {
      level,
      component: context.component,
      function: context.function,
      date: new Date().toISOString(),
      message: message instanceof Error ? message.message : message,
    };

    store.set(logsAtom, [...logs, logEntry]);
    
    // Also log to console for development
    console[level](`[${context.component}:${context.function}]`, message);
  }
}

export default LogService; 