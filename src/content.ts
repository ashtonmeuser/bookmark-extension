import App from './App';
import { node, Bookmark } from './utils';
// @ts-expect-error: Load contents of minified CSS
import css from './style.tmp.css';

// External declarations (provided to wrapping function by extension background script)
declare const id: string;
declare const bookmarks: Bookmark[];

if (document.getElementById(id)) throw undefined; // Modal already open

// Define (shadow) DOM
const host = node(`<div id="${id}" style="all:initial;position:fixed;width:0;height:0;opacity:0;"></div>`) as HTMLDivElement;
const root = host.attachShadow({ mode: 'open' });
const dialog = node('<dialog><form method="get"><input type="text" placeholder="Search bookmarks" onblur="this.focus()" autofocus></form><ol></ol></dialog>') as HTMLDialogElement;
const form = dialog.firstChild as HTMLFormElement;
const input = form.firstChild as HTMLInputElement;
const list = dialog.lastChild as HTMLOListElement;

// App instance and event listeners
const app = new App(bookmarks);
app.on('updatelist', () => list.replaceChildren(...app.nodes));
app.on('updateselection', () => form.action = app.selection?.url ?? '');
app.on('updateselection', () => app.selection?.node.scrollIntoView({ block: 'nearest' }));
app.on('bookmarkclick', () => dialog.close());
app.query = input.value; // Set initial query (likely empty)

// Input events
input.addEventListener('input', event => app.query = (event.target as HTMLInputElement).value);
input.addEventListener('keydown', async event => {
  if (event.key === 'Enter') {
    form.target = event.ctrlKey || event.metaKey ? '_blank' : event.shiftKey ? '_top' : '_self'; // Set target to open in current tab, new tab, new window
    if (form.target !== '_self' && app.selection?.bookmarklet) return event.preventDefault(); // Prevent bookmarklets targeting new tab/window
    if (window.navigator.userAgent.includes('Mac') && event.metaKey) form.submit(); // Command+Enter does not submit form on macOS
    dialog.close();
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
dialog.addEventListener('click', (event) => { if (event.target instanceof HTMLDialogElement) event.target.close(); });
dialog.addEventListener('close', () => setTimeout(() => host.remove(), 200));

// Assemble DOM
root.appendChild(Object.assign(document.createElement('style'), { textContent: css }));
root.appendChild(dialog);
document.body.appendChild(host);
dialog.showModal();
