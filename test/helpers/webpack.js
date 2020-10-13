import webpack from 'webpack';
import { createFsFromVolume, Volume } from 'memfs';

import File from '../../src/File';

/**
 *
 * @returns {import("webpack").Configuration}
 */
export function buildConfig() {
    Mix.dispatch('init');

    return webpackConfig.build();
}

/**
 *
 * @param {import("webpack").Configuration|null} config
 */
export async function compile(config) {
    config = config || buildConfig();

    const vol = new Volume();
    const fs = createFsFromVolume(vol);

    File.useFileSystem(fs);

    return new Promise((resolve, reject) => {
        const compiler = webpack(config);

        // compiler.inputFileSystem = fs;
        compiler.outputFileSystem = fs;

        compiler.run((err, stats) => {
            if (err) {
                reject({ config, err, stats });
            } else if (stats.hasErrors()) {
                const { errors } = stats.toJson({ errors: true });

                reject(new Error(errors.map(error => error.message).join('\n')));
            } else {
                resolve({ config, err, stats });
            }
        });
    });
}

export function setupVueAliases(version) {
    let mockRequire = require('mock-require');

    const vueModule = version === 3 ? 'vue3' : 'vue2';
    const vueLoaderModule = version === 3 ? 'vue-loader16' : 'vue-loader15';

    mockRequire('vue', vueModule);
    mockRequire('vue-loader', vueLoaderModule);

    mix.alias({ vue: require.resolve(vueModule) });

    mix.webpackConfig({
        resolveLoader: {
            alias: {
                'vue-loader': vueLoaderModule
            }
        }
    });
}

export default { buildConfig, compile, setupVueAliases };
