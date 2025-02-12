import { browser, node } from './utils';

const createBookmarkNodes = (bookmarks: Bookmark[]): BookmarkNode[] => {
  return bookmarks.map(bookmark => ({
    ...bookmark,
    node: node(`<li><a href="${bookmark.url}">${bookmark.title}</a></li>`) as HTMLElement,
  }))
};

const mod = (i: number, n: number): number => ((i % n) + n) % n;

export default class App extends EventTarget {
  private _bookmarks: Set<BookmarkNode>;
  private _query?: string;
  private _index: number = 0;

  constructor(bookmarks: Bookmark[]) {
    super();
    this._bookmarks = new Set(createBookmarkNodes(bookmarks));
    this._updateActive();
    this.addEventListener('updateselection', () => {
      this.bookmarks.forEach((bookmark, index) => bookmark.node.classList.toggle('active', index === this._index));
    });
  }

  get bookmarks(): BookmarkNode[] {
    return this._query ? [...this._bookmarks].filter(bookmark => bookmark.title.toLowerCase().includes(this._query!.toLowerCase())) : [...this._bookmarks];
  }

  get nodes(): HTMLElement[] {
    return this.bookmarks.map(bookmark => bookmark.node);
  }

  get selection(): BookmarkNode | undefined {
    return this.bookmarks[this._index];
  }

  set query(query: string | undefined) {
    this.index = 0;
    this._query = query;
    // this._updateActive();
    this.dispatchEvent(new Event('updatelist'));
    this.dispatchEvent(new Event('updateselection'));
  }

  get index(): number {
    return this._index;
  }

  set index(index: number) {
    this._index = index;
    // this._updateActive();
    this.dispatchEvent(new Event('updateselection'));
  }

  next() {
    this.index = mod(this._index + 1, this.bookmarks.length);
  }

  prev() {
    this.index = mod(this._index - 1, this.bookmarks.length);
  }

  private _updateActive() {
    this.bookmarks.forEach((bookmark, index) => bookmark.node.classList.toggle('active', index === this._index));
  }
}
