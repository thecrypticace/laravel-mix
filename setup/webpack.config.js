const { assertSupportedNodeVersion } = require('../src/Engine');

module.exports = async () => {
    assertSupportedNodeVersion();

    const mix = require('../src/Mix').primary;

    try {
        require(mix.paths.mix());
    } catch (err) {
        if (err.code === 'ERR_REQUIRE_ESM') {
            const mod = await import(mix.paths.mix());

            if (typeof mod.default === 'function') {
                await mod.default(mix.api);
            }
        }
    }

    await mix.installDependencies();
    await mix.init();

    return mix.build();
};
