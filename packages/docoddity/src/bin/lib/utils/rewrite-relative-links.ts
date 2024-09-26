import path from 'path';
export const rewriteRelativeLinks = (content: string, sourceDir: string) => {
  return content.replace(
    /(?<=<(?:script|link)\s+(?:[^>]*?\s+)?(?:src|href)=")(?!https?:\/\/)(.*?)(?=")/gi,
    (match, p1) => {
      if (p1.startsWith("/")) {
        return p1;
      };
      return path.resolve(sourceDir, p1);
    }
  );
};
