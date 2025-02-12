import { browser, node } from './utils';

const createBookmarkNodes = (bookmarks: Bookmark[]): BookmarkNode[] => {
  return bookmarks.map(bookmark => ({
    ...bookmark,
    node: node(`<li><a href="${bookmark.url}">${bookmark.title}</a></li>`) as HTMLElement,
  }))
};

export default class App {
  private bookmarks: BookmarkNode[];
  private _query?: string;
  private _index: number = 0;
  private _callback?: (app: App) => void;

  constructor(bookmarks: Bookmark[], callback?: (app: App) => void) {
    this.bookmarks = createBookmarkNodes(bookmarks);
    this._callback = callback;
    this._updateActive();
    this._callback?.(this);
  }

  get filtered(): BookmarkNode[] {
    return this._query ? this.bookmarks.filter(bookmark => bookmark.title.toLowerCase().includes(this._query!.toLowerCase())) : this.bookmarks;
  }

  get nodes(): HTMLElement[] {
    return this.filtered.map(bookmark => bookmark.node);
  }

  set query(query: string | undefined) {
    this.index = 0;
    this._query = query;
    this._callback?.(this);
  }

  set index(index: number) {
    this._index = index;
    this._updateActive();
    // this.filtered[this._index]?.node.querySelector('a')?.focus();
  }

  next() {
    this.index = (this._index + 1) % this.filtered.length;
  }

  prev() {
    this.index = (this._index - 1) % this.filtered.length;
  }

  async select(target: Navigation['target'] = '_self') {
    const url = this.filtered[this._index]?.url;
    if (!url) return;
    // await browser.runtime.sendMessage({ url, target });
    window.open(url, target);
    // const event = new MouseEvent('click', {
    //   bubbles: true,
    //   cancelable: true,
    //   view: window,
    // });
    // this.filtered[this._index]?.node.querySelector('a')?.dispatchEvent(event);
  }

  private _updateActive() {
    this.bookmarks.forEach((bookmark, index) => bookmark.node.classList.toggle('active', index === this._index));
  }
}
