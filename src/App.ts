import { node, Bookmark, mod } from './utils';

type BookmarkNode = Bookmark & { node: HTMLElement };
type AppEvent = 'updatelist' | 'updateselection' | 'bookmarkclick';

export default class App extends EventTarget {
  private _bookmarks: Set<BookmarkNode>;
  private _query?: string;
  private _index: number = 0;

  constructor(bookmarks: Bookmark[]) {
    super();
    this._bookmarks = this._initializeBookmarks(bookmarks);
    this.addEventListener('updateselection', this._highlightActive);
    this._dispatch('updateselection');
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
    this._dispatch(['updatelist', 'updateselection']);
  }

  get index(): number {
    return this._index;
  }

  set index(index: number) {
    this._index = index;
    this._dispatch('updateselection');
  }

  next() {
    this.index = mod(this._index + 1, this.bookmarks.length);
  }

  prev() {
    this.index = mod(this._index - 1, this.bookmarks.length);
  }

  private _dispatch(event: AppEvent | AppEvent[]): void {
    if (Array.isArray(event)) event.forEach(e => this._dispatch(e));
    else this.dispatchEvent(new Event(event));
  }

  private _initializeBookmarks(bookmarks: Bookmark[]): Set<BookmarkNode> {
    return new Set(bookmarks.map(bookmark => {
      const bookmarkNode = {
        ...bookmark,
        node: node(`<li><a href="${bookmark.url}">${bookmark.title}</a></li>`) as HTMLElement,
      };
      (bookmarkNode.node.firstChild as HTMLAnchorElement).onclick = () => this._dispatch('bookmarkclick');
      return bookmarkNode;
    }));
  }

  private _highlightActive(): void {
    this.bookmarks.forEach((bookmark, index) => bookmark.node.classList.toggle('active', index === this._index));
  }
}
