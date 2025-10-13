import { withAndroidManifest } from "@expo/config-plugins";
import { ExpoConfig } from "@expo/config-types";
import { withBuildProperties } from "expo-build-properties";

export default ({ config }: { config: ExpoConfig }) => {
  // Apply build properties safely
  config = withBuildProperties(config, {
    android: {
      enableProguardInReleaseBuilds: false,
    },
  });

  // Inject tools:replace into <application>
  config = withAndroidManifest(config, (config) => {
    const mainApplication = config.modResults.manifest.application![0];
    mainApplication.$["tools:replace"] = "android:appComponentFactory";
    mainApplication.$["android:appComponentFactory"] =
      "androidx.core.app.CoreComponentFactory";
    return config;
  });

  return config;
};
