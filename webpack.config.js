const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  mode: 'development',
  // mode: 'production',
  watch: true,
  entry: './src/app.js',
  output: {
    filename: 'js/app.min.js'
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000
  },
  module: {
    rules: [
      {
        test: /\.(s*)css$/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 6500
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new CopyPlugin([
      { from: './src/js', to: 'js' },
      { from: './src/data', to: 'data' }
    ]),
    new HtmlWebpackPlugin({
      template: './src/template/app.html',
      filename: 'index.html',
    })
  ]
}