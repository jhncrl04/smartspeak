import COLORS from "@/constants/Colors";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
    <SafeAreaView>
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
    </SafeAreaView>
  );
};

export default LoginLayout;
