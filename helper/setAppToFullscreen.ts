import * as NavigationBar from "expo-navigation-bar";

export const setAppToFullscreen = async () => {
  await NavigationBar.setVisibilityAsync("hidden");
  // await NavigationBar.setBackgroundColorAsync("#fff");
};
