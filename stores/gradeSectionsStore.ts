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

    const sectionsQuery = firestore()
      .collectionGroup("sections")
      .where("teachers", "array-contains", userId)
      .orderBy("created_at", "desc");

    const unsubscribe = sectionsQuery.onSnapshot(
      async (snapshot) => {
        // Filter sections by checking parent schoolYear's is_active
        const sectionsPromises = snapshot.docs.map(async (doc) => {
          const schoolYearPath = doc.ref.path.split("/").slice(0, 2).join("/");
          const schoolYearDoc = await firestore().doc(schoolYearPath).get();
          const isActive = schoolYearDoc.data()?.is_active;

          return isActive
            ? {
                id: doc.id,
                path: doc.ref.path,
                ...doc.data(),
              }
            : null;
        });

        const sectionsResults = await Promise.all(sectionsPromises);
        const sections = sectionsResults.filter(Boolean) as Section[];

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
