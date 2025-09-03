import COLORS from "@/constants/Colors";
import { SidebarProvider } from "@/context/sidebarContext";
import { Stack } from "expo-router";
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
