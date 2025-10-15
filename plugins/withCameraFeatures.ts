import { ConfigPlugin, withAndroidManifest } from "@expo/config-plugins";

const withCameraFeatures: ConfigPlugin = (config) => {
  return withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults;
    const mainApplication = androidManifest.manifest;

    // Ensure uses-feature array exists
    if (!mainApplication["uses-feature"]) {
      mainApplication["uses-feature"] = [];
    }

    // Define feature type
    type Feature = {
      $: {
        "android:name": string;
        "android:required": string;
      };
    };

    // Add camera features if they don't exist
    const features: Feature[] = [
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

    const existingFeatures = mainApplication["uses-feature"] as Feature[];

    features.forEach((feature) => {
      const exists = existingFeatures.some(
        (f) => f.$?.["android:name"] === feature.$["android:name"]
      );
      if (!exists) {
        existingFeatures.push(feature);
      }
    });

    return config;
  });
};

export default withCameraFeatures;
