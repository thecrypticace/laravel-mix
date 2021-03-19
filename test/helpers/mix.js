import test from 'ava';
import Mix from '../../src/Mix.js';
import fs from 'fs-extra';
import '../../src/helpers.js';

test.beforeEach(() => {
    let mix = new Mix().boot().api;

    // @ts-ignore
    global.mix = mix;

    fs.ensureDirSync(`test/fixtures/app/dist`);
    mix.setPublicPath(`test/fixtures/app/dist`);
});

test.afterEach.always(t => {
    fs.removeSync(`test/fixtures/app/dist`);
});
