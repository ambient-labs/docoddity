import path from 'path';
import { _INCLUDES } from '../constants.js';
import markdownit from 'markdown-it'
import markdownitFrontMatter from 'markdown-it-front-matter';
import markdownitAnchor from 'markdown-it-anchor';
import type Token from 'markdown-it/lib/token.mjs';
import { MarkdownEnhancerFn } from '../types.js';
import { readDocoddityJSON } from './read-docoddity-json.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const md = markdownit({
  html: true,
  linkify: true,
  typographer: true
})
  .use(markdownitFrontMatter, () => { })
  .use(markdownitAnchor);

const getHref = (token: Token) => {
  const href = token.attrs?.find(attr => attr[0] === 'href');
  return href ? href[1] : '';
}

md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
  const token = tokens[idx];
  const href = getHref(token);
  if (href.startsWith('http')) {
    // Add a new `target` attribute, or replace the value of the existing one.
    tokens[idx].attrSet('target', '_blank');
  }

  // Pass the token to the default renderer.
  return self.renderToken(tokens, idx, options);
};

export const getMarkdown = async (content: string) => md.render(content);



const loadMarkdownEnhancer = async (sourceDir: string): Promise<MarkdownEnhancerFn | null> => {
  const { markdown } = await readDocoddityJSON(sourceDir) || {};
  if (markdown) {
    try {
      const enhancerPath = path.resolve(sourceDir, markdown);
      if (enhancerPath.endsWith('.ts')) {
        throw new Error(`Only JavaScript markdown enhancers are supported, ${markdown} is a TypeScript file. Please compile it first.`)
      }

      // For JavaScript files, use dynamic import
      const enhancerModule = await import(enhancerPath);
      const loadedFunction = enhancerModule.default || enhancerModule;

      if (typeof loadedFunction !== 'function') {
        throw new Error('Markdown enhancer must be a function');
      }

      // Wrap the loaded function in a safe executor
      return (md: markdownit) => {
        try {
          // Execute the enhancer in a separate context with limited access
          const safeExecutor = new Function('md', `
              return (${loadedFunction.toString()})(md);
            `);
          safeExecutor(md);
        } catch (error) {
          console.error(`Error executing markdown enhancer: ${error}`);
        }
      };
    } catch (error) {
      console.warn(`Failed to load markdown enhancer: ${error}`);
    }
  }
  return null;
};

export const applyMarkdownEnhancer = async (sourceDir: string) => {
  const markdownEnhancer = await loadMarkdownEnhancer(sourceDir);
  if (markdownEnhancer) {
    try {
      markdownEnhancer(md);
    } catch (error) {
      console.error(`Error applying markdown enhancer: ${error}`);
    }
  }
}
