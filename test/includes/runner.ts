import {
  HttpServer,
} from '@ambient-labs/the_floor_is_lava'
import { DocoddityFile } from './types.js';
import { chromium, Page, } from 'playwright';

const createNewPage = (browser) => browser.newPage();

export class Runner {
  _server: HttpServer | undefined;
  _page: Page | undefined;
  files: DocoddityFile[];
  constructor(dist: string, files: DocoddityFile[]) {
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
        return this.server.close();
      } catch (err) {
        console.log('got an error');
      }
    }
    await Promise.all([
      (await this.page).close(),
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

  goto = (url: string) => this.page.goto(`${this.server.url}${url}`);
}
