import COLORS from "@/constants/Colors";
import { Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

const SignupLayout = () => {
  const styles = StyleSheet.create({
    headerContainer: {},
    title: {
      color: COLORS.accent,
      fontFamily: "Poppins",
      fontSize: 18,
      fontWeight: 600,
    },
  });

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerTitleAlign: "center",
          headerTitle: () => (
            <View style={styles.headerContainer}>
              <Text style={styles.title}>SIGN UP</Text>
            </View>
          ),
        }}
      />

      <Stack.Screen
        name="personalDetails"
        options={{
          headerTitleAlign: "center",
          headerTitle: () => (
            <View style={styles.headerContainer}>
              <Text style={styles.title}>PERSONAL DETAILS</Text>
            </View>
          ),
        }}
      />

      <Stack.Screen
        name="credentials"
        options={{
          headerTitleAlign: "center",
          headerTitle: () => (
            <View style={styles.headerContainer}>
              <Text style={styles.title}>LOG IN DETAILS</Text>
            </View>
          ),
        }}
      />
    </Stack>
  );
};

export default SignupLayout;
