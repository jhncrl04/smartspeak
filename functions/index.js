const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { Expo } = require("expo-server-sdk");

admin.initializeApp();
const expo = new Expo();

exports.sendPushNotification = functions.firestore
  .document("userNotifications/{notificationId}")
  .onCreate(async (snap, context) => {
    const notification = snap.data();
    const userId = notification.created_for;

    // Get user's Expo push token
    const userDoc = await admin
      .firestore()
      .collection("users")
      .doc(userId)
      .get();
    const expoPushToken = userDoc.data()?.expoPushToken;

    if (!expoPushToken || !Expo.isExpoPushToken(expoPushToken)) {
      console.log(`Invalid Expo push token for user ${userId}`);
      return;
    }

    // Create the push notification message
    const message = {
      to: expoPushToken,
      sound: "default",
      title: notification.action || "New Notification",
      body: notification.message,
      data: {
        notificationId: context.params.notificationId,
        itemId: notification.item_id,
        itemType: notification.item_type,
        notificationType: notification.notification_type,
      },
      badge: 1,
    };

    try {
      const ticket = await expo.sendPushNotificationsAsync([message]);
      console.log("Push notification sent:", ticket);
    } catch (error) {
      console.error("Error sending push notification:", error);
    }
  });
