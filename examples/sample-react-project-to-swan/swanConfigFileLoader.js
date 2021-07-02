const path = require('path')
const fs = require('fs-extra');
const webpack = require('webpack');
const Module = require('module');

const resolveConfigPath = async (entrypoint, context, exts = ['.js']) => {
  const expectConfigFiles = ['.json', ...exts.map(ext => `.config${ext}`)].map(ext => entrypoint + ext);
  const files = await fs.readdir(context);
  for (const file of files) {
    const stats = await fs.stat(file);
    if (stats.isFile() && expectConfigFiles.includes(file)) {
      return path.join(context, file);
    }
  }
}

const CHILD_FILENAME = 'SwanConfigFilename';

const loadConfigSourceByChildCompiler = async (configPath, context, parentCompilation) =>
  new Promise((resolve, reject) => {
    const configCompiler = parentCompilation.createChildCompiler(
      'SwanConfigCompiler',
      {
        filename: CHILD_FILENAME,
        publicPath: '/',
      },
      [
        // add `.config.js` as entry
        new webpack.EntryPlugin(context, configPath, 'SwanConfigEntry'),
        // should export commonjs2 bundle
        new webpack.LibraryTemplatePlugin('SwanLibraryTemplatePlugin', 'commonjs2'),
      ],
    );

    configCompiler.hooks.afterCompile.tap('SwanConfigPlugin', compilation => {
      if (compilation.errors.length) {
        for (const error of compilation.errors) {
          throw error;
        }
      }
      if (!compilation.assets[CHILD_FILENAME]) {
        throw new Error(
          'Cannot found app config source in assets of GojiConfigPlugin. This might be an internal error in GojiJS.',
        );
      }
      // resolve source code before remove it
      resolve(compilation.assets[CHILD_FILENAME].source());
  
      // remove all chunk assets before emit
      compilation.chunks.forEach(chunk => {
        chunk.files.forEach(file => {
          delete compilation.assets[file];
        });
      });
    });

    configCompiler.runAsChild(err => {
      if (err) {
        reject(err);
      }
    });
  });

const exec = (code, filename, context) => {
  const module = new Module(filename, undefined);
  module.paths = Module._nodeModulePaths(context);
  module.filename = filename;
  module._compile(code, filename);

  return module.exports;
};

const getDefaultExport = exportsObject => exportsObject.__esModule ? exportsObject.default : exportsObject;

module.exports = async function SwanConfigFileLoader(source) {
  const { resourcePath } = this;
  const configInputContext = path.dirname(resourcePath);
  const configInputPath = await resolveConfigPath(
    // remove ext `page.tsx` => `page`
    path.basename(resourcePath, path.extname(resourcePath)),
    configInputContext,
    this._compiler.options.resolve.extensions,
  );
  this.addDependency(configInputPath);

  const configSource = await loadConfigSourceByChildCompiler(
    configInputPath,
    this.context,
    this._compilation,
  );
  const jsConetent = exec(configSource, 'SwanVM/file', 'SwanVM');
  const configOutput = getDefaultExport(jsConetent);
  // const relativeConfigPath = path.relative(rootContext, configOutputPath);
  this.emitFile('hello.js', JSON.stringify(configOutput))
  return source;
};
