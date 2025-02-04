import { helper } from "./helper.js";

console.log(helper("test"));

const browser = globalThis.browser ?? globalThis.chrome; // Browser interface
const id = `bookmarklet-extension-${browser.runtime.id}`; // ID for modal dialog

// Create an array containing all bookmarks indexed by ID
function extractBookmarks(nodes, bookmarks = []) {
  for (const node of nodes) {
    if (node.url) bookmarks.push({ id: node.id, title: node.title, url: node.url });
    if (node.children) extractBookmarks(node.children, bookmarks);
  }
  return bookmarks;
}

async function test(id, bookmarks, html, css) {
  if (document.getElementById(id)) return; // Modal already open
  const browser = globalThis.browser ?? globalThis.chrome; // Browser interface
  let filtered = bookmarks; // Holds the filtered list of bookmarks
  let activeIndex = 0; // Index of the selected bookmark

  // Simple setter getter for stored settings
  const settings = {
    async get(key) {
      return browser.storage.sync.get(key);
    },
    async set(key, value) {
      await browser.storage.sync.set({ [key]: value });
    },
  };

  // Convenience function to create nested DOM nodes
  const node = v => typeof v === 'string' ? document.createRange().createContextualFragment(v).firstChild : v;

  // Create list items for each bookmark
  const createBookmarkEntries = bookmarks => {
    const items = [];
    for (const [id, bookmark] of Object.entries(bookmarks)) {
      const item = node(`<li><a href="${bookmark.url}">${bookmark.title}</a></li>`);
      bookmark.node = item;
      items.push(item);
    }
    return items;
  };

  const activateShortcut = () => {};

  const filterBookmarks = (listElement, query) => {
    // for (const [id, bookmark] of Object.entries(bookmarks)) {
    //   const displayed = bookmark.title.toLowerCase().includes(query.toLowerCase());
    //   bookmark.node.style.display = displayed ? 'block' : 'none';
    //   // const item = node(`<li><a href="${bookmark.url}">${bookmark.title}</a></li>`);
    //   // bookmark.node = item;
    //   // items.push(item);
    // }
    // listElement.innerHTML = '';
    // console.log(Object.entries(bookmarks).filter(([id, bookmark]) => bookmark.title.toLowerCase()));
    filtered = query ? bookmarks.filter(bookmark => bookmark.title.toLowerCase().includes(query.toLowerCase())) : bookmarks;
    filtered.forEach((bookmark, index) => bookmark.node.classList.toggle('active', index === 0));
    listElement.replaceChildren(...filtered.map(bookmark => bookmark.node));
    // filtered = Object.values(bookmarks).filter(bookmark => bookmark.title.toLowerCase().includes(query.toLowerCase()));
  };

  const setActive = selectedIndex => {
    filtered.forEach((bookmark, index) => bookmark.node.classList.toggle('active', index === selectedIndex));
  };

  // Define (shadow) DOM
  const host = node(`<div id="${id}" style="all:initial;position:fixed;width:0;height:0;opacity:0;"></div>`);
  const root = host.attachShadow({ mode: 'open' });
  const dialogElement = node('<dialog style="border-radius:1em;"><input type="text" onblur="this.focus()" autofocus><ol></ol></dialog>');
  const inputElement = dialogElement.firstChild;
  const listElement = dialogElement.lastChild;
  // listElement.append(...items);
  
  createBookmarkEntries(bookmarks);
  filterBookmarks(listElement);
  // dialogElement.innerHTML = html;
  
  // const button = document.createElement('button');
  // button.onclick = () => settings.show_all = !settings.show_all;
  // button.innerText = settings.show_all ? 'Hide all' : 'Show all';
  // dialogElement.appendChild(button);
  // Input events
  inputElement.addEventListener('input', event => filterBookmarks(listElement, event.target.value));
  inputElement.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key === '1') {
      console.log('Command/Ctrl + 1 pressed');
      event.preventDefault();
    }
    if (event.key === 'Enter') {
      dialogElement.close();
    }
    if (event.key === 'ArrowDown') {
      setActive(selectedIndex + 1);
    }
  });

  // Dialog events
  dialogElement.addEventListener('click', (event) => { if (event.target instanceof HTMLDialogElement) event.target.close(); });
  dialogElement.addEventListener('close', () => host.remove());

  // Assemble DOM
  root.appendChild(Object.assign(document.createElement('style'), { textContent: css }));
  root.appendChild(dialogElement);
  document.body.appendChild(host);
  dialogElement.showModal();
}

// Open modal when action is triggered
browser.action.onClicked.addListener(async (tab) => {
  const bookmarks = extractBookmarks(await browser.bookmarks.getTree());
  const html = await (await fetch(browser.runtime.getURL("modal.html"))).text();
  const css = await (await fetch(browser.runtime.getURL("modal.css"))).text();

  browser.scripting.executeScript({
    target: { tabId: tab.id },
    function: test,
    args: [id, bookmarks, html, css],
  });
});
