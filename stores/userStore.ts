import { User, UsersStore } from "@/types/user";
import firestore, {
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";
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

    let unsubscribe: (() => void) | undefined;

    if (role === "guardian") {
      // ✅ Combine two listeners (since Firestore React Native doesn't support OR queries)
      const usersMap = new Map<string, User>();

      const handleSnapshot = (
        snapshot: FirebaseFirestoreTypes.QuerySnapshot
      ) => {
        snapshot.docs.forEach((doc) => {
          usersMap.set(doc.id, { id: doc.id, ...doc.data() } as User);
        });

        // Merge users and update store
        const mergedUsers = Array.from(usersMap.values());
        set({ users: mergedUsers, isLoading: false, error: null });
      };

      const unsub1 = USER_COLLECTION.where(
        "guardian_id",
        "==",
        userId
      ).onSnapshot(handleSnapshot, (error) => {
        console.error("Guardian listener (guardian_id) error:", error);
        set({ error: error.message, isLoading: false });
      });

      const unsub2 = USER_COLLECTION.where(
        "guardians",
        "array-contains",
        userId
      ).onSnapshot(handleSnapshot, (error) => {
        console.error("Guardian listener (guardians array) error:", error);
        set({ error: error.message, isLoading: false });
      });

      // Store a single cleanup function that unsubscribes both
      unsubscribe = () => {
        unsub1();
        unsub2();
      };
    } else if (role === "teacher") {
      const sectionsQuery = SECTION_COLLECTION.where(
        "teachers",
        "array-contains",
        userId
      );

      unsubscribe = sectionsQuery.onSnapshot(
        async (snapshot) => {
          try {
            const studentIds = new Set<string>();

            snapshot.docs.forEach((doc) => {
              const sectionData = doc.data();
              if (sectionData.students && Array.isArray(sectionData.students)) {
                sectionData.students.forEach((studentId: string) => {
                  studentIds.add(studentId);
                });
              }
            });

            if (studentIds.size > 0) {
              const studentIdsArray = Array.from(studentIds);
              const batches = [];

              // Firestore 'in' queries limited to 10 items → batch them
              for (let i = 0; i < studentIdsArray.length; i += 10) {
                const batch = studentIdsArray.slice(i, i + 10);
                batches.push(
                  USER_COLLECTION.where(
                    firestore.FieldPath.documentId(),
                    "in",
                    batch
                  ).get()
                );
              }

              const results = await Promise.all(batches);
              const users = results.flatMap((querySnapshot) =>
                querySnapshot.docs.map((doc) => ({
                  id: doc.id,
                  ...doc.data(),
                }))
              ) as User[];

              set({ users, isLoading: false, error: null });
            } else {
              set({ users: [], isLoading: false, error: null });
            }
          } catch (error: any) {
            console.error("Error fetching student details:", error);
            set({ error: error.message, isLoading: false, users: [] });
          }
        },
        (error) => {
          console.error("Sections listener error:", error);
          set({ error: error.message, isLoading: false });
        }
      );
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
