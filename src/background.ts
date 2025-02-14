import { browser, Bookmark, settings } from './utils';
// @ts-expect-error: Expect type error for bundled content script
import content from './content.tmp';

const id = `bookmarklet-extension-${browser.runtime.id}`; // ID for modal dialog

const appendPath = (path: string | undefined, title: string) => {
  if (!path && ['Bookmarks Bar', 'Bookmarks Menu'].includes(title)) return undefined; // Ignore root nodes
  return path ? `${path}/${title}` : title;
};

// Create an array containing all bookmarks
const extractBookmarks = (nodes: browser.bookmarks.BookmarkTreeNode[], bookmarks: Bookmark[] = [], path?: string) => {
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

// Default extension action injects content script
browser.action.onClicked.addListener(async (tab) => {
  const bookmarks = extractBookmarks(await browser.bookmarks.getTree());

  browser.scripting.executeScript({
    target: { tabId: tab?.id! },
    func: content,
    args: [id, bookmarks, await settings.get()],
  });
});
