import type MarkdownIt from "markdown-it";
import type { Sitemap } from "./sitemap.js";

export interface DocoddityContents {
  theme?: string;
  title?: string;
  head?: (string | DocoddityFileDefinition)[];
  body?: (string | DocoddityFileDefinition)[];
  nav?: DocoddityNav;
  config?: {
    algolia?: AlgoliaConfig;
  };
  markdown?: string;
}

export type MarkdownEnhancerFn = (md: MarkdownIt) => (void | Promise<void>);

export interface AlgoliaConfig {

  appId: string;
  indexName: string;
  apiKey: string;
}


export interface Folders {
  sourceDir: string;
  targetDir: string;
  buildDir?: string;
}
export interface DevCLIOpts extends Omit<Folders, 'targetDir'> {
  port: number;
  open?: boolean;
}

interface GenericWatchEvent {
  data: string;
  args?: {
    markdown?: boolean;
  };
}

interface AddEvent extends GenericWatchEvent {
  type: 'add';
}
interface ChangeEvent extends GenericWatchEvent {
  type: 'change';
}
interface DeleteEvent extends GenericWatchEvent {
  type: 'unlink';
}
interface ReadyEvent {
  type: 'ready';
}
interface ErrorEvent {
  type: 'error';
  data: Error;
}
type WatchCallbackEvent = ErrorEvent | AddEvent | ChangeEvent | DeleteEvent | ReadyEvent;
export type WatchCallback = (event: WatchCallbackEvent) => (void | Promise<void>);
export const isWatchAddEvent = (event: WatchCallbackEvent): event is AddEvent => event.type === 'add';
export const isWatchChangeEvent = (event: WatchCallbackEvent): event is ChangeEvent => event.type === 'change';
export const isWatchDeleteEvent = (event: WatchCallbackEvent): event is DeleteEvent => event.type === 'unlink';

export type ValidTagValue = string | number | boolean | { filename: string };
export type DocoddityFileDefinition = Record<string, ValidTagValue>;

export interface DocoddityNavItem {
  url: string;
  text: string;
  mobile?: boolean;
  class?: string;
  target?: string;
  rel?: string;
  ariaLabel?: string;
}

export interface DocoddityNav {
  left?: DocoddityNavItem[];
  right?: DocoddityNavItem[];
}
export interface TagDefinitionFilepathContent {
  filename: string;
}
export type ValidTagName = 'script' | 'link';
export type TagDefinition = { tag: ValidTagName; content?: string | TagDefinitionFilepathContent; } & DocoddityFileDefinition;
export type TagDefinitionWithStringContent = { tag: ValidTagName; content?: string; } & Omit<DocoddityFileDefinition, 'content'>;
export type TagDefinitionWithFilepathContent = { tag: ValidTagName; content: TagDefinitionFilepathContent; } & Omit<DocoddityFileDefinition, 'content'>;

export const isTagDefinition = (tag: string | DocoddityFileDefinition): tag is TagDefinition => typeof tag !== 'string' && 'tag' in tag;
export const isTagDefinitionWithStringContent = (tag: TagDefinition): tag is TagDefinitionWithStringContent => 'content' in tag && typeof tag.content === 'string';
export const isTagDefinitionWithFilepathContent = (tag: TagDefinition): tag is TagDefinitionWithFilepathContent => 'content' in tag && typeof tag.content === 'object' && !!tag.content && 'filename' in tag.content;

export type ValidTagForTemplateRendering = (TagDefinitionWithStringContent | { tag: ValidTagName; } & Omit<DocoddityFileDefinition, 'content'>);
// export const isTagDefinitionWithStringOrUndefinedContent = (tag: TagDefinition): tag is ValidTagForTemplateRendering => ('content' in tag && typeof tag.content === 'string') || !('content' in tag);

export interface PageDefinition {
  url?: string;
  title: string;
  children: PageDefinition[];
  current?: boolean;
  order?: number;
  open?: boolean;
}
export interface PageDefinitionWithURL extends PageDefinition {
  url: string;
}
export const isPageDefinitionWithURL = (page: PageDefinition): page is PageDefinitionWithURL => 'url' in page;

export interface DocoddityRenderedArgs {
  page: {
    url: string;
    pages: PageDefinition[];
  };
  title?: string;
  docoddity: {
    head: (TagDefinitionWithStringContent | string)[];
    body: (TagDefinitionWithStringContent | string)[];
  } & Omit<DocoddityContents, 'head' | 'body'>;
  theme: {
    head: (TagDefinitionWithStringContent | string)[];
    body: (TagDefinitionWithStringContent | string)[];
  } & Omit<DocoddityContents, 'head' | 'body'>;
  content: string | Promise<string>;
}

export interface DocoddityFilepath {
  sourceFilepath: string;
  targetFilepath: string;
}

export interface Frontmatter {
  title?: string;
  order?: number;
}


export const isDocoddityNavItem = (item: unknown): item is DocoddityNavItem => typeof item === 'object' && !!item && !Array.isArray(item) && 'url' in item && 'text' in item;
export const isDocoddityNav = (nav: unknown): nav is DocoddityNav => typeof nav === 'object' && !!nav && !Array.isArray(nav) && (('left' in nav && Array.isArray(nav.left)) || !('left' in nav)) && (('right' in nav && Array.isArray(nav.right)) || !('right' in nav));
export const isDocoddityFileDefinition = (tag: unknown): tag is DocoddityFileDefinition => typeof tag === 'object' && !!tag && !Array.isArray(tag) && Object.entries(tag).every(([key, val]) => {
  if (key === 'content') {
    if (typeof val === 'string') {
      return true;
    }
    return typeof val === 'object' && !!val && !Array.isArray(val) && 'filename' in val && typeof val.filename === 'string';
  }
  return typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean';
});
export const isDocoddityContentsHeadOrBodyTag = (tag: unknown): tag is (string | DocoddityFileDefinition) => typeof tag === 'string' || isDocoddityFileDefinition(tag);
export const isDocoddityContentsHeadOrBody = (tags: unknown): tags is (string | DocoddityFileDefinition)[] => Array.isArray(tags) && tags.every(isDocoddityContentsHeadOrBodyTag);
export const isDocoddityContentsConfig = (config: unknown): config is DocoddityContents['config'] => typeof config === 'object' && !!config && !Array.isArray(config) && (('algolia' in config && isDocoddityContentsConfigAlgolia(config.algolia)) || !('algolia' in config));
export const isDocoddityContentsConfigAlgolia = (config: unknown): config is AlgoliaConfig => typeof config === 'object' && !!config && !Array.isArray(config) && 'appId' in config && 'indexName' in config && 'apiKey' in config;

export const isDocoddityContents = (contents: unknown): contents is DocoddityContents => typeof contents === 'object'
  && !!contents
  && !Array.isArray(contents)
  && (('title' in contents && typeof contents.title === 'string') || !('title' in contents))
  && (('theme' in contents && typeof contents.theme === 'string') || !('theme' in contents))
  && (('nav' in contents && isDocoddityNav(contents.nav)) || !('nav' in contents))
  && (('head' in contents && isDocoddityContentsHeadOrBody(contents.head)) || !('head' in contents))
  && (('body' in contents && isDocoddityContentsHeadOrBody(contents.body)) || !('body' in contents))
  && (('config' in contents && isDocoddityContentsConfig(contents.config)) || !('config' in contents))
  && (('markdown' in contents && typeof contents.markdown === 'string') || !('markdown' in contents));
