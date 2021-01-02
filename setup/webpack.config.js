module.exports = async () => {
    process.noDeprecation = true;

    require('../src/index');

    require(Mix.paths.mix());

    await Mix.dispatch('internal:gather-dependencies');
    await Mix.dispatch('internal:install-dependencies');
    await Mix.dispatch('init', Mix);

    return await webpackConfig.build();
};
