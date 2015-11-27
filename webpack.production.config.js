var path = require('path');
var webpack = require('webpack');
var node_modules_dir = path.resolve(__dirname, 'node_modules');

module.exports = {
  entry: {
    app: './app/index'
  },
  output: {
    path: path.join(__dirname, 'dist/public/static'),
    filename: 'bundle.js',
    publicPath: '/static/'
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loaders: ['babel?presets[]=react,presets[]=es2015,presets[]=stage-0'
      ],
      include: path.join(__dirname, 'app')
    }]
  }
};
