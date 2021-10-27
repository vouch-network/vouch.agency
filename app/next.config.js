module.exports = {
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // fixes Critical dependency: the request of a dependency is an expression
    // https://github.com/amark/gun/issues/743
    config.module.noParse = /(\/gun|gun\/sea)\.js$/;

    return config;
  },
};
