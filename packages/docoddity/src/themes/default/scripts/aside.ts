import { $ } from "./utils.js";

const aside = $('aside#toc-desktop');
if (aside) {
  const headers = document.querySelectorAll("h2, h3");
  const anchors = aside.querySelectorAll('a');

  let currentlyActive = 0;
  anchors[0].classList.add('active');
  const detectPosition = () => {
    const headerPositions = [...headers].map((header) => header.getBoundingClientRect().top);
    for (let i = 0; i < headerPositions.length; i++) {
      const pos = headerPositions[i];
      if (pos > 0) {
        if (currentlyActive !== i) {
          anchors[currentlyActive].classList.remove('active');
          anchors[i].classList.add('active');
          currentlyActive = i;
        }
        break;
      }
    }
  }
  addEventListener("scroll", detectPosition);
  detectPosition();
}
