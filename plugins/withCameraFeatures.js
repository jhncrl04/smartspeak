const { withAndroidManifest } = require("@expo/config-plugins");

const withCameraFeatures = (config) => {
  return withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults;
    const mainApplication = androidManifest.manifest;

    if (!mainApplication["uses-feature"]) {
      mainApplication["uses-feature"] = [];
    }

    const features = [
      {
        $: {
          "android:name": "android.hardware.camera",
          "android:required": "false",
        },
      },
      {
        $: {
          "android:name": "android.hardware.camera.front",
          "android:required": "false",
        },
      },
      {
        $: {
          "android:name": "android.hardware.camera.autofocus",
          "android:required": "false",
        },
      },
    ];

    features.forEach((feature) => {
      const exists = mainApplication["uses-feature"].some(
        (f) => f.$?.["android:name"] === feature.$["android:name"]
      );
      if (!exists) {
        mainApplication["uses-feature"].push(feature);
      }
    });

    return config;
  });
};

module.exports = withCameraFeatures;
