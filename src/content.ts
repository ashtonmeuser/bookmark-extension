declare const id: string;
declare const css: string;
declare const bookmarks: BookmarkNode[];

import App from './App';
import { browser, node } from './utils';

if (document.getElementById(id)) throw undefined; // Modal already open

// Simple setter getter for stored settings
const settings = {
  async get(key: string) {
    return browser.storage.sync.get(key);
  },
  async set(key: string, value: any) {
    await browser.storage.sync.set({ [key]: value });
  },
};

// Define (shadow) DOM
const host = node(`<div id="${id}" style="all:initial;position:fixed;width:0;height:0;opacity:0;"></div>`) as HTMLDivElement;
const root = host.attachShadow({ mode: 'open' });
const dialogElement = node('<dialog style="border-radius:1em;"><input type="text" onblur="this.focus()" autofocus><ol></ol></dialog>') as HTMLDialogElement;
// const dialogElement = node('<dialog style="border-radius:1em;"><input type="text" tabindex="-1"><ol></ol></dialog>') as HTMLDialogElement;
const inputElement = dialogElement.firstChild as HTMLInputElement;
const listElement = dialogElement.lastChild as HTMLOListElement;


const debugElement = node('<form action="javascript:alert(123)"><input type="text"></form>') as HTMLFormElement;

const app = new App(bookmarks, (app) => {
  listElement.replaceChildren(...app.nodes);
});

// const button = document.createElement('button');
// button.onclick = () => settings.show_all = !settings.show_all;
// button.innerText = settings.show_all ? 'Hide all' : 'Show all';
// dialogElement.appendChild(button);
// Input events
inputElement.addEventListener('input', event => app.query = (event.target as HTMLInputElement).value);

// inputElement.addEventListener('input', event => filterBookmarks(listElement, (event.target as HTMLInputElement).value ));

// listElement.addEventListener('keydown', event => inputElement.dispatchEvent(new Event(event.type, event)));
// listElement.addEventListener('keyup', event => inputElement.dispatchEvent(new Event(event.type, event)));

// inputElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'A' }));

inputElement.addEventListener('keydown', event => {
    if (event.key === "Enter") {
        event.preventDefault(); // Prevent form submission if inside a form
        const link = listElement.querySelector('a');
        link!.focus(); // Move focus to the link
        // Manually trigger click if needed (optional)
        // link.click();
    }
});

dialogElement.addEventListener('keydown', async event => {
  if ((event.ctrlKey || event.metaKey) && event.key === '1') {
    console.log('Command/Ctrl + 1 pressed');
    event.preventDefault();
  }
  if (event.key === 'Enter') {
    await app.select(event.ctrlKey || event.metaKey ? '_blank' : event.shiftKey ? '_top' : '_self');
    // const navigation: Navigation = {
    //   url: '',
    //   target: event.ctrlKey || event.metaKey ? '_blank' : event.shiftKey ? '_top' : '_self',
    // };
    // const response = await browser.runtime.sendMessage(navigation);
  }
  if (event.key === 'ArrowDown') {
    app.next();
    event.preventDefault();
  }
  if (event.key === 'ArrowUp') {
    app.prev();
    event.preventDefault();
  }
});

// Dialog events
dialogElement.addEventListener('click', (event) => { if (event.target instanceof HTMLDialogElement) event.target.close(); });
dialogElement.addEventListener('close', () => host.remove());

// Assemble DOM
root.appendChild(Object.assign(document.createElement('style'), { textContent: css }));
root.appendChild(dialogElement);
dialogElement.appendChild(debugElement);
document.body.appendChild(host);
dialogElement.showModal();
