import COLORS from "@/constants/Colors";
import { SidebarProvider } from "@/context/sidebarContext";
import { setAppToFullscreen } from "@/helper/setAppToFullscreen";
import { Stack, usePathname } from "expo-router";
import { useEffect } from "react";
import { StatusBar, StyleSheet } from "react-native";

const ScreenLayout = () => {
  const styles = StyleSheet.create({
    headerContainer: {},
    title: {
      color: COLORS.accent,
      fontFamily: "Poppins",
      fontSize: 16,
      fontWeight: 600,
    },
  });

  const pathname = usePathname();

  useEffect(() => {
    setAppToFullscreen();
  }, [pathname]);

  return (
    <SidebarProvider>
      <StatusBar hidden={true} />
      {/* <StatusBar barStyle={"default"} /> */}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="messages"
          options={{
            title: "Messages",
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            title: "Settings",
          }}
        />
        <Stack.Screen name="learner" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </SidebarProvider>
  );
};

export default ScreenLayout;
