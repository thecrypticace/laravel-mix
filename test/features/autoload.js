import test from 'ava';
import webpack from '../helpers/webpack.js';

import '../helpers/mix.js';

test('it handles library autoloading', async t => {
    mix.autoload({
        jquery: ['$', 'window.jQuery'],
        'lodash.map': '_map'
    });

    let { config } = await webpack.compile();

    let providePlugin = config.plugins.find(
        plugin => plugin.constructor.name === 'ProvidePlugin'
    );

    t.deepEqual(
        {
            $: 'jquery',
            'window.jQuery': 'jquery',
            _map: ['lodash', 'map']
        },
        providePlugin.definitions
    );
});
