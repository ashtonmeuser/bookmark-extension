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
