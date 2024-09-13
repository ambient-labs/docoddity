import {
  getFnToGetTagForTemplateRendering
} from "./get-tag-for-template-rendering.js";
import {
  DocoddityContents
} from "../types.js";

export const buildTagArgs = async (
  {
    head = [],
    body = [],
    ...rest
  }: DocoddityContents,
  ...args: Parameters<typeof getFnToGetTagForTemplateRendering>
) => {
  const getTagForTemplateRenderingForDocoddity = getFnToGetTagForTemplateRendering(...args);
  return {
    ...rest,
    head: await Promise.all(head.map(getTagForTemplateRenderingForDocoddity)),
    body: await Promise.all(body.map(getTagForTemplateRenderingForDocoddity)),
  };
}
