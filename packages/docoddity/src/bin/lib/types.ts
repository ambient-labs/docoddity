import type { Sitemap } from "./sitemap.js";

export interface Folders {
  sourceDir: string;
  targetDir: string;
  buildDir?: string;
}
export interface DevCLIOpts extends Omit<Folders, 'targetDir'> {
  port: number;
  open?: boolean;
}

interface AddEvent {
  type: 'add';
  data: string;
  sitemap: Sitemap;
}
interface ChangeEvent {
  type: 'change';
  data: string;
  sitemap: Sitemap;
}
interface DeleteEvent {
  type: 'unlink';
  data: string;
  sitemap: Sitemap;
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

export type ValidTagValue = string | number | boolean;
export type DocoddityFileDefinition = Record<string, ValidTagValue>;

export interface DocoddityNavItem {
  url: string;
  mobile?: boolean;
  text: string;
  class?: string;
  target?: string;
  rel?: string;
  ariaLabel?: string;
}

export interface DocoddityNav {
  left?: DocoddityNavItem[];
  right?: DocoddityNavItem[];

}
export interface DocoddityContents {
  theme?: string;
  title?: string;
  head?: (string | DocoddityFileDefinition)[];
  body?: (string | DocoddityFileDefinition)[];
  nav?: DocoddityNav;
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

export interface Page {
  url: string;
  title: string;
  children: Page[];
  current?: boolean;
  order?: number;
}

export interface DocoddityRenderedArgs {
  page: {
    url: string;
    pages: Page[];
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
