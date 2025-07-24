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
      <StatusBar hidden={true} />
      {/* <StatusBar barStyle={"default"} /> */}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="index"
          options={{
            title: "Child Management",
          }}
        />
        <Stack.Screen
          name="childProfile"
          options={{ title: "Child Profile" }}
        />
      </Stack>
    </SidebarProvider>
  );
};

export default GuardianLayout;
