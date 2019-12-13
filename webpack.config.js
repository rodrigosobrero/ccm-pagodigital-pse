const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

module.exports = {
  // mode: 'production',
  mode: 'development',
  entry: './src/app.js',
  output: {
    filename: 'js/app.min.js',
  },
  optimization: {
    minimizer: [
      new TerserPlugin(),
      new OptimizeCSSAssetsPlugin()
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Form',
      template: './template/app.html',
      filename: 'app.html',
      chunks: ['app']
    }),
    new MiniCSSExtractPlugin({
      filename: 'css/app.min.css'
    })
  ],
  module: {
    rules: [
      {
        test: /\.scss$/,
        loader: [
          MiniCSSExtractPlugin.loader,
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.(png|jp(e*)g|svg)$/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 8000,
            name: 'img/[name].[ext]'
          }
        }]
      }
    ]
  }
}