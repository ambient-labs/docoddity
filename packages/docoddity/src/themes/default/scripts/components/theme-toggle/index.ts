import './theme-toggle.js';
import { TAG_NAME, ThemeToggle } from './theme-toggle.js';

declare global {
  interface HTMLElementTagNameMap {
    [TAG_NAME]: ThemeToggle;
  }
}

customElements.get(TAG_NAME) || customElements.define(TAG_NAME, ThemeToggle);
