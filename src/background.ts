import { browser, Bookmark } from './utils';
// @ts-expect-error: Content script (populated by esbuild)
import content from './content.js';

const id = `bookmarklet-extension-${browser.runtime.id}`; // ID for modal dialog

// Create an array containing all bookmarks indexed by ID
function extractBookmarks(nodes: browser.bookmarks.BookmarkTreeNode[], bookmarks: Bookmark[] = []) {
  for (const node of nodes) {
    if (node.url) bookmarks.push({ id: node.id, title: node.title, url: node.url });
    if (node.children) extractBookmarks(node.children, bookmarks);
  }
  return bookmarks;
}

// Default extension action injects content script
browser.action.onClicked.addListener(async (tab) => {
  const bookmarks = extractBookmarks(await browser.bookmarks.getTree());
  const css = await (await fetch(browser.runtime.getURL('style.min.css'))).text();

  browser.scripting.executeScript({
    target: { tabId: tab?.id! },
    func: content,
    args: [id, bookmarks, css],
  });
});
