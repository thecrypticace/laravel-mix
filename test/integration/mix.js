import test from 'ava';
import Koa from 'koa';
import serveFilesFrom from 'koa-static';
import { chromium } from 'playwright';
import webpack, { setupVueAliases } from '../helpers/webpack';

import '../helpers/mix';

/** @type {import("playwright").Browser} */
let browser;

/** @type {import("http").Server} */
let server;

test.before(async () => {
    browser = await chromium.launch();

    const app = new Koa();
    app.use(serveFilesFrom('test/fixtures/integration/dist'));
    server = app.listen(1337);
});

test.after.always(async () => {
    browser && (await browser.close());
    server && server.close();
});

test.beforeEach(() => {
    mix.setPublicPath('test/fixtures/integration/dist');
    mix.vue();
    mix.react();
    mix.options({
        fileLoaderOptions: {
            esModules: false
        }
    });
});

test('compiling just js', async t => {
    mix.js('test/fixtures/integration/src/js/app.js', 'js/app.js');

    await webpack.compile();
    await assertProducesLogs(t, ['loaded: app.js']);
});

test('compiling js and css together', async t => {
    mix.js('test/fixtures/integration/src/js/app.js', 'js/app.js');
    mix.sass('test/fixtures/integration/src/css/app.scss', 'css/app.css');
    mix.postCss('test/fixtures/integration/src/css/app.css', 'css/app.css');

    await webpack.compile();
    await assertProducesLogs(t, [
        'loaded: app.js',
        'run: app.js',
        'loaded: dynamic.js',
        'run: dynamic.js',
        'style: rgb(255, 119, 0)',
        'style: rgb(119, 204, 51)',
        'asset image size: 200x200'
    ]);
});

test('node browser polyfills: enabled', async t => {
    mix.js('test/fixtures/integration/src/js/app.js', 'js/app.js');

    await webpack.compile();
    await assertProducesLogs(t, [
        'node-polyfill: Buffer function',
        'node-polyfill: Buffer.from function',
        'node-polyfill: process object',
        'node-polyfill: process.env object',
        'node-polyfill: process.env.NODE_ENV string = test'
    ]);
});

test('node browser polyfills: disabled', async t => {
    mix.js('test/fixtures/integration/src/js/app.js', 'js/app.js');
    mix.options({ legacyNodePolyfills: false });

    await webpack.compile();
    await assertProducesLogs(t, [
        'node-polyfill: Buffer undefined',
        'node-polyfill: Buffer.from undefined',
        'node-polyfill: process undefined',
        'node-polyfill: process.env undefined',
        'node-polyfill: process.env.NODE_ENV string = test'
    ]);
});

/**
 * @param {import('ava').Assertions} t
 * @param {string[]} logs
 **/
async function assertProducesLogs(t, logs) {
    const uri = `http://localhost:1337/index.html`;

    // Verify in the browser
    const page = await browser.newPage();

    page.on('request', req => {
        console.log(`[browser request] `, req.url());
    });

    page.on('console', msg =>
        console.log(`[browser console] ${msg.type()}: ${msg.text()}`)
    );

    await Promise.all([
        ...logs.map(log =>
            page.waitForEvent('console', {
                predicate: msg => msg.text() === log,
                timeout: 1000
            })
        ),
        page.goto(uri)
    ]);

    t.pass();
}
