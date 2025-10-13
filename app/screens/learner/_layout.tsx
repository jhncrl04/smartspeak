import { Stack } from "expo-router"; // use stack instead of tabs
import React from "react";

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="index"
        options={{
          title: "Learner",
        }}
      />
      <Stack.Screen
        name="changepass"
        options={{
          title: "Change Password",
        }}
      />
    </Stack>
  );
}
