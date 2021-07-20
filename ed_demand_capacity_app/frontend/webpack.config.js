const path = require("path");
const webpack = require("webpack");

module.exports = {
  context: __dirname + '/src/',
  entry: './index.js',
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
  // https://stackoverflow.com/questions/66772358/webpack-warning-warning-in-defineplugin-conflicting-values-for-process-env-no
  // plugins: [
  //   new webpack.DefinePlugin({
  //     "process.env": {
  //       // This has effect on the react lib size
  //       NODE_ENV: JSON.stringify("production"),
  //     },
  //   }),
  // ],
  resolve: {
    roots: [
      __dirname,
      path.resolve(__dirname, "/src/"),
      path.resolve(__dirname, "/frontend/"),
      path.resolve(__dirname, "/ed_demand_capacity_app/frontend/src/"),
      path.resolve(__dirname, "/ed_demand_capacity_app/frontend/"),
      path.resolve(__dirname, "/ed_demand_capacity_app/"),
  ],    
    modules: [
      /* assuming that one up is where your node_modules sit,
         relative to the currently executing script
      */
     'node_modules',
      path.join(__dirname, '../node_modules'),
      path.join(__dirname, '../../node_modules')
    ],
    extensions: ['.js'],
  }
};