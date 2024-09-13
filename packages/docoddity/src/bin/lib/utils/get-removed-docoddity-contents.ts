import type {
  DocoddityContents
} from "../types.js";

const getUniqueIDsForTags = ({ head = [], body = [] }: DocoddityContents = {}) => new Set<string>([...head, ...body].map(c => JSON.stringify(c)));
export function* getRemovedDocoddityContents(nextDocoddity: DocoddityContents, prevDocoddity: DocoddityContents = {}) {
  const prev = getUniqueIDsForTags(prevDocoddity);
  const next = getUniqueIDsForTags(nextDocoddity);
  for (const file of prev) {
    if (!next.has(file)) {
      yield file;
    }
  }
}
