export type Bookmark = {
  id: string;
  title: string;
  path: string | undefined;
  url: string;
  bookmarklet: boolean;
};

export type Settings = {
  filter: 'all' | 'bookmarks' | 'bookmarklets';
  dark: boolean;
  animate: boolean;
};

// Theme colors
export const theme = { light: '#f9fafb', dark: '#262626' };

// Modular arithmetic accounting for negative numbers
export const mod = (i: number, n: number): number => ((i % n) + n) % n;

// @ts-expect-error: Browser-agnostic browser interface
export const browser = globalThis.browser ?? globalThis.chrome;

// Utility function to create DOM nodes
export const node = (v: Node | string): Node => typeof v === 'string' ? document.createRange().createContextualFragment(v).firstChild! : v;

// Getter & setter for stored settings
export const settings = {
  async get(key?: keyof Settings) {
    if (!key) return await browser.storage.sync.get();
    return (await browser.storage.sync.get(key))[key];
  },
  async set(key: keyof Settings, value: any) {
    await browser.storage.sync.set({ [key]: value });
  },
};
