// Polyfill global for browser
if (typeof window !== 'undefined') {
  // Global object
  window.global = window as any;
  
  // Process
  (window as any).process = { 
    env: {},
    nextTick: (fn: Function) => setTimeout(fn, 0),
    version: '',
    versions: {},
    platform: 'browser'
  };
  
  // Buffer
  (window as any).Buffer = { 
    isBuffer: () => false,
    from: () => ({}),
    alloc: () => ({})
  };
  
  // Events module polyfill
  class EventEmitter {
    private events: Record<string, Function[]> = {};

    on(event: string, listener: Function) {
      if (!this.events[event]) {
        this.events[event] = [];
      }
      this.events[event].push(listener);
      return this;
    }

    emit(event: string, ...args: any[]) {
      if (!this.events[event]) return false;
      this.events[event].forEach(listener => listener(...args));
      return true;
    }

    removeListener(event: string, listener: Function) {
      if (!this.events[event]) return this;
      this.events[event] = this.events[event].filter(l => l !== listener);
      return this;
    }
  }
  
  // Add events module
  (window as any).events = {
    EventEmitter
  };
  
  // Util module polyfill
  (window as any).util = {
    debuglog: () => () => {},
    inspect: (obj: any) => JSON.stringify(obj),
    inherits: (ctor: any, superCtor: any) => {
      ctor.super_ = superCtor;
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
    }
  };
}

export {};