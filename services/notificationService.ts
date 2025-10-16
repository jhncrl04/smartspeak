import { showToast } from "@/components/ui/MyToast";
import firestore from "@react-native-firebase/firestore";
import { Platform } from "react-native";

import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

import NetInfo from "@react-native-community/netinfo";

const NOTIFICATION_COLLECTION = firestore().collection("userNotifications");

export const markAsRead = async (id: string) => {
  try {
    NOTIFICATION_COLLECTION.doc(id).update({ read: true });
  } catch (error) {
    showToast("error", "", "");
  }
};

export const deleteNotification = async (id: string) => {
  try {
    console.log(id);

    NOTIFICATION_COLLECTION.doc(id).delete();
  } catch (error) {
    showToast("error", "", "");
  }
};

const markAllAsRead = async (ids: string[]) => {
  try {
    ids.forEach((id) => {
      NOTIFICATION_COLLECTION.doc(id).update({ read: true });
    });
  } catch (error) {
    showToast("error", "", "");
  }
};

export const createNotification = async (notificationBody: any) => {
  const networkStatus = await NetInfo.fetch();
  if (!networkStatus.isConnected) {
    showToast(
      "error",
      "No Internet Connection",
      "Please check your connection and try again"
    );
    throw new Error("No Internet Connection");
  }

  try {
    NOTIFICATION_COLLECTION.add(notificationBody);
  } catch (err) {
    console.error("Can't create notification: ", err);
  }
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const registerPushNotifications = async (userId: string) => {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      return;
    }
  }

  // Get the Expo push token
  const token = (
    await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    })
  ).data;

  // Save token to Firestore
  await firestore().collection("users").doc(userId).update({
    expoPushToken: token,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });

  return token;
};

export const setupNotificationListeners = () => {
  const notificationListener = Notifications.addNotificationReceivedListener(
    (notification) => {
      console.log("Notification Received: ", notification);
    }
  );

  const responseListener =
    Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("Notification tapped:", response);

      const data = response.notification.request.content.data;
    });
  return { notificationListener, responseListener };
};
