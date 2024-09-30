import path from 'path';
import { readFile } from "./utils/fs.js";
import { parseFrontmatter } from './utils/parse-frontmatter.js';
import { swallowErr } from './utils/swallow-err.js';
import type { PageDefinition } from './types.js';
import { makeRelative } from './utils/make-relative.js';
import { parseTitleFromURL } from './utils/parse-title-from-url.js';
import { buildPageNodeURL } from './utils/build-page-node-url.js';

class Node {
  children = new Map<string, Node>();
  url: string;
  parent?: Node;

  constructor(protected parts: string[], protected leaf: boolean, protected inputDir: string, parent?: Node) {
    if (parts.length > 0 && !parent) {
      throw new Error('Parent is required for non-root nodes');
    }
    this.parent = parent;
    if (this.leaf) {
      this.url = buildPageNodeURL(parts);
    } else {
      this.url = '/' + parts.join('/');
    }
  }

  get content() {
    const { parts, inputDir, } = this;
    if (this.leaf) {
      return readFile(path.resolve(inputDir, ...parts));
    }
    return swallowErr<string>(() => readFile(path.resolve(inputDir, ...parts, '.category.json')), '{}');
  }

  remove = (parts: string[], position = 0): boolean => {
    if (position === parts.length) {
      if (!this.leaf) {
        return false;
      }
      this.parent?.children.delete(parts[position - 1]);
      return true;
    }

    const name = parts[position];
    const node = this.children.get(name);

    if (!node) {
      return false;
    }

    const removed = node.remove(parts, position + 1);

    if (removed && node.children.size === 0 && !node.leaf) {
      this.children.delete(name);
    }

    return removed;
  }

  has = (parts: string[]): boolean => {
    const part = parts.shift();
    if (!part) {
      return true;
    }
    const node = this.children.get(part);
    if (!node) {
      return false;
    }
    return node.has(parts);
  }

  public *traverse(path: string[] = []): Generator<string> {
    if (this.leaf) {
      yield path.join('/');
    }
    for (const [part, child] of this.children.entries()) {
      yield* child.traverse([...path, part]);
    }
  }

  private async getFrontmatter(): Promise<{
    title: string;
    order?: number;
  }> {
    const content = await this.content;
    if (this.leaf) {
      const { title, order, } = await parseFrontmatter(content);
      const frontmatter = {
        title: title ?? parseTitleFromURL(this.url) ?? '',
        order: order,
      }
      return frontmatter;
    } else {
      return JSON.parse(content);
    }
  }

  private getTitleFromURL() {
    const pageName = this.url.split('/').pop() ?? '';
    return pageName.split(/[-_]/).map(word => word?.[0]?.toUpperCase() + word.slice(1)).join(' ');
  }

  private async getCategory(): Promise<string> {
    const content = await this.content;
    if (content) {
      const { title } = JSON.parse(content);
      if (title) {
        return title;
      }
    }
    return this.getTitleFromURL();
  };

  async getPage(): Promise<PageDefinition> {
    if (this.leaf) {
      const { title, order } = await this.getFrontmatter();
      return {
        url: this.url,
        title: title !== '' ? title : this.getTitleFromURL(),
        children: [],
        order,
      };
    } else {
      const title = await this.getCategory();
      console.log('title', title);
      const children = await Promise.all([...this.children.values()].map(child => child.getPage()));
      const { order } = await this.getFrontmatter();
      const sortedChildren = children.sort(({ order: a }, { order: b }) => {
        if (a === undefined && b === undefined) {
          return 0;
        }
        if (a === undefined) {
          return 1;
        }
        if (b === undefined) {
          return -1;
        }
        return a - b;
      });
      return {
        order,
        url: this.url,
        title,
        children: sortedChildren,
      };
    }
  }

}

const split = (filepath: string) => filepath.split('/').filter(Boolean);

export class Sitemap {
  root: Node;
  relativeToInputDir: ReturnType<typeof makeRelative>;

  constructor(private inputDir: string) {
    this.root = new Node([], false, inputDir);
    this.relativeToInputDir = makeRelative(inputDir);
  }

  add = (filepath: string): void => {
    const parts = split(this.relativeToInputDir(filepath));
    let currentNode = this.root;
    let i = 0;

    while (i < parts.length) {
      const name = parts[i];
      let node = currentNode.children.get(name);

      if (!node) {
        const isLeaf = i === parts.length - 1;
        node = new Node(parts.slice(0, i + 1), isLeaf, this.inputDir, currentNode);
        currentNode.children.set(name, node);
      }

      currentNode = node;
      i++;
    }

  }

  remove = (filepath: string): void => {
    const parts = split(this.relativeToInputDir(filepath));
    this.root.remove(parts);
  }

  has = (filepath: string): boolean => {
    const parts = split(this.relativeToInputDir(filepath));
    return this.root.has(parts);
  }

  public *[Symbol.iterator]() {
    yield* this.root.traverse();
  }

  public getNode(filepath: string): Node {
    const parts = split(filepath);
    let node = this.root;
    let part = parts.shift();
    while (part) {
      const _node = node.children.get(part);
      if (_node === undefined) {
        throw new Error(`Node not found for ${part} (${filepath})`);
      }
      node = _node;
      part = parts.shift();
    }
    return node;
  }

  async getPages(filepath: string): Promise<PageDefinition[]> {
    const page = this.getNode(filepath);
    const parent = page.parent;
    if (!parent) {
      throw new Error(`No parent for ${filepath}`);
    }
    const url = page.url;
    const { children } = await parent.getPage();
    return children.map(child => ({
      ...child,
      current: child.url === url,
    }));
  }
}
