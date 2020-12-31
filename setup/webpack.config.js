module.exports = async () => {
    process.noDeprecation = true;

    require('../src/index');

    try {
        require(Mix.paths.mix());
    } catch (err) {
        console.error(
            `There was an error loading your Laravel Mix config file (${Mix.paths.mix()})`
        );
        console.error(err);
    }

    await Mix.dispatch('internal:gather-dependencies');
    await Mix.dispatch('internal:install-dependencies');
    await Mix.dispatch('init', Mix);

    return await webpackConfig.build();
};
