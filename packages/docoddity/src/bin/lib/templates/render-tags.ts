import {
  isTagDefinition,
  type ValidTagForTemplateRendering,
  type ValidTagValue,
  type TagDefinitionWithStringContent,
} from "../types.js";

const renderAttribute = ([key, value]: [string, ValidTagValue]) => {
  if (['href', 'src'].includes(key)) {
    if (typeof value !== 'string') {
      throw new Error(`Invalid value for ${key}: ${value}`);
    }
    // if (!value.startsWith('http') && !value.startsWith('/')) {
    //   if (value.startsWith('./')) {
    //     return [key, JSON.stringify(value.slice(1))].join('=');
    //   }
    //   return [key, JSON.stringify(`/${value}`)].join('=');
    // }
  }
  return [key, JSON.stringify(value)].join('=');
};

const renderAttributes = (
  tag: Omit<TagDefinitionWithStringContent, 'content' | 'tag'>
) => Object.entries(tag).map(renderAttribute).join(' ');

const renderTag = (tag: ValidTagForTemplateRendering | string) => isTagDefinition(tag) ? renderTagDefinition(tag) : tag;

const renderTagDefinition = ({ tag: tagName, content = '', ...tag }: ValidTagForTemplateRendering) => {
  if (tagName === 'link') {
    if (content) {
      throw new Error(`Link tags should not have content: ${JSON.stringify(tag)}`);
    }
    return `<${tagName} ${renderAttributes(tag)}>`;
  }
  return `<${tagName} ${renderAttributes(tag)}>${content}</${tagName}>`;
};

const indent = Array(4).fill(' ').join("");

export const renderTags = (tags: (string | TagDefinitionWithStringContent)[] = []) => {
  return tags.map(renderTag).map(line => `${indent}${line}`).join('\n');
};
