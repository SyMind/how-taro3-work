const webpack = require('webpack');
const path = require('path');
const loaderUtils = require('loader-utils');

module.exports = class SwanWebpackPlugin {
  async rewrite(compiler) {
    const { context, entry } = compiler.options;
    const appConfigPath = path.resolve(context, entry.main.import[0]);

    const appConfig = require(appConfigPath);
    const appEntry = 'app';
    const pageEntries = appConfig.pages || [];
    for (const pageEntry of [appEntry, ...pageEntries]) {
      const request = loaderUtils.urlToRequest(pageEntry);
      new webpack.EntryPlugin(
        context,
        `${require.resolve('./swanConfigFileLoader')}!${request}`,
        pageEntry
      ).apply(compiler);
    }
  }

  removeMainEntry(compilation) {
    const mainChunk = compilation.chunks.find(chunk => chunk.name === 'main');

    for (const file of mainChunk.files) {
      delete compilation.assets[file];
    }
  }

  apply(compiler) {
    compiler.hooks.run.tapPromise('SwanWebpackPlugin', theCompiler =>
      this.rewrite(theCompiler)
    );

    compiler.hooks.emit.tap('SwanWebpackPlugin', compilation => {
      this.removeMainEntry(compilation);
    });
  }
}
