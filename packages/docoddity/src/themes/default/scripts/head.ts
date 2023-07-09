import { $ } from './utils.js';
const backToMainMenuButton = $('#back-to-main-menu');
backToMainMenuButton.addEventListener('click', () => {
  backToMainMenuButton.closest('main').classList.add('main-menu');
});
// head.html
(window as any).docsearch({
  container: '#docsearch',
  appId: 'LQ7FIB4N3D',
  indexName: 'some-index-name',
  apiKey: 'eb51b2e714c17a48ecb3fbf2cc18841b',
});
// head.html
const hamburgerButton = $('#hamburger');
const hamburgerMenu = $('$hamburger-menu');
const closeHamburgerButton = $('#close-hamburger');
const hamburgerOverlay = $('#hamburger-menu-overlay');

function close() {
  hamburgerButton.setAttribute('aria-expanded', 'false');
  hamburgerMenu.classList.remove('open');
  backToMainMenuButton.closest('main').classList.remove('main-menu');
}

hamburgerButton.addEventListener('click', () => {
  if (hamburgerButton.getAttribute('aria-expanded') === 'false') {
    hamburgerButton.setAttribute('aria-expanded', 'true');
    hamburgerMenu.classList.add('open');
  } else {
    close();
  }
});

closeHamburgerButton.addEventListener('click', close);
hamburgerOverlay.addEventListener('click', close);
