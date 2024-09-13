import type {
  DocoddityRenderedArgs,
} from '../types.js';
import { renderTags } from './render-tags.js';
import { renderBodyHeader } from './render-body-header.js';

export const renderBase = (args: DocoddityRenderedArgs): string => {
  const {
    title,
    docoddity,
    page,
    content,
    theme = {
      head: [],
      body: [],
    },
  } = args;
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="X-UA-Compatible" content="ie=edge" />
        <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
        <title>${[title, docoddity.title].filter(Boolean).join(' | ')}</title>

        <!-- theme.headTags -->
        ${theme.head ? renderTags(theme.head) : ''}
        <!-- docoddity.headTags -->
        ${docoddity.head ? renderTags(docoddity.head) : ''}
      </head>
      <body>
        ${renderBodyHeader(args)}

        ${content}
        <!-- theme.bodyTags -->
        ${theme.body ? renderTags(theme.body) : ''}
        <!-- docoddity.bodyTags -->
        ${docoddity.body ? renderTags(docoddity.body) : ''}
      </body>
    </html>
  `;
};
