export type Bookmark = {
  id: string;
  title: string;
  path: string | undefined;
  url: string;
};

// Modular arithmetic accounting for negative numbers
export const mod = (i: number, n: number): number => ((i % n) + n) % n;

// @ts-expect-error: Browser-agnostic browser interface
export const browser = globalThis.browser ?? globalThis.chrome;

// Utility function to create DOM nodes
export const node = (v: Node | string): Node => typeof v === 'string' ? document.createRange().createContextualFragment(v).firstChild! : v;

// Getter & setter for stored settings
export const settings = {
  async get(key: string) {
    return browser.storage.sync.get(key);
  },
  async set(key: string, value: any) {
    await browser.storage.sync.set({ [key]: value });
  },
};
