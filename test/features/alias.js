import test from 'ava';
import path from 'path';
import webpack from '../helpers/webpack.js';

import '../helpers/mix.js';

test('it handles resolution aliases', async t => {
    mix.alias({
        '@': './foobar'
    });

    let { config } = await webpack.compile();

    t.deepEqual(
        {
            '@': path.resolve(__dirname, '../../foobar')
        },
        config.resolve.alias
    );
});
