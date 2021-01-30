/**
 *
 * @param {object} param0
 * @param {string} param0.publicPath
 * @param {string|null} param0.dir
 * @param {RegExp|null} param0.replacer
 * @param {boolean} param0.esModules
 */
function configureFileLoader({ publicPath, dir, replacer, esModules }) {
    return {
        loader: 'file-loader',
        options: {
            esModules,

            name: path => {
                if (dir === null) {
                    return `[name].[ext]?[hash]`;
                }

                if (!/node_modules|bower_components/.test(path)) {
                    return `${dir}/[name].[ext]?[hash]`;
                }

                path = path.replace(/\\/g, '/').replace(replacer, '');

                return `${dir}/vendor/${path}?[hash]`;
            },

            publicPath
        }
    };
}

module.exports = function () {
    /** @type {ReturnType<import("../config.js")>} */
    const config = Config;

    let rules = [];

    // Add support for loading HTML files.
    rules.push({
        test: /\.html$/,
        resourceQuery: { not: [/\?vue/i] },
        use: [{ loader: 'html-loader' }]
    });

    // Add support for loading images.
    rules.push({
        // only include svg that doesn't have font in the path or file name by using negative lookahead
        test: /(\.(png|jpe?g|gif|webp)$|^((?!font).)*\.svg$)/,
        use: [
            configureFileLoader({
                dir: config.fileLoaderDirs.images,
                replacer: /((.*(node_modules|bower_components))|images|image|img|assets)\//g,
                publicPath: config.resourceRoot,
                esModules: config.fileLoaderOptions.esModules
            }),

            {
                loader: 'img-loader',
                options: config.imgLoaderOptions
            }
        ]
    });

    // Add support for loading fonts.
    rules.push({
        test: /(\.(woff2?|ttf|eot|otf)$|font.*\.svg$)/,
        use: [
            configureFileLoader({
                dir: config.fileLoaderDirs.fonts,
                replacer: /((.*(node_modules|bower_components))|fonts|font|assets)\//g,
                publicPath: config.resourceRoot,
                esModules: config.fileLoaderOptions.esModules
            })
        ]
    });

    // Add support for loading cursor files.
    rules.push({
        test: /\.(cur|ani)$/,
        use: [
            configureFileLoader({
                dir: null,
                replacer: null,
                publicPath: config.resourceRoot,
                esModules: config.fileLoaderOptions.esModules
            })
        ]
    });

    return rules;
};
