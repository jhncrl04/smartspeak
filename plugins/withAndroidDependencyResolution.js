const { withBuildGradle } = require("@expo/config-plugins");

module.exports = function withAndroidDependencyResolution(config) {
  return withBuildGradle(config, async (config) => {
    const buildGradle = config.modResults.contents;

    const resolutionBlock = `
allprojects {
    repositories {
        google()
        mavenCentral()
    }
    configurations.all {
        resolutionStrategy {
            // Force AndroidX versions
            force 'androidx.core:core:1.16.0'
            force 'androidx.appcompat:appcompat:1.6.1'
            force 'androidx.localbroadcastmanager:localbroadcastmanager:1.0.0'
            force 'androidx.versionedparcelable:versionedparcelable:1.1.1'
            force 'androidx.customview:customview:1.1.0'
            
            // Exclude all old support libraries
            exclude group: 'com.android.support'
        }
    }
}
`;

    // Insert the resolution block at the end of the buildscript block
    if (!buildGradle.includes("resolutionStrategy")) {
      config.modResults.contents = buildGradle + "\n" + resolutionBlock;
    }

    return config;
  });
};
