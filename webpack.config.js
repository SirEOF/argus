const path = require('path')
const webpack = require('webpack')

const CompressionPlugin = require('compression-webpack-plugin')
const UglifyJavaScriptPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
  entry: [
    'webpack-hot-middleware/client',
    path.join(__dirname, 'src/client/index.js')
  ],
  output: {
    path: path.join(__dirname, 'src/server/public/javascripts/'),
    filename: 'app.bundle.js'
  },
  resolve: {
    extensions: ['.js', '.vue'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    }
  },
  module: {
    loaders: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]?[hash]'
        }
      },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'url-loader'
      },
      {
        test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'file-loader'
      }
    ]
  },
  plugins: [
    new CompressionPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: /\.js$|\.css$|\.html$/
    })
  ],
  devtool: '#eval-source-map',
  devServer: {
    historyApiFallback: true,
    noInfo: true,
    overlay: true
  }
}

if (process.env.NODE_ENV === 'development') {
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.HotModuleReplacementPlugin()
  ])
}

if (process.env.NODE_ENV === 'production') {
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV)
      }
    }),
    new UglifyJavaScriptPlugin({
      uglifyOptions: {
        ecma: 8,
        compress: true,
        warnings: true,
        output: {
          comments: false,
          beautify: false
        }
      }
    }),
    new webpack.optimize.AggressiveMergingPlugin()
  ])
}
