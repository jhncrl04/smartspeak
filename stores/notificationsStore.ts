import { Notification, NotificationsStore } from "@/types/notifs";
import firestore from "@react-native-firebase/firestore";
import { create } from "zustand";

const NOTIFICATION_COLLECTION = firestore().collection("userNotifications");
const USER_COLLECTION = firestore().collection("users");

export const useNotifsStore = create<NotificationsStore>((set, get) => ({
  notifications: [],
  isLoading: true,
  error: null,
  unsubscribe: null,
  senderProfiles: {},

  startListener: (userId: string) => {
    // Stop existing listener if any
    get().stopListener();

    set({ isLoading: true, error: null });

    const unsubscribe = NOTIFICATION_COLLECTION.where(
      "created_for",
      "==",
      userId
    )
      .orderBy("timestamp", "desc")
      .onSnapshot(
        async (snapshot) => {
          const notifications = snapshot.docs.map((doc) => {
            const data = doc.data();

            return {
              id: doc.id,
              action: data.action,
              createdFor: data.created_for,
              message: data.message,
              senderId: data.user_id,
              notificationType: data.notification_type,
              notificationDate: data.timestamp,
              notificationSubject: data.item_name,
              read: data.read,

              // Optional fields
              userName: data.user_name,
              userType: data.user_type,
              itemType: data.item_type,
              itemId: data.item_id,
              itemName: data.item_name,
              before: data.before,
              after: data.after,
            } as Notification;
          });

          // Fetch missing sender profiles
          const senderIds = [
            ...new Set(
              notifications
                .map((n) => n.senderId)
                .filter((id) => id && !get().senderProfiles[id])
            ),
          ];

          if (senderIds.length > 0) {
            const profiles = await get().fetchSenderProfiles(senderIds);
            set({ senderProfiles: { ...get().senderProfiles, ...profiles } });
          }

          set({ notifications, isLoading: false, error: null });
        },
        (error) => {
          console.error("Notification listener error:", error);
          set({ error: error.message, isLoading: false });
        }
      );

    set({ unsubscribe });
  },

  fetchSenderProfiles: async (senderIds: string[]) => {
    const profiles: Record<string, any> = {};

    await Promise.all(
      senderIds.map(async (senderId) => {
        try {
          const userDoc = await USER_COLLECTION.doc(senderId).get();
          if (userDoc.exists()) {
            profiles[senderId] = userDoc.data();
          }
        } catch (error) {
          console.error(`Error fetching profile for ${senderId}:`, error);
        }
      })
    );

    return profiles;
  },

  stopListener: () => {
    const { unsubscribe } = get();
    if (unsubscribe) {
      unsubscribe();
      set({ unsubscribe: null });
    }
  },
}));
