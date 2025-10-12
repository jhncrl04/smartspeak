import COLORS from "@/constants/Colors";
import { SidebarProvider } from "@/context/sidebarContext";
import { Stack } from "expo-router";
import { StatusBar, StyleSheet } from "react-native";

const GuardianLayout = () => {
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
      <StatusBar hidden={true} translucent={true} />
      {/* <StatusBar barStyle={"default"} /> */}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="index"
          options={{
            title: "Child Management",
          }}
        />
        <Stack.Screen
          name="manageBoards"
          options={{ title: "Manage Categories" }}
        />
        <Stack.Screen name="manageCards" options={{ title: "Manage Cards" }} />
        <Stack.Screen
          name="user/[userId]"
          options={{
            animation: "none", // or "fade", "slide_from_right"
          }}
        />
      </Stack>
    </SidebarProvider>
  );
};

export default GuardianLayout;
