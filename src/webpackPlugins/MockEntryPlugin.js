const webpack = require('webpack');

class MockEntryPlugin {
    /**
     * Prevent webpack from outputting the
     * temporary mix.js entry file.
     *
     * This file is "created" when the user hasn't
     * requested any JavaScript compilation, but
     * webpack still requires an entry.
     *
     * @param {import("webpack").Compiler} compiler
     */
    apply(compiler) {
        compiler.hooks.compilation.tap('MockEntryPlugin', compilation => {
            compilation.hooks.processAssets.tap(
                {
                    name: 'MockEntryPlugin',
                    stage: webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_COUNT
                },
                assets => {
                    for (const chunk of compilation.chunks) {
                        if (chunk.name !== 'mix') {
                            continue;
                        }

                        for (const file of chunk.files) {
                            if (file !== 'mix.js') {
                                continue;
                            }

                            delete assets['mix.js'];

                            return;
                        }
                    }
                }
            );
        });
    }
}

module.exports = MockEntryPlugin;
