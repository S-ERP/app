module.exports = {
  // presets: ['module:metro-react-native-babel-preset', '@babel/preset-react', ],
  presets: ['module:metro-react-native-babel-preset', '@babel/preset-react'],
  plugins: ['@babel/plugin-syntax-jsx', '@babel/plugin-proposal-export-namespace-from', ['react-native-reanimated/plugin', { processNestedWorklets: true }]],
};
