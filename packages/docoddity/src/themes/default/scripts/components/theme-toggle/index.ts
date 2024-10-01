import { define } from '../../utils/define.js';
import { TAG_NAME, ThemeToggle } from './theme-toggle.js';

declare global {
  interface HTMLElementTagNameMap {
    [TAG_NAME]: ThemeToggle;
  }
}

define(ThemeToggle);
