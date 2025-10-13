import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

export type Notification = {
  id: string;
  action: string;
  createdFor: string;
  message: string;
  senderId: string;
  notificationType: string;
  notificationDate: FirebaseFirestoreTypes.Timestamp;
  notificationSubject: string;
  read: boolean;

  learnerId?: string;
  userName?: string; // maps to "user_name"
  userType?: string; // maps to "user_type"
  itemType?: string; // maps to "item_type" (e.g., "Card")
  itemId?: string; // maps to "item_id"
  itemName?: string; // maps to "item_name"
  before?: any; // maps to "before" object (for update actions)
  after?: any; // maps to "after" object (for update actions)
};

export type NotificationsStore = {
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;
  unsubscribe: (() => void) | null;
  senderProfiles: Record<string, any>;
  fetchSenderProfiles: (senderIds: string[]) => Promise<Record<string, any>>;

  // Actions
  startListener: (userId: string) => void;
  stopListener: () => void;
};
