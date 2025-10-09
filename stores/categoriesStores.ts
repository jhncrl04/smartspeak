import { CategoriesStore, Category } from "@/types/categories";
import firestore from "@react-native-firebase/firestore";
import { create } from "zustand";

const CATEGORY_COLLECTION = firestore().collection("pecsCategories");

export const useCategoriesStore = create<CategoriesStore>((set, get) => ({
  categories: [],
  isLoading: true,
  error: null,
  unsubscribe: null,

  startListener: (userId: string, learnerIds?: string[]) => {
    get().stopListener();

    set({ isLoading: true, error: null });

    const categoriesMap = new Map<string, Category>();
    const unsubscribers: (() => void)[] = [];

    const updateCategories = () => {
      const categories = Array.from(categoriesMap.values());
      set({ categories, isLoading: false, error: null });
    };

    // Filter assigned_to in client-side if learnerIds provided
    const userUnsubscribe = CATEGORY_COLLECTION.where(
      "created_by",
      "==",
      userId
    ).onSnapshot(
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const categoryData = {
            id: change.doc.id,
            ...change.doc.data(),
          } as Category;

          if (change.type === "added" || change.type === "modified") {
            // // Client-side filter: check if any learner is in assigned_to
            // if (learnerIds && learnerIds.length > 0) {
            //   const assignedTo = categoryData.assigned_to || [];
            //   const hasMatchingLearner = learnerIds.some((learnerId) =>
            //     assignedTo.includes(learnerId)
            //   );

            //   // Only add if it matches at least one learner
            //   if (hasMatchingLearner) {
            //     categoriesMap.set(change.doc.id, categoryData);
            //   } else {
            //     // Remove if it no longer matches
            //     categoriesMap.delete(change.doc.id);
            //   }
            // } else {
            //   // No learner filter, add all user's categories
            // categoriesMap.set(change.doc.id, categoryData);
            // }
            categoriesMap.set(change.doc.id, categoryData);
          } else if (change.type === "removed") {
            categoriesMap.delete(change.doc.id);
          }
        });
        updateCategories();
      },
      (error) => {
        console.error("User categories listener error:", error);
        set({ error: error.message, isLoading: false });
      }
    );
    unsubscribers.push(userUnsubscribe);

    // This gets categories from OTHER teachers/guardians
    if (learnerIds && learnerIds.length > 0) {
      // Split into batches of 10 if needed (array-contains-any limit)
      const batchSize = 10;
      for (let i = 0; i < learnerIds.length; i += batchSize) {
        const batch = learnerIds.slice(i, i + batchSize);

        const assignedUnsubscribe = CATEGORY_COLLECTION.where(
          "assigned_to",
          "array-contains-any",
          batch
        ).onSnapshot(
          (snapshot) => {
            snapshot.docChanges().forEach((change) => {
              const categoryData = {
                id: change.doc.id,
                ...change.doc.data(),
              } as Category;

              if (change.type === "added" || change.type === "modified") {
                categoriesMap.set(change.doc.id, categoryData);
              } else if (change.type === "removed") {
                categoriesMap.delete(change.doc.id);
              }
            });
            updateCategories();
          },
          (error) => {
            console.error("Assigned categories listener error:", error);
            set({ error: error.message, isLoading: false });
          }
        );
        unsubscribers.push(assignedUnsubscribe);
      }
    }

    // Apply same learner filter
    const adminUnsubscribe = CATEGORY_COLLECTION.where(
      "created_by_role",
      "==",
      "ADMIN"
    ).onSnapshot(
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const categoryData = {
            id: change.doc.id,
            ...change.doc.data(),
          } as Category;

          if (change.type === "added" || change.type === "modified") {
            // Client-side filter for learners
            if (learnerIds && learnerIds.length > 0) {
              categoriesMap.set(change.doc.id, categoryData);
            } else {
              categoriesMap.set(change.doc.id, categoryData);
            }
          } else if (change.type === "removed") {
            categoriesMap.delete(change.doc.id);
          }
        });
        updateCategories();
      },
      (error) => {
        console.error("Admin categories listener error:", error);
        set({ error: error.message, isLoading: false });
      }
    );
    unsubscribers.push(adminUnsubscribe);

    // Combined unsubscribe function
    const combinedUnsubscribe = () => {
      unsubscribers.forEach((unsub) => unsub());
    };

    set({ unsubscribe: combinedUnsubscribe });
  },

  stopListener: () => {
    const { unsubscribe } = get();
    if (unsubscribe) {
      unsubscribe();
      set({ unsubscribe: null });
    }
  },
}));
