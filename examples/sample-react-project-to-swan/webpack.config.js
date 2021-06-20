const path = require('path');
const SwanWebpackPlugin = require('./swanWebpackPlugin')

module.exports = {
  mode: 'development',
  entry: './app.config.js',
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      }
    ]
  },
  resolve: {
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
  },
  plugins: [
    new SwanWebpackPlugin()
  ]
};
