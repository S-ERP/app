const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function(env, argv) {
    
  // Asegúrate de que el modo está definido y válido
  if (!argv.mode) {
    argv.mode = 'development';  // Puedes cambiar esto a 'production' si es necesario
  }

  const config = await createExpoWebpackConfigAsync(env, argv);

  // Personaliza la configuración aquí
  config.resolve.alias['react-native$'] = 'react-native-web';
  config.resolve.alias['three'] = require.resolve('three/build/three.module.js');

  return config;
};
