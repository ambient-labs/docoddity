import { setupMap } from './setup-map.js';
import {
  HttpServer,
} from '@ambient-labs/the_floor_is_lava'
import { DocoddityTestFile } from './types.js';
import { chromium, Page, } from 'playwright';

const createNewPage = (browser) => browser.newPage();

export class Runner {
  _server: HttpServer | undefined;
  _page: Page | undefined;
  _port: number | undefined;
  startedServer = false;
  files: DocoddityTestFile[];
  constructor(dist: string, files: DocoddityTestFile[]) {
    this.files = files;
    this._server = new HttpServer({
      name: dist,
      dist,
      // port: getPort(),
    });
    // console.log('set a server!', this._server.port);
  }

  setup = async () => {
    const browser = await chromium.launch();
    this._page = await createNewPage(browser);
  }

  waitForUrl = async () => {
    // const fullURL = `${this.server.url}${url}`;
    // console.log('await: ', fullURL)
    // await this.page.waitForLoadState('networkidle');
    // , // or 'networkidle'

    await this.page.waitForNavigation();
    // await this.page.waitForURL(fullURL, {
    //   timeout,
    // });
  };

  _close = async () => {
    const closeServer = async () => {
      try {
        if (this.startedServer) {
          return await this.server.close();
        }
      } catch (err) {
        console.error('Error closing server:', err);
      }
    }
    const closePage = async () => {
      // can swallow this error
      try {
        const page = await this.page;
        await page.close();
      } catch (err) { }
    }
    await Promise.all([
      closePage(),
      closeServer(),
    ]);
  }

  get server() {
    if (!this._server) {
      throw new Error('Server is undefined');
    }

    return this._server;
  }

  get page(): Page {
    const page = this._page;
    if (!page) {
      throw new Error('Page is undefined');
    }
    return page;
  }

  startServer = async () => {
    const server = this.server;
    await server.start();
    this.startedServer = true;
    const serverURL = server.url;
    if (!serverURL) {
      throw new Error('No server url')
    }
    const page = await this.page;
    if (!page) {
      throw new Error('No page');
    }
    await page.goto(serverURL);
    return serverURL;
  }

  setPort = async (port: number) => {
    this._port = port;
    await this.page.goto(this.url);
  }

  get url() {
    if (this._port) {
      return `http://localhost:${this._port}`;
    }
    return this.server.url;
  }

  goto = async (url: string) => {
    await this.page.goto(`${this.url}${url}`);
  };
}

const { register, closeAll } = setupMap<Runner>();
export const setupRunners = () => ({
  registerRunner: register,
  closeAllRunners: () => closeAll((runner) => runner._close(), (err, runner) => {
    if (err instanceof Error) {
      console.error('error closing runner for files:', runner.files.map(f => f.filepath), err.message);
    } else {
      throw err;
    }
  }),
});
