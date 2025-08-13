import COLORS from "@/constants/Colors";
import { SidebarProvider } from "@/context/sidebarContext";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
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
