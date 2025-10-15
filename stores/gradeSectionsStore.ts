import {
  GradeLevel,
  GradeLevelsStore,
  Section,
  SectionsStore,
} from "@/types/gradeSection";
import firestore from "@react-native-firebase/firestore";
import { create } from "zustand";

const SECTION_COLLECTION = firestore().collection("sections");

export const useSectionsStore = create<SectionsStore>((set, get) => ({
  sections: [],
  isLoading: true,
  error: null,
  unsubscribe: null,

  startListener: (userId: string) => {
    get().stopListener();
    set({ isLoading: true, error: null });

    // 🔥 collectionGroup() searches all "sections" subcollections in Firestore
    const sectionsQuery = firestore()
      .collectionGroup("sections")
      .where("teachers", "array-contains", userId)
      .orderBy("created_at", "desc");

    const unsubscribe = sectionsQuery.onSnapshot(
      (snapshot) => {
        const sections = snapshot.docs.map((doc) => ({
          id: doc.id,
          path: doc.ref.path, // optional: helpful for knowing where it came from
          ...doc.data(),
        })) as Section[];

        set({ sections, isLoading: false, error: null });
      },
      (error) => {
        console.error("Section listener error:", error);
        set({ error: error.message, isLoading: false });
      }
    );

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

const GRADE_LEVEL_COLLECTION = firestore().collectionGroup("gradeLevels");
export const useGradeLevelsStore = create<GradeLevelsStore>((set, get) => ({
  gradeLevels: [],
  isLoading: true,
  error: null,
  unsubscribe: null,

  startListener: () => {
    get().stopListener();

    set({ isLoading: true, error: null });

    let unsubscribe;

    const gradeLevelsQuery = GRADE_LEVEL_COLLECTION;

    unsubscribe = gradeLevelsQuery.onSnapshot(
      (snapshot) => {
        const gradeLevels = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as GradeLevel[];

        set({ gradeLevels, isLoading: false, error: null });
      },
      (error) => {
        console.error("Grade level listener error:", error);
        set({ error: error.message, isLoading: false });
      }
    );

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
