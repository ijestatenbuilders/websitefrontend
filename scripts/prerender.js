const fs = require('node:fs/promises');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const outputDirectory = path.join(root, 'build');
const routes = [
  '/',
  '/listings',
  '/about',
  '/contact',
  '/commercial/business-bay',
  '/commercial/generic',
  '/virtual-3d',
  '/forums',
];

async function prerender() {
  const { preview } = await import('vite');
  const puppeteerModule = await import('puppeteer');
  const server = await preview({
    configFile: path.join(root, 'vite.config.mjs'),
    preview: { host: '127.0.0.1', port: 0, strictPort: true },
  });
  let browser;

  try {
    const address = server.httpServer.address();
    if (!address || typeof address === 'string') {
      throw new Error('Vite preview did not expose a local TCP port');
    }

    browser = await puppeteerModule.default.launch({
      headless: true,
      pipe: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    const pageErrors = [];
    await page.setUserAgent('ReactSnap');
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      const { hostname } = new URL(request.url());
      if (hostname === '127.0.0.1' || hostname === 'localhost') {
        request.continue();
      } else {
        request.abort();
      }
    });
    page.on('pageerror', (error) => pageErrors.push(error));

    let rootHtml;
    for (const route of routes) {
      const response = await page.goto(`http://127.0.0.1:${address.port}${route}`, {
        waitUntil: 'networkidle2',
        timeout: 45000,
      });
      if (!response || !response.ok()) {
        throw new Error(`Could not prerender ${route}: HTTP ${response?.status() ?? 'no response'}`);
      }
      await page.waitForFunction(
        () => document.querySelector('#root')?.children.length > 0,
        { timeout: 20000 },
      );
      if (pageErrors.length) {
        throw new Error(`Browser error while prerendering ${route}: ${pageErrors[0].message}`);
      }

      const relativePath = route === '/' ? 'index.html' : path.join(route.slice(1), 'index.html');
      const outputPath = path.join(outputDirectory, relativePath);
      const html = await page.content();
      if (route === '/') {
        rootHtml = html;
        console.log(`Prerendered ${route}`);
        continue;
      }

      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.writeFile(outputPath, html, 'utf8');
      console.log(`Prerendered ${route}`);
    }
    if (!rootHtml) throw new Error('The root route was not prerendered');
    await fs.writeFile(path.join(outputDirectory, 'index.html'), rootHtml, 'utf8');
  } finally {
    if (browser) await browser.close();
    await server.close();
  }
}

prerender().catch((error) => {
  console.error('Prerender failed:', error);
  process.exitCode = 1;
});
