import test from 'ava';
import File from '../../src/File';

import webpack, { setupVueAliases } from '../helpers/webpack';

import '../helpers/mix';

test.beforeEach(() => {
    webpack.setupVueAliases(2);
});

test('it can compile using ESBuild instead of Babel', async t => {
    mix.esbuild();
    mix.js('test/fixtures/app/src/js/app.js', 'js/app.js');

    await webpack.compile();

    t.true(File.exists(`test/fixtures/app/dist/js/app.js`));
});

test('it can compile using ESBuild and Vue', async t => {
    setupVueAliases(3);

    mix.esbuild();
    mix.vue({ version: 3 });
    mix.js('test/fixtures/app/src/vue3/app-with-vue-and-css.js', 'js/app.js');

    await webpack.compile();

    t.true(File.exists(`test/fixtures/app/dist/js/app.js`));
});
