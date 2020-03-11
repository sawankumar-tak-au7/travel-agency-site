const curruntTask = process.env.npm_lifecycle_event
const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebPackPlugin = require('html-webpack-plugin')
const fs = require('fs-extra')


const postCSSPlugins = [
  require('postcss-import'),
  require('postcss-mixins'),
  require('postcss-simple-vars'),
  require('postcss-nested'),
  require('postcss-hexrgba'),
  require('autoprefixer')
]
class RunAfterCompile {
  apply(compiler) {
    compiler.hooks.done.tap('copy iamges', function () {
      fs.copySync('./app/assets/images', './docs/assets/images')
    })
  }
}
let cssConfig = {
  test: /\.css$/i,
  use: ['css-loader', { loader: 'postcss-loader', options: { plugins: postCSSPlugins } }]
}
let config = {
  entry: './app/assets/scripts/App.js',
  plugins: [new HtmlWebPackPlugin({ filename: 'index.html', template: './app/index.html' })],
  module: {
    rules: [
      cssConfig,
    ]
  }
}

if (curruntTask == 'dev') {
  cssConfig.use.unshift('style-loader')
  config.output = {
    filename: 'bundled.js',
    path: path.resolve(__dirname, 'app')
  },
    config.devServer = {
      before: function (app, server) {
        server._watch('./app/**/*.html')
      },
      contentBase: path.join(__dirname, 'app'),
      hot: true,
      port: 3000,
      host: '0.0.0.0',
    },
    config.mode = 'development'
}


if (curruntTask == 'build') {
  config.module.rules.push()
  cssConfig.use.unshift(MiniCssExtractPlugin.loader)
  postCSSPlugins.push(require('cssnano'))
  config.output = {
    filename: '[name].[chunkhash].js',
    chunkFilename: '[name].[chunkhash].js',
    path: path.resolve(__dirname, 'docs')
  },
    config.mode = 'production',
    config.optimization = {
      splitChunks: { chunks: 'all' }
    },
    config.plugins.push(
      new CleanWebpackPlugin(),
      new MiniCssExtractPlugin({ filename: 'styles.[chunkhash].css' }),
      new RunAfterCompile()
    )
}


module.exports = config