import React from 'react';
import { Stack } from 'expo-router'; // use stack instead of tabs

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // hides the top header too
      }}
    />
  );
}
