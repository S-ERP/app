/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */
const path = require('path');
const { getDefaultConfig } = require('metro-config');

module.exports = (async () => {
  const {
    resolver: { sourceExts, assetExts }
  } = await getDefaultConfig();

  process.env.NODE_OPTIONS = '--max_old_space_size=16384';
  
  assetExts.push('pem');
  assetExts.push('gltf');
  assetExts.push('obj');
  assetExts.push('mtl');
  return {
    transformer: {
      babelTransformerPath: require.resolve('react-native-svg-transformer'),
      getTransformOptions: async () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: false
        }
      })
    },
    watchFolders: [
      // path.resolve(__dirname, '../../servisofts-component/dist'),
      // path.resolve(__dirname, '../../servisofts-model/dist'),
      // path.resolve(__dirname, '../../servisofts-page/dist'),
      // path.resolve(__dirname, '../../roles_permisos/library/dist'),
      // path.resolve(__dirname, '../../usuario/library/dist'),
      // path.resolve(__dirname, '../../contabilidad/library/dist'),
      // path.resolve(__dirname, '../../chat/library/dist'),
      // path.resolve(__dirname, '../../contabilidad/library/dist'),
      // path.resolve(__dirname, '../../chat/library/dist'),
      // path.resolve(__dirname, '../../spdf/library/dist'),
      // path.resolve(__dirname, '../../geolocation/library/dist'),
      // path.resolve(__dirname, '../../servisofts-charts/dist'),
      //  path.resolve(__dirname, 'C:\\servisofts\\dist')
       path.resolve(__dirname, '../../servisofts-component/dist'),
    ],
    resolver: {
      assetExts: assetExts.filter((ext) => ext !== 'svg'),
      sourceExts: [...sourceExts, 'svg'],
      extraNodeModules: new Proxy(
        {
          fs: path.resolve(__dirname, 'node_modules/react-native-fs'),
          path: path.resolve(__dirname, 'node_modules/react-native-path')
        },
        {
          get: (target, name) => {
            if (target.hasOwnProperty(name)) {
              return target[name];
            }
            return path.join(process.cwd(), `node_modules/${name}`);
          }
        }
      )
    }
  };
})();
