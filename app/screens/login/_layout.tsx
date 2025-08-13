import COLORS from "@/constants/Colors";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";

const LoginLayout = () => {
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
    <>
      <StatusBar hidden={true} />
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerTitleAlign: "center",
            headerTitle: () => (
              <View style={styles.headerContainer}>
                <Text style={styles.title}>LOG IN</Text>
              </View>
            ),
          }}
        />
      </Stack>
    </>
  );
};

export default LoginLayout;
