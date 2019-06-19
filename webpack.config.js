const config = {
  devtool: "cheap-source-map",
  entry: ['./src/index.ts'],
  output: {
    path: __dirname + '/lib',
    filename: 'cosmos-keys.js',
    library: 'cosmos-keys',
    libraryTarget: 'umd',
    umdNamedDefine: true,
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
  }
}
module.exports = config;