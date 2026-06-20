const { withAppBuildGradle } = require('expo/config-plugins');

function withAndroidCpp20(config) {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language !== 'groovy') return config;

    const cmakeBlock = `
    externalNativeBuild {
        cmake {
            arguments "-DCMAKE_CXX_STANDARD=20"
        }
    }`;

    config.modResults.contents = config.modResults.contents.replace(
      /(defaultConfig\s*\{)/,
      '$1' + cmakeBlock
    );

    return config;
  });
}

module.exports = withAndroidCpp20;
