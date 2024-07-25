module.exports = {
  // presets: ['module:metro-react-native-babel-preset', '@babel/preset-react', ],
  presets: ['module:metro-react-native-babel-preset', '@babel/preset-react', '@babel/preset-flow',],
  plugins: ['@babel/plugin-syntax-jsx', '@babel/plugin-proposal-export-namespace-from', "@babel/plugin-transform-modules-commonjs", ['react-native-reanimated/plugin', { globals: ["__scanCodes"], processNestedWorklets: true }]],
};
