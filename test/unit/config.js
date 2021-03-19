import config from '../../src/config.js';
import test from 'ava';
import Mix from '../../src/Mix.js';

test('that it can merge config', t => {
    let Config = config(new Mix());

    Config.merge({
        versioning: true,
        foo: 'bar'
    });

    t.is('bar', Config.foo);
    t.true(Config.versioning);
});
