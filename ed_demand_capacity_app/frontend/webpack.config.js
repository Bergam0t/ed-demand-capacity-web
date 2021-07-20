const path = require("path");
const webpack = require("webpack");

module.exports = {
  context: __dirname + '/src',
  entry: "./index.js",
  output: {
    path: path.resolve(__dirname, "./static/frontend"),
    filename: "[name].js",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"]
      },
    ],
  },
  optimization: {
    minimize: true,
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
        // This has effect on the react lib size
        NODE_ENV: JSON.stringify("development"),
      },
    }),
  ],
  resolve: {    
    modules: [
      /* assuming that one up is where your node_modules sit,
         relative to the currently executing script
      */
      path.join(__dirname, '../../node_modules')
    ]
  }
};