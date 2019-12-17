const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const { IgnorePlugin } = require('webpack')

const config = {
  devtool: "cheap-source-map",
  entry: ['./src/index.ts'],
  output: {
    path: __dirname + '/lib',
    filename: 'cosmos-keys.js',
    library: 'cosmos-keys',
    libraryTarget: 'umd',
    umdNamedDefine: true,
    globalObject: 'typeof self !== \'undefined\' ? self : this',
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  module: {
    rules: [
      {
        loader: 'babel-loader',
        test: /\.js$/,
        exclude: /node_modules/,
        query: {
          presets: ['@babel/preset-env']
        }
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
      reportFilename: '../bundle_analyzer/bundle_sizes.html'
    }),
    new IgnorePlugin({
      checkContext: context => context.includes('bip39/src/wordlists'),
      checkResource: resource => resource !== './english.json'
    })
  ]
}
module.exports = config
