import type {
  DocoddityRenderedArgs,
} from '../types.js';
import { renderTags } from './render-tags.js';
import { renderBodyHeader } from './render-body-header.js';
import { html } from '../utils/html.js';
import { buildPageTitle } from '../utils/build-page-title.js';

export const renderHTMLPage = ({
  title,
  docoddity,
  page,
  content,
  theme = {
    head: [],
    body: [],
  },
}: DocoddityRenderedArgs) => html`
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta http-equiv="X-UA-Compatible" content="ie=edge" />
      <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
      <title>${buildPageTitle(title, docoddity.title)}</title>

      <!-- theme.headTags -->
      ${theme.head ? renderTags(theme.head) : ''}
      <!-- docoddity.headTags -->
      ${docoddity.head ? renderTags(docoddity.head) : ''}
    </head>
    <body>
      ${renderBodyHeader({ page, docoddity })}

      ${content}
      <!-- theme.bodyTags -->
      ${theme.body ? renderTags(theme.body) : ''}
      <!-- docoddity.bodyTags -->
      ${docoddity.body ? renderTags(docoddity.body) : ''}
    </body>
  </html>
`;
