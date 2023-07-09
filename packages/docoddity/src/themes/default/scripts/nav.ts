document.querySelectorAll('nav button').forEach((button) => {
  button.addEventListener('click', () => {
    const li = button.closest('li');
    if (li) {
      li.classList.toggle('open');
    }
  });
});
