const path = require('path');

const dist = path.resolve(__dirname, 'dist');  // Changed from 'src' to 'dist'

module.exports = {
  mode: 'development',
  entry: './src/index.ts',
  devtool: 'inline-source-map',
  experiments: {
    asyncWebAssembly: true // or syncWebAssembly: true if you want to use it like webpack 4 (deprecated)
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  
  resolve: {
    extensions: ['.ts', '.js']
  },
  output: {
    filename: 'index.js',
    path: dist  // Updated to 'dist'
  },
  devServer: {
    static: {
        directory: path.join(__dirname, 'src'),
    },
},
  
};
