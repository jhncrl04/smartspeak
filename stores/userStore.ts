import { User, UsersStore } from "@/types/user";
import firestore from "@react-native-firebase/firestore";
import { create } from "zustand";

const USER_COLLECTION = firestore().collection("users");
const SECTION_COLLECTION = firestore().collection("sections");

export const useUsersStore = create<UsersStore>((set, get) => ({
  users: [],
  isLoading: true,
  error: null,
  unsubscribe: null,

  startListener: (userId: string, role: string) => {
    get().stopListener();

    set({ isLoading: true, error: null });

    let unsubscribe;

    if (role === "guardian") {
      const usersQuery = USER_COLLECTION.where("guardian_id", "==", userId);

      unsubscribe = usersQuery.onSnapshot(
        (snapshot) => {
          const users = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as User[];

          set({ users, isLoading: false, error: null });
        },
        (error) => {
          console.error("Users listener error:", error);
          set({ error: error.message, isLoading: false });
        }
      );
    } else if (role === "teacher") {
      // implement this later
    }

    set({ unsubscribe });
  },

  stopListener: () => {
    const { unsubscribe } = get();
    if (unsubscribe) {
      unsubscribe();
      set({ unsubscribe: null });
    }
  },
}));
