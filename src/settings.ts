import { settings } from './utils';

window.onload = async () => {
  const filterInput = document.getElementById('filter') as HTMLInputElement;
  const darkInput = document.getElementById('dark') as HTMLInputElement;
  const animateInput = document.getElementById('animate') as HTMLInputElement;
  const highlightInput = document.getElementById('highlight') as HTMLInputElement;

  filterInput.value = await settings.get('filter') ?? 'all';
  darkInput.checked = await settings.get('dark') ?? false;
  animateInput.checked = await settings.get('animate') ?? true;
  highlightInput.value = await settings.get('highlight') ?? 166;

  highlightInput.style.setProperty('--highlight', highlightInput.value);

  filterInput.addEventListener('input', async (event) => await settings.set('filter', (event.target as HTMLInputElement).value));
  darkInput.addEventListener('input', async (event) => await settings.set('dark', (event.target as HTMLInputElement).checked));
  animateInput.addEventListener('input', async (event) => await settings.set('animate', (event.target as HTMLInputElement).checked));
  highlightInput.addEventListener('change', async (event) => await settings.set('highlight', (event.target as HTMLInputElement).value));
  highlightInput.addEventListener('input', async (event) => highlightInput.style.setProperty('--highlight', (event.target as HTMLInputElement).value));
}
