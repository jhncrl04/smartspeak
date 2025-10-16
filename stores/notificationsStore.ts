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

  startListener: (userId: string, learners: string[]) => {
    // Stop existing listeners if any
    get().stopListener();

    set({ isLoading: true, error: null });

    // --- LISTENER 1: Notifications for the user ---
    const unsubscribeUser = NOTIFICATION_COLLECTION.where(
      "created_for",
      "==",
      userId
    )
      .orderBy("timestamp", "desc")
      .onSnapshot(
        async (snapshot) => {
          // Handle deletions using docChanges
          snapshot.docChanges().forEach((change) => {
            if (change.type === "removed") {
              set((state) => ({
                notifications: state.notifications.filter(
                  (n) => n.id !== change.doc.id
                ),
              }));
            }
          });

          // Process only added and modified documents
          const notifications = snapshot
            .docChanges()
            .filter((change) => change.type !== "removed")
            .map((change) => {
              const data = change.doc.data();
              return {
                id: change.doc.id,
                action: data.action,
                createdFor: data.created_for,
                message: data.message,
                senderId: data.user_id || data.sender_id,
                notificationType: data.notification_type,
                notificationDate: data.timestamp,
                notificationSubject: data.item_name,
                read: data.read,
                learnerId: data.learner_id,
                userName: data.user_name,
                userType: data.user_type,
                itemType: data.item_type,
                itemId: data.item_id,
                itemName: data.item_name,
                before: data.before,
                after: data.after,
              } as Notification;
            });

          if (notifications.length > 0) {
            await handleSenderProfiles(notifications, set, get);

            set((state) => ({
              notifications: mergeNotifications(
                state.notifications,
                notifications
              ),
              isLoading: false,
              error: null,
            }));
          } else {
            set({ isLoading: false });
          }
        },
        (error) => {
          console.error("Notification listener error (user):", error);
          set({ error: error.message, isLoading: false });
        }
      );

    console.log(learners);

    // --- LISTENER 2: Notifications for learner IDs ---
    let unsubscribeLearners: (() => void) | null = null;

    if (learners && learners.length > 0) {
      unsubscribeLearners = NOTIFICATION_COLLECTION.where(
        "learner_id",
        "in",
        learners.slice(0, 10)
      )
        .orderBy("timestamp", "desc")
        .onSnapshot(
          async (snapshot) => {
            // Handle deletions using docChanges
            snapshot.docChanges().forEach((change) => {
              if (change.type === "removed") {
                set((state) => ({
                  notifications: state.notifications.filter(
                    (n) => n.id !== change.doc.id
                  ),
                }));
              }
            });

            // Process only added and modified documents
            const learnerNotifs = snapshot
              .docChanges()
              .filter((change) => change.type !== "removed")
              .map((change) => {
                const data = change.doc.data();

                return {
                  id: change.doc.id,
                  action: data.action,
                  createdFor: data.created_for,
                  message: data.message,
                  senderId: data.user_id || data.sender_id,
                  notificationType: data.notification_type,
                  notificationDate: data.timestamp,
                  notificationSubject: data.item_name,
                  read: data.read,
                  learnerId: data.learner_id,
                  userName: data.user_name,
                  userType: data.user_type,
                  itemType: data.item_type,
                  itemId: data.item_id,
                  itemName: data.item_name,
                  before: data.before,
                  after: data.after,
                } as Notification;
              });

            if (learnerNotifs.length > 0) {
              await handleSenderProfiles(learnerNotifs, set, get);

              set((state) => ({
                notifications: mergeNotifications(
                  state.notifications,
                  learnerNotifs
                ),
                isLoading: false,
                error: null,
              }));
            } else {
              set({ isLoading: false });
            }
          },
          (error) => {
            console.error("Notification listener error (learners):", error);
            set({ error: error.message, isLoading: false });
          }
        );
    }

    // Combine both unsubscribers
    const combinedUnsubscribe = () => {
      unsubscribeUser();
      if (unsubscribeLearners) unsubscribeLearners();
    };

    set({ unsubscribe: combinedUnsubscribe });
  },

  fetchSenderProfiles: async (senderIds: string[]) => {
    const profiles: Record<string, any> = {};

    await Promise.all(
      senderIds.map(async (senderId) => {
        try {
          const userDoc = await USER_COLLECTION.doc(senderId).get();
          if (userDoc.exists()) profiles[senderId] = userDoc.data();
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

// --- Helper to handle sender profiles ---
async function handleSenderProfiles(
  notifications: Notification[],
  set: any,
  get: any
) {
  const senderIds = [
    ...new Set(
      notifications
        .map((n) => n.senderId)
        .filter((id) => id && !get().senderProfiles[id])
    ),
  ];

  if (senderIds.length > 0) {
    const profiles = await get().fetchSenderProfiles(senderIds);
    set((state: any) => ({
      senderProfiles: { ...state.senderProfiles, ...profiles },
    }));
  }
}

// --- Helper to merge and deduplicate notifications ---
function mergeNotifications(
  current: Notification[],
  incoming: Notification[]
): Notification[] {
  const merged = [...current, ...incoming];
  const unique = new Map(merged.map((n) => [n.id, n]));
  return Array.from(unique.values()).sort(
    (a, b) =>
      (b.notificationDate?.toMillis?.() || 0) -
      (a.notificationDate?.toMillis?.() || 0)
  );
}
