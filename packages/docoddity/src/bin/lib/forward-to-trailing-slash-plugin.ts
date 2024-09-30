import { ViteDevServer } from "vite";

export const forwardToTrailingSlashPlugin = () => ({
  name: "forward-to-trailing-slash",
  configureServer: (server: ViteDevServer) => {
    server.middlewares.use((req, res, next: () => void) => {
      if (!req.url) {
        return next();
      }

      const requestURL = new URL(req.url, `http://${req.headers.host}`);
      if (/^\/(?:[^@]+\/)*[^@./]+$/g.test(requestURL.pathname)) {
        const redirectURL = requestURL.pathname + "/" + requestURL.search;
        res.writeHead(301, { Location: redirectURL });
        return res.end();
      }

      return next();
    });
  },
});
