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
      const sectionsQuery = SECTION_COLLECTION.where(
        "teachers",
        "array-contains",
        userId
      );

      unsubscribe = sectionsQuery.onSnapshot(
        async (snapshot) => {
          try {
            // Get all unique student IDs from all sections
            const studentIds = new Set<string>();

            snapshot.docs.forEach((doc) => {
              const sectionData = doc.data();
              if (sectionData.students && Array.isArray(sectionData.students)) {
                sectionData.students.forEach((studentId: string) => {
                  studentIds.add(studentId);
                });
              }
            });

            // Fetch user details for all students
            if (studentIds.size > 0) {
              const studentIdsArray = Array.from(studentIds);
              const batches = [];

              // Firestore 'in' queries are limited to 10 items, batch them
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
              // No students found in any section
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
