import COLORS from "@/constants/Colors";
import { Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

const LoginLayout = () => {
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
              <Text style={styles.title}>LOG IN</Text>
            </View>
          ),
        }}
      />
    </Stack>
  );
};

export default LoginLayout;
