const path = require("path");
 
module.exports = {
  mode: "development",
  entry: path.resolve(__dirname, "src/index.ts"),
  output: {
    path: path.resolve(__dirname),
    filename: "./dist/index.js",
  },
  resolve: {
    extensions: [".ts"],
    alias: {
      "token": path.resolve(__dirname, "src/token"),
      "element": path.resolve(__dirname, "src/element"),
      "shared": path.resolve(__dirname, "src/shared")
    },
  },
  target: "node",
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: "ts-loader",
          options: {
            configFile: path.resolve(__dirname, "tsconfig.json"),
          },
        },
      },
    ],
  },
};