const { withAppBuildGradle } = require('@expo/config-plugins');

const CPP20_FLAG = `/**
 * Enable C++20 support for react-native prefab headers
 */
android.defaultConfig {
    externalNativeBuild {
        cmake {
            cppFlags "-std=c++20"
        }
    }
}
`;

module.exports = function withAndroidCpp20(config) {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      if (!config.modResults.contents.includes('cppFlags "-std=c++20"')) {
        config.modResults.contents = config.modResults.contents.replace(
          'apply plugin: "com.facebook.react"',
          `apply plugin: "com.facebook.react"\n${CPP20_FLAG}`
        );
      }
    }
    return config;
  });
};
