import { logsAtom } from '@/src/hooks/atoms';
import { getDefaultStore, useAtom } from 'jotai';
import { APICallError } from 'ai';
import {toastService} from '@/src/services/toastService';

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

    let msg = "";

    if(message instanceof Error) {
      msg = JSON.stringify({message: message.message, stack: message.stack?.slice(0,150), cause: message.cause});
    } else {
      msg = message;
    }

    const logEntry = {
      level,
      component: context.component,
      function: context.function,
      date: new Date().toISOString(),
      message: msg,
    };

    store.set(logsAtom, [...logs, logEntry]);
    
    
    // Also log to console for development
    console[level](`[${context.component}:${context.function}]`, message);

    
    if (APICallError.isInstance(message)) {
      console.log("APICallError");
      console.log(message.url);
      console.log(message.requestBodyValues)
      console.log(message.statusCode);
      console.log(message.responseBody);
      console.log(message.responseBody);
      console.log(message.data);
    }
  }
}

export default LogService; 