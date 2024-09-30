import path from 'path';
import { ViteDevServer } from "vite";
import { exists } from "./utils/fs.js";

export const forwardToTrailingSlashPlugin = (targetDir: string) => ({
  name: "forward-to-trailing-slash",
  configureServer: (server: ViteDevServer) => {
    server.middlewares.use(async (req, res, next: () => void) => {
      if (!req.url) {
        return next();
      }

      const requestURL = new URL(req.url, `http://${req.headers.host}`);
      if (/^\/(?:[^@]+\/)*[^@./]+$/g.test(requestURL.pathname)) {
        const fullPath = path.resolve(targetDir, `${requestURL.pathname.slice(1)}.html`);
        if (!await exists(fullPath)) {
          const redirectURL = requestURL.pathname + "/" + requestURL.search;
          // console.log('redirect | this file does not exist:', fullPath, 'original url:', requestURL.pathname, 'redirect url:', redirectURL);
          res.writeHead(301, { Location: redirectURL });
          return res.end();
        }
        // console.log('do not redirect', fullPath)
      }

      return next();
    });
  },
});
