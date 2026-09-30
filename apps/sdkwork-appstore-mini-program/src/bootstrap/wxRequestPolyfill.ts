/**
 * WeChat mini-program fetch adapter.
 *
 * The generated app SDK issues standard `fetch` / `AbortController` calls
 * (sdk-common base-client). The WeChat runtime provides neither global, so
 * the bootstrap installs this adapter before any SDK client can dispatch.
 * Only the surface the generated client consumes is simulated: `ok`,
 * `status`, `statusText`, `json()`, `text()`, and case-insensitive
 * `headers.get()`.
 */
type WxRequestOptions = {
  url: string;
  method: string;
  data?: unknown;
  header?: Record<string, string>;
  success?: (result: { statusCode: number; data: unknown; header?: Record<string, unknown> }) => void;
  fail?: (error: { errMsg?: string }) => void;
};

type WxRequestTask = { abort: () => void };

declare const wx: {
  request: (options: WxRequestOptions) => WxRequestTask;
  showToast?: (options: { title: string; icon?: string }) => void;
};

class WxAbortSignal {
  aborted = false;
  private readonly listeners: Array<() => void> = [];

  addEventListener(_type: 'abort', handler: () => void): void {
    this.listeners.push(handler);
  }

  removeEventListener(_type: 'abort', handler: () => void): void {
    const index = this.listeners.indexOf(handler);
    if (index >= 0) {
      this.listeners.splice(index, 1);
    }
  }

  fire(): void {
    this.aborted = true;
    for (const handler of this.listeners.splice(0)) {
      handler();
    }
  }
}

class WxAbortController {
  signal = new WxAbortSignal();

  abort(): void {
    this.signal.fire();
  }
}

class WxAbortError extends Error {
  name = 'AbortError';

  constructor(message: string) {
    super(message);
  }
}

function normalizeHeaderName(name: string): string {
  return name.toLowerCase();
}

function toHeaders(raw: Record<string, unknown> | undefined): {
  get: (name: string) => string | null;
} {
  const map = new Map<string, string>();
  for (const [name, value] of Object.entries(raw ?? {})) {
    map.set(normalizeHeaderName(name), String(value));
  }
  return {
    get: (name: string) => map.get(normalizeHeaderName(name)) ?? null,
  };
}

function toWxMethod(method: string): string {
  return method.toUpperCase();
}

function installWxFetch(): void {
  const globalScope = globalThis as {
    fetch?: unknown;
    AbortController?: unknown;
    AbortSignal?: unknown;
  };

  if (typeof globalScope.fetch === 'function' && typeof globalScope.AbortController === 'function') {
    return;
  }

  if (typeof globalScope.AbortController !== 'function') {
    globalScope.AbortController = WxAbortController;
  }
  if (typeof globalScope.AbortSignal !== 'function') {
    globalScope.AbortSignal = WxAbortSignal;
  }

  globalScope.fetch = ((
    url: string,
    options: {
      method?: string;
      headers?: Record<string, string>;
      body?: unknown;
      signal?: WxAbortSignal;
    } = {},
  ): Promise<{
    ok: boolean;
    status: number;
    statusText: string;
    headers: { get: (name: string) => string | null };
    json: () => Promise<unknown>;
    text: () => Promise<string>;
  }> => {
    return new Promise((resolve, reject) => {
      if (options.signal?.aborted) {
        reject(new WxAbortError('The operation was aborted'));
        return;
      }
      const abortHandler = () => {
        task?.abort();
        reject(new WxAbortError('The operation was aborted'));
      };
      options.signal?.addEventListener('abort', abortHandler);

      const task = wx.request({
        url: String(url),
        method: toWxMethod(options.method ?? 'GET'),
        data: options.body,
        header: options.headers,
        success: (result) => {
          options.signal?.removeEventListener('abort', abortHandler);
          const rawHeader = result.header ?? {};
          const bodyText =
            typeof result.data === 'string' ? result.data : JSON.stringify(result.data);
          resolve({
            ok: result.statusCode >= 200 && result.statusCode < 300,
            status: result.statusCode,
            statusText: '',
            headers: toHeaders(rawHeader),
            json: async () => (typeof result.data === 'string' ? JSON.parse(result.data) : result.data),
            text: async () => bodyText,
          });
        },
        fail: (error) => {
          options.signal?.removeEventListener('abort', abortHandler);
          reject(new TypeError(error?.errMsg ?? 'wx.request failed'));
        },
      });
    });
  });
}

export { installWxFetch };
