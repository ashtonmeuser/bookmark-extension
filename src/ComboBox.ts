import { mod } from './utils';

type ItemNode<T> = T & { node: HTMLElement };
type AppEvent = 'update' | 'select' | 'click';

export default class ComboBox<T, K extends (keyof T)[]> {
  private _items: Set<ItemNode<T>>;
  private _queryFields: K;
  private _query?: string;
  private _index: number = 0;
  private listeners = new Map<AppEvent, Set<() => void>>();

  constructor(items: T[], itemFactory: (item: T) => HTMLElement, queryFields: K) {
    this._items = this._initializeItems(items, itemFactory);
    this._queryFields = queryFields;
    this.on('select', this._highlightActive.bind(this));
    this._dispatch('select');
  }

  get items(): ItemNode<T>[] {
    if (!this._query) return [...this._items];
    const subqueries = this._query.toLowerCase().trim().split(/\s+/);
    return [...this._items].filter(item => subqueries.every(query => this._queryFields.some(property => typeof item[property] === 'string' && item[property].toLowerCase().includes(query))));
  }

  get nodes(): HTMLElement[] {
    return this.items.map(item => item.node);
  }

  get selection(): ItemNode<T> | undefined {
    return this.items[this._index];
  }

  set query(query: string | undefined) {
    this.index = 0;
    this._query = query;
    this._dispatch(['update', 'select']);
  }

  get index(): number {
    return this._index;
  }

  set index(index: number) {
    this._index = index;
    this._dispatch('select');
  }

  next() {
    this.index = mod(this._index + 1, this.items.length);
  }

  prev() {
    this.index = mod(this._index - 1, this.items.length);
  }

  on(event: AppEvent, callback: () => void) {
    // TODO: Add ability to remove listeners
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(callback);
  }

  private _dispatch(event: AppEvent | AppEvent[]): void {
    if (Array.isArray(event)) event.forEach(e => this._dispatch(e));
    else this.listeners.get(event)?.forEach(callback => callback());
  }

  private _initializeItems(items: T[], itemFactory: (item: T) => HTMLElement): Set<ItemNode<T>> {
    return new Set(items.map(item => {
      const itemNode = { ...item, node: itemFactory(item) };
      (itemNode.node.firstChild as HTMLAnchorElement).onclick = () => this._dispatch('click');
      return itemNode;
    }));
  }

  private _highlightActive(): void {
    this.items.forEach((item, index) => item.node.querySelector('a')?.classList.toggle('active', index === this._index));
  }
}
