interface EventEmitter {
  on(event: string, listener: Function): EventEmitter;
  emit(event: string, ...args: any[]): boolean;
  removeListener(event: string, listener: Function): EventEmitter;
}

interface Window {
  global: Window;
  process: {
    env: Record<string, string>;
    nextTick: (fn: Function) => void;
    version: string;
    versions: Record<string, string>;
    platform: string;
  };
  Buffer: {
    isBuffer: (obj: any) => boolean;
    from: (...args: any[]) => any;
    alloc: (...args: any[]) => any;
  };
  events: {
    EventEmitter: new () => EventEmitter;
  };
  util: {
    debuglog: (section: string) => (...args: any[]) => void;
    inspect: (obj: any) => string;
    inherits: (ctor: any, superCtor: any) => void;
  };
}