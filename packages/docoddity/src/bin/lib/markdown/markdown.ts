import { _INCLUDES } from '../constants.js';
import markdownit from 'markdown-it'
import markdownitFrontMatter from 'markdown-it-front-matter';
import markdownitAnchor from 'markdown-it-anchor';
import { getHref } from './get-href.js';
import { loadUserScript } from '../load-user-script.js';

export class Markdown {
  md: markdownit;
  ready: Promise<void>;
  constructor(enhancerPath?: string) {
    this.md = markdownit({
      html: true,
      linkify: true,
      typographer: true
    })
      .use(markdownitFrontMatter, () => { })
      .use(markdownitAnchor);

    this.md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
      const token = tokens[idx];
      const href = getHref(token);
      if (href.startsWith('http')) {
        // Add a new `target` attribute, or replace the value of the existing one.
        tokens[idx].attrSet('target', '_blank');
      }

      // Pass the token to the default renderer.
      return self.renderToken(tokens, idx, options);
    };

    this.ready = this.initialize(enhancerPath);
  }

  initialize = async (enhancerPath?: string) => {
    if (enhancerPath) {
      try {
        const loadedFunction = await loadUserScript(enhancerPath);
        try {
          // Execute the enhancer in a separate context with limited access
          // const safeExecutor = new Function('md', `return (${loadedFunction.toString()})(md);`);
          // await safeExecutor(this.md);
          await loadedFunction(this.md);
        } catch (error) {
          console.error(`Error executing markdown enhancer: ${error}`);
        }
      } catch (error) {
        console.error(`Error applying markdown enhancer: ${error}`);
      }
      // } else {
      //   console.log('no markdown enhancer found');
    }
  }

  render = (content: string, filepath?: string) => this.md.render(content, {
    filepath,
  });
}
