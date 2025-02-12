import { browser } from './utils';
// @ts-expect-error: Content script (populated by esbuild)
import test from './content.js';

const id = `bookmarklet-extension-${browser.runtime.id}`; // ID for modal dialog

// Create an array containing all bookmarks indexed by ID
function extractBookmarks(nodes: browser.bookmarks.BookmarkTreeNode[], bookmarks: Bookmark[] = []) {
  for (const node of nodes) {
    if (node.url) bookmarks.push({ id: node.id, title: node.title, url: node.url });
    if (node.children) extractBookmarks(node.children, bookmarks);
  }
  return bookmarks;
}

async function getCurrentTab(): Promise<browser.tabs.Tab | undefined> {
  return (await browser.tabs.query({ active: true, lastFocusedWindow: true }))[0];
}

browser.action.onClicked.addListener(async (tab) => {
  const bookmarks = extractBookmarks(await browser.bookmarks.getTree());
  const css = await (await fetch(browser.runtime.getURL("style.min.css"))).text();

  browser.scripting.executeScript({
    target: { tabId: tab?.id! },
    func: test,
    args: [id, bookmarks, css],
  });
});

browser.runtime.onMessage.addListener(
  async function (request: Navigation) {
    switch (request.target) {
      case '_self':
        const tab = await getCurrentTab();
        if (!tab) return;
        browser.scripting.executeScript({
          target: { tabId: tab.id! },
          func: new Function('alert("hello")') as () => void,
        });
        // @ts-expect-error: Undefined tab index defaults to current tab
        // browser.tabs.update(undefined, { url: request.url });
        break;
      case '_blank':
        browser.tabs.create({ url: request.url });
        break;
      case '_top':
      default:
        browser.windows.create({ url: request.url });
        break;
    }
    return true;
  }
);
