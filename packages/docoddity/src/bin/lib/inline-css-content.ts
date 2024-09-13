import fs from 'fs';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url))
export const inlineCSSContent = () => ({
  name: 'html-transform',
  transformIndexHtml(html: string): string {
    return html.replace(
      /(<link\s+.*?href=")([^"]+)(".*?media="[^"]+"\s*>)/g,
      (match: string, p1: string, p2: string, p3: string): string => {
        const filePath = path.resolve(__dirname, p2);
        try {
          if (fs.existsSync(filePath)) {
            const cssContent = fs.readFileSync(filePath, 'utf-8');
            const encodedCSS = Buffer.from(cssContent).toString('base64');
            const dataURL = `data:text/css;base64,${encodedCSS}`;
            return `${p1}${dataURL}${p3}`;
          }
        } catch (error) {
          console.error(`Error reading file: ${filePath}`, error);
        }
        return match;
      }
    );
  },
});
