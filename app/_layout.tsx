import COLORS from "@/constants/Colors";
import { SignupFormProvider } from "@/context/signupContext";
import { setAppToFullscreen } from "@/helper/setAppToFullscreen";
import { useFonts } from "expo-font";
import { Stack, usePathname } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { StatusBar } from "expo-status-bar";
import { View } from "moti";
import { useEffect } from "react";
import { StyleSheet, Text } from "react-native";
import { setCustomText } from "react-native-global-props";
import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";

// SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const pathname = usePathname();

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

    setAppToFullscreen();
  }, [pathname]);

  // setting default font, working on web but not on android
  const [fontsLoaded] = useFonts({
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
  });

  if (!fontsLoaded) {
    return null; // Or a splash/loading screen
  }

  setCustomText({
    style: {
      fontFamily: "Poppins-Light",
    },
  });

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
    <SignupFormProvider>
      <StatusBar hidden={true} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="index"
          options={{
            title: "Landing Page",
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="login"
          options={{
            headerTitleAlign: "center",
            headerTitle: () => (
              <View style={styles.headerContainer}>
                <Text style={styles.title}>LOG IN</Text>
              </View>
            ),
            headerShown: true,
          }}
        />

        <Stack.Screen
          name="registration"
          options={{
            headerTitleAlign: "center",
            headerTitle: () => (
              <View style={styles.headerContainer}>
                <Text style={styles.title}>SIGN UP</Text>
              </View>
            ),
            headerShown: true,
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
            headerShown: true,
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
            headerShown: true,
          }}
        />

        <Stack.Screen
          name="otpVerification"
          options={{
            headerTitleAlign: "center",
            headerTitle: () => (
              <View style={styles.headerContainer}>
                <Text style={styles.title}>OTP VERIFICATION</Text>
              </View>
            ),
            headerShown: true,
          }}
        />

        <Stack.Screen
          name="accountVerification"
          options={{
            headerTitleAlign: "center",
            headerTitle: () => (
              <View style={styles.headerContainer}>
                <Text style={styles.title}>ACCOUNT VERIFICATION</Text>
              </View>
            ),
            headerShown: true,
          }}
        />

        <Stack.Screen
          name="forgotPassword"
          options={{
            headerTitleAlign: "center",
            headerTitle: () => (
              <View style={styles.headerContainer}>
                <Text style={styles.title}>RECOVER MY ACCOUNT</Text>
              </View>
            ),
            headerShown: true,
          }}
        />
      </Stack>
      <Toast config={toastConfig} />
    </SignupFormProvider>
  );
};

const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: COLORS.successBg,
        backgroundColor: COLORS.pureWhite,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 16,
        fontFamily: "Poppins",
        fontWeight: "600",
        color: COLORS.accent,
      }}
      text2Style={{
        fontSize: 14,
        fontFamily: "Poppins",
        fontWeight: "500",
      }}
    />
  ),

  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: COLORS.errorBg,
        backgroundColor: COLORS.pureWhite,
      }}
      text1Style={{
        fontSize: 16,
        fontFamily: "Poppins",
        fontWeight: "600",
        color: COLORS.accent,
      }}
      text2Style={{
        fontSize: 14,
        fontFamily: "Poppins",
        fontWeight: "500",
      }}
    />
  ),
};

export default RootLayout;
