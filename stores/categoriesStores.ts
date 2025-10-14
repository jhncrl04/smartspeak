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

    // Listener for categories created by the current user
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

    // Listener for categories assigned to specific learners (created by other teachers)
    if (learnerIds && learnerIds.length > 0) {
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
                // Only delete if it's not created for any of the learners
                const createdForArray = Array.isArray(categoryData.created_for)
                  ? categoryData.created_for
                  : [categoryData.created_for].filter(Boolean);
                const isCreatedFor = createdForArray.some((learnerId: string) =>
                  batch.includes(learnerId)
                );
                if (!isCreatedFor) {
                  categoriesMap.delete(change.doc.id);
                }
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

      // Listener for categories created FOR specific learners
      const createdForUnsubscribe = CATEGORY_COLLECTION.where(
        "created_for",
        "array-contains-any",
        learnerIds
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
          console.error("Created for categories listener error:", error);
          set({ error: error.message, isLoading: false });
        }
      );

      unsubscribers.push(createdForUnsubscribe);
    }

    // Listener for ADMIN categories
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
            categoriesMap.set(change.doc.id, categoryData);
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
