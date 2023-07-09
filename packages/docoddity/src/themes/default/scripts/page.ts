const toggleToc = document.getElementById('toggle-toc');
if (toggleToc) {
  const tocMobile = document.getElementById('toc-mobile');
  if (tocMobile === null) {
    throw new Error('No element found for #toc-mobile');
  }
  toggleToc.addEventListener('click', () => {
    tocMobile.classList.toggle('open');
  });
}
