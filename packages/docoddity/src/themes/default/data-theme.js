const theme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', theme);
document.body.classList.add(`sl-theme-${theme}`);
