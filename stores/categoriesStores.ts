import { CategoriesStore, Category } from "@/types/categories";
import firestore from "@react-native-firebase/firestore";
import { create } from "zustand";

const CATEGORY_COLLECTION = firestore().collection("pecsCategories");

export const useCategoriesStore = create<CategoriesStore>((set, get) => ({
  categories: [],
  isLoading: true,
  error: null,
  unsubscribe: null,

  startListener: (userId: string) => {
    get().stopListener();

    set({ isLoading: true, error: null });

    const categoriesQuery = CATEGORY_COLLECTION.where(
      "created_by",
      "==",
      userId
    );

    const unsubscribe = categoriesQuery.onSnapshot(
      (snapshot) => {
        const categories = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Category[];

        set({ categories, isLoading: false, error: null });
      },
      (error) => {
        console.error("Categories listener error:", error);
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
