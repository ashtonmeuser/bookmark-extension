import ComboBox from './ComboBox';
import { node, Bookmark, theme, Settings, browser } from './utils';
// @ts-expect-error: Load contents of minified CSS
import css from './style.tmp.css';
// @ts-expect-error: Load contents of static SVG
import svg from '../static/options.svg';

// External declarations (provided to wrapping function by extension background script)
declare const id: string;
declare const bookmarks: Bookmark[];
declare const settings: Settings;

if (document.getElementById(id)) throw undefined; // Modal already open

// Define (shadow) DOM
const host = node(`<div id="${id}" style="all:initial;position:fixed;width:0;height:0;opacity:0;"></div>`) as HTMLDivElement;
const root = host.attachShadow({ mode: 'open' });
const dialog = node(`<dialog><form method="get"><input type="text" placeholder="Search bookmarks" onblur="this.focus()" autofocus><button type="button">${svg}</button></form><ol></ol></dialog>`) as HTMLDialogElement;
const form = dialog.firstChild as HTMLFormElement;
const input = form.firstChild as HTMLInputElement;
const list = dialog.lastChild as HTMLOListElement;
const options = form.lastChild as HTMLButtonElement;

// Theme
dialog.classList.toggle('animated', settings.animate ?? true);
const darkMode = settings.dark ?? false;
host.style.setProperty('--background', darkMode ? theme.dark : theme.light);
host.style.setProperty('--primary', darkMode ? theme.light : theme.dark);
host.style.setProperty('--highlight', String(settings.highlight ?? 166));

// List item DOM factory
const factory = (bookmark: Bookmark) => node(`<li><a href="${bookmark.url}"><section><div class="title">${bookmark.title}</div><div class="path">${bookmark.path ?? ''}</div></section></a></li>`) as HTMLElement;

// App instance and event listeners
const comboBox = new ComboBox(bookmarks, factory, ['title', 'path']);
comboBox.on('update', () => list.replaceChildren(...comboBox.nodes));
comboBox.on('select', () => form.action = comboBox.selection?.url ?? '');
comboBox.on('select', () => comboBox.selection?.node.scrollIntoView({ block: 'nearest' }));
comboBox.on('click', () => dialog.close());
comboBox.query = input.value; // Set initial query (likely empty)

// Input events
input.addEventListener('input', event => comboBox.query = (event.target as HTMLInputElement).value);
input.addEventListener('keydown', async event => {
  if (event.key === 'Enter') {
    form.target = event.ctrlKey || event.metaKey ? '_blank' : event.shiftKey ? '_top' : '_self'; // Set target to open in current tab, new tab, new window
    if (form.target !== '_self' && comboBox.selection?.bookmarklet) return event.preventDefault(); // Prevent bookmarklets targeting new tab/window
    if (window.navigator.userAgent.includes('Mac') && event.metaKey) form.submit(); // Command+Enter does not submit form on macOS
    dialog.close();
  }
  if (event.key === 'ArrowDown') {
    comboBox.next();
    event.preventDefault();
  }
  if (event.key === 'ArrowUp') {
    comboBox.prev();
    event.preventDefault();
  }
});

// Options button
options.addEventListener('click', () => browser.runtime.sendMessage('options'));

// Dialog events
dialog.addEventListener('click', (event) => { if (event.target instanceof HTMLDialogElement) event.target.close(); });
dialog.addEventListener('close', () => setTimeout(() => host.remove(), 200));

// Assemble DOM
root.appendChild(Object.assign(document.createElement('style'), { textContent: css }));
root.appendChild(dialog);
document.body.appendChild(host);
dialog.showModal();
