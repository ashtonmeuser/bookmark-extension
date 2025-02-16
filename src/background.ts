import { browser, Bookmark, Settings, settings } from './utils';
// @ts-expect-error: Expect type error for bundled content script
import content from './content.tmp';

const id = `bookmarklet-extension-${browser.runtime.id}`; // ID for modal dialog

// Concatenate path nodes (ignoring root nodes)
const appendPath = (path: string | undefined, title: string) => {
  if (!path && ['Bookmarks Bar', 'Bookmarks Menu'].includes(title)) return undefined; // Ignore root nodes
  return path ? `${path}/${title}` : title;
};

// Create an array containing all bookmarks
const extractBookmarks = (nodes: browser.bookmarks.BookmarkTreeNode[], bookmarks: Bookmark[] = [], path?: string): Bookmark[] => {
  for (const node of nodes) {
    if (node.url) bookmarks.push({
      id: node.id,
      title: node.title,
      path,
      url: node.url,
      bookmarklet: node.url.toLowerCase().startsWith('javascript:'),
    });
    if (node.children) extractBookmarks(node.children, bookmarks, appendPath(path, node.title));
  }
  return bookmarks;
}

// Filter bookmarks by type
const filterBookmarks = (bookmarks: Bookmark[], filter?: Settings['filter']): Bookmark[] => {
  if (filter === 'bookmarks') return bookmarks.filter(bookmark => !bookmark.bookmarklet);
  if (filter === 'bookmarklets') return bookmarks.filter(bookmark => bookmark.bookmarklet);
  return bookmarks;
}

// Default extension action injects content script
browser.action.onClicked.addListener(async (tab) => {
  const bookmarks = extractBookmarks(await browser.bookmarks.getTree());
  const allSettings = await settings.get();
  const filtered = filterBookmarks(bookmarks, allSettings.filter);

  browser.scripting.executeScript({
    target: { tabId: tab?.id! },
    func: content,
    args: [id, filtered, allSettings],
  // @ts-expect-error: Chrome optionally takes a callback that we'll use to ignore spurious errors
  }, () => browser.runtime.lastError); // Read last error to "catch" it (see https://stackoverflow.com/a/45603880)
});

browser.runtime.onMessage.addListener(request => {
  if (request == 'options') browser.runtime.openOptionsPage();
});
