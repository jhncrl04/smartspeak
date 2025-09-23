import COLORS from "@/constants/Colors";
import { SidebarProvider } from "@/context/sidebarContext";
import { setAppToFullscreen } from "@/helper/setAppToFullscreen";
import { Stack, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { StyleSheet } from "react-native";

const TeacherLayout = () => {
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
          name="index"
          options={{
            title: "Manage Learners",
          }}
        />
        <Stack.Screen
          name="learnerProfile"
          options={{
            title: "Learner Profile",
          }}
        />
        <Stack.Screen
          name="learnerBoard"
          options={{
            title: "Asign Cards",
          }}
        />
      </Stack>
    </SidebarProvider>
  );
};

export default TeacherLayout;
