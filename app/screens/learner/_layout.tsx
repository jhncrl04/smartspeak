import { setAppToFullscreen } from "@/helper/setAppToFullscreen";
import { Stack, usePathname } from "expo-router"; // use stack instead of tabs
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

export default function Layout() {
  const pathname = usePathname();

  useEffect(() => {
    setAppToFullscreen();
  }, [pathname]);

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
