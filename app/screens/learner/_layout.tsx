import { Stack } from "expo-router"; // use stack instead of tabs
import { StatusBar } from "expo-status-bar";

export default function Layout() {
  return (
    <>
      <StatusBar hidden={true} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ title: "Homepage" }} />
        <Stack.Screen
          name="changepass"
          options={{ title: "Change Password" }}
        />
        <Stack.Screen name="profile" options={{ title: "Profile" }} />
      </Stack>
    </>
  );
}
