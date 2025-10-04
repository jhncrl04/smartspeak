import COLORS from "@/constants/Colors";
import { SignupFormProvider } from "@/context/signupContext";
import { setAppToFullscreen } from "@/helper/setAppToFullscreen";
import { useCardsStore } from "@/stores/cardsStore";
import { useCategoriesStore } from "@/stores/categoriesStores";
import {
  useGradeLevelsStore,
  useSectionsStore,
} from "@/stores/gradeSectionsStore";
import { useAuthStore } from "@/stores/userAuthStore";
import { useUsersStore } from "@/stores/userStore";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { StatusBar } from "expo-status-bar";
import { View } from "moti";
import { useEffect } from "react";
import { StyleSheet, Text } from "react-native";
import { setCustomText } from "react-native-global-props";
import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";

// SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const user = useAuthStore((state) => state.user);
  const startCardsListener = useCardsStore((state) => state.startListener);
  const stopCardsListener = useCardsStore((state) => state.stopListener);
  const startCategoriesListener = useCategoriesStore(
    (state) => state.startListener
  );
  const stopCategoriesListener = useCategoriesStore(
    (state) => state.stopListener
  );
  const startUsersListener = useUsersStore((state) => state.startListener);
  const stopUsersListener = useUsersStore((state) => state.stopListener);
  const startSectionsListner = useSectionsStore((state) => state.startListener);
  const stopSectionsListener = useSectionsStore((state) => state.stopListener);
  const startGradeLevelsListener = useGradeLevelsStore(
    (state) => state.startListener
  );
  const stopGradeLevelsListener = useGradeLevelsStore(
    (state) => state.stopListener
  );

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

    setAppToFullscreen();

    if (!user?.uid || !user?.role) return;

    const role = user.role.toLowerCase();

    if (user?.uid && user?.role) {
      // Start all listeners when user logs in
      startCardsListener(user.uid);
      startCategoriesListener(user.uid);
      startUsersListener(user.uid, user.role.toLowerCase());
      startSectionsListner(user.uid);
      startGradeLevelsListener();
    }

    // Cleanup: stop all listeners when component unmounts or user logs out
    return () => {
      stopCardsListener();
      stopCategoriesListener();
      stopUsersListener();
      stopSectionsListener();
      stopGradeLevelsListener();
    };
  }, [user?.uid]);

  // setting default font, working on web but not on android
  const [fontsLoaded] = useFonts({
    "Poppins-Light": require("@/assets/fonts/Poppins-Light.ttf"),
    "Poppins-Regular": require("@/assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("@/assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Bold": require("@/assets/fonts/Poppins-Bold.ttf"),
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
    headerContainer: {
      alignItems: "center",
    },
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
        borderLeftColor: COLORS.successText,
        backgroundColor: COLORS.black,
        paddingVertical: 5,
        paddingHorizontal: 0,

        width: "40%",
        height: "auto",
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 16,
        fontFamily: "Poppins",
        fontWeight: "600",
        color: COLORS.successText,
      }}
      text2Style={{
        fontSize: 14,
        fontFamily: "Poppins",
        fontWeight: "500",
        color: COLORS.white,
      }}
      text2NumberOfLines={2}
    />
  ),

  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: COLORS.errorText,
        backgroundColor: COLORS.black,
        paddingVertical: 5,
        paddingHorizontal: 0,

        width: "40%",
        height: "auto",
      }}
      text1Style={{
        fontSize: 16,
        fontFamily: "Poppins",
        fontWeight: "600",
        color: COLORS.errorText,
      }}
      text2Style={{
        fontSize: 14,
        fontFamily: "Poppins",
        fontWeight: "500",
        color: COLORS.white,
      }}
      text2NumberOfLines={2}
    />
  ),
};

export default RootLayout;
