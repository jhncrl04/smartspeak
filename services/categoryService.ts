import { showToast } from "@/components/ui/MyToast";
import imageToBase64 from "@/helper/imageToBase64";
import { useAuthStore } from "@/stores/userAuthStore";
import { CreateLogInput, DeleteLogInput, UpdateLog } from "@/types/log";
import NetInfo from "@react-native-community/netinfo";
import firestore, {
  arrayRemove,
  arrayUnion,
} from "@react-native-firebase/firestore";
import { Alert } from "react-native";
import { createLog } from "./loggingService";
import { getUserInfo } from "./userApi/Authentication";

type categoryProps = {
  name: string;
  color: string;
  image: string;
  isAssignable?: boolean;
  assignedLearnerId?: string | null;
};

const categoryCollection = firestore().collection("pecsCategories");

export const addCategory = async (categoryInfo: categoryProps) => {
  const networkStatus = await NetInfo.fetch();
  if (!networkStatus.isConnected) {
    showToast(
      "error",
      "No Internet Connection",
      "Please check your connection and try again"
    );
    throw new Error("No Internet Connection");
  }

  const uid = useAuthStore.getState().user?.uid;

  const currentDate = new Date();

  let base64Image = "";
  if (categoryInfo.image) {
    try {
      base64Image = await imageToBase64(categoryInfo.image);
    } catch (err) {
      console.error("Error converting image to base64:", err);
    }
  }

  const categories = await categoryCollection
    .where("category_name", "==", categoryInfo.name)
    .where("created_by", "==", uid)
    .get();

  if (categories.docs.length > 0) {
    showToast(
      "error",
      "Category Already Exist",
      `${categoryInfo.name} already exist`
    );

    return;
  }

  const user = useAuthStore.getState().user;

  // const newCategory = {
  //   category_name: categoryInfo.name,
  //   background_color: categoryInfo.color,
  //   created_at: currentDate,
  //   created_by: uid,
  //   creator_name: user?.fname,
  //   image: base64Image,
  //   is_assignable: categoryInfo.isAssignable,
  //   assigned_to: categoryInfo.isAssignable
  //     ? []
  //     : [categoryInfo.assignedLearnerId],
  //   created_for: !categoryInfo.isAssignable
  //     ? categoryInfo.assignedLearnerId
  //     : "",
  // };

  // disable auto assign for now
  const newCategory = {
    category_name: categoryInfo.name,
    background_color: categoryInfo.color,
    created_at: currentDate,
    created_by: uid,
    creator_name: user?.fname,
    image: base64Image,
    is_assignable: categoryInfo.isAssignable,
    assigned_to: [],
    created_for: !categoryInfo.isAssignable
      ? categoryInfo.assignedLearnerId
      : "",
  };

  try {
    const categoryRef = await categoryCollection.add(newCategory);

    const logBody: CreateLogInput = {
      action: "Create Category",
      image: base64Image,
      item_category: newCategory.category_name,
      item_id: categoryRef.id,
      item_name: newCategory.category_name,
      item_type: "Card",
      timestamp: currentDate,
    };

    createLog(logBody);

    showToast(
      "success",
      "Category added successfully",
      `${categoryInfo.name} created.`
    );
  } catch (err) {
    console.error("Error uploading category: ", err);
    showToast("error", "Failed to upload category.", "");
  }
};

export const getCategories = async () => {
  const uid = useAuthStore.getState().user?.uid;

  const categories: any[] = [];

  await categoryCollection
    .where("created_by", "==", uid)
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach(async (doc) => {
        const category = doc.data();
        category.id = doc.id;

        if (category.is_assignable === false) {
          const learner = await getUserInfo(category.assigned_to[0]);

          category.assigned_to_name = `${learner?.first_name} ${learner?.last_name}`;
        }

        categories.push(category);
      });
    });

  return categories;
};

export const getCategoryWithId = async (categoryId: string) => {
  const categorySnapshot = await categoryCollection.doc(categoryId).get();

  const category = categorySnapshot.data();

  return category;
};

export const listenCategories = (callback: (categories: any[]) => void) => {
  const uid = useAuthStore.getState().user?.uid;
  if (!uid) return () => {};

  return categoryCollection.onSnapshot(async (snapshot) => {
    const categories: any[] = [];

    // We’ll collect promises here for fetching creator names
    const promises = snapshot.docs.map(async (doc) => {
      const category = doc.data();
      category.id = doc.id;

      if (
        category.created_by === uid ||
        category.created_by_role?.toString().toLowerCase() === "admin"
      ) {
        if (category.created_by) {
          try {
            const userDoc = await userCollection.doc(category.created_by).get();

            if (userDoc.exists()) {
              category.creatorName = userDoc.id === uid ? "You" : null;
            } else {
              category.creatorName = null;
            }
          } catch (error) {
            category.creatorName = null;
          }
        } else {
          category.creatorName = null;
        }
        categories.push(category);
      }
    });

    await Promise.all(promises); // wait for all creator lookups
    callback(categories); // push enriched categories to state
  });
};

export const listenToUnassignedCategories = (
  learnerId: string,
  callback: (categories: any[]) => void
) => {
  const uid = useAuthStore.getState().user?.uid;
  if (!uid) return () => {};

  return categoryCollection.onSnapshot(async (snapshot) => {
    const categories: any[] = [];

    // We’ll collect promises here for fetching creator names
    const promises = snapshot.docs.map(async (doc) => {
      const category = doc.data();
      category.id = doc.id;

      // console.log(
      //   `${category.category_name}: {assignedTo: ${
      //     category.assigned_to
      //   }, createdBy: ${
      //     category.created_by || category.created_by_role.toLowerCase()
      //   }, createdFor: ${category.created_for}}`
      // );

      if (
        !category.assigned_to?.includes(learnerId) &&
        category.created_by === uid &&
        category.created_by_role?.toString().toLowerCase() !== "admin"
      ) {
        if (!category.created_for || category.created_for === learnerId) {
          categories.push(category);
        }
      }
    });

    await Promise.all(promises); // wait for all creator lookups
    callback(categories); // push enriched categories to state
  });
};

export const getUnassignedCategories = async (learnerId: string) => {
  const uid = useAuthStore.getState().user?.uid;

  const categories: any[] = [];

  // Get all categories created by the current user
  const snapshot = await categoryCollection
    .where("created_by", "==", uid)
    .get();

  snapshot.forEach((doc) => {
    const category = doc.data();
    category.id = doc.id;

    // Filter out categories where learnerId is already in assigned_to
    if (!category.assigned_to?.includes(learnerId)) {
      if (
        !category.created_for ||
        category.created_for === learnerId ||
        category.created_for === "all"
      ) {
        categories.push(category);
      }
    }
  });

  return categories;
};

export const getAssignedCategories = async (learnerId: string) => {
  const uid = useAuthStore.getState().user?.uid;

  const categories: any[] = [];

  // Get all categories created by the current user
  const snapshot = await categoryCollection
    .where("created_by", "==", uid)
    .get();

  snapshot.forEach((doc) => {
    const category = doc.data();
    category.id = doc.id;

    // Filter out categories where learnerId is already in assigned_to
    if (category.assigned_to?.includes(learnerId)) {
      categories.push(category);
    }
  });

  return categories;
};

export const assignCategory = async (
  categoryId: string,
  learnerId?: string
) => {
  const networkStatus = await NetInfo.fetch();
  if (!networkStatus.isConnected) {
    showToast(
      "error",
      "No Internet Connection",
      "Please check your connection and try again"
    );
    throw new Error("No Internet Connection");
  }

  try {
    await categoryCollection
      .doc(categoryId)
      .update({ assigned_to: arrayUnion(learnerId) });
  } catch (err) {
    console.error("Error assigning category: ", err);
  }
};

const cardCollection = firestore().collection("cards");
export const unassignCategory = async (
  categoryId: string,
  learnerId: string,
  categoryName: string | undefined
) => {
  const networkStatus = await NetInfo.fetch();
  if (!networkStatus.isConnected) {
    showToast(
      "error",
      "No Internet Connection",
      "Please check your connection and try again"
    );
    throw new Error("No Internet Connection");
  }

  try {
    // First, get the category to check if it's created for "All" or specific learners
    const categoryDoc = await categoryCollection.doc(categoryId).get();
    const categoryData = categoryDoc.data();

    // Check if there are cards assigned to this learner in this category
    let cardsQuery = cardCollection.where(
      "assigned_to",
      "array-contains",
      learnerId
    );

    if (categoryId) {
      cardsQuery = cardsQuery.where("category_id", "==", categoryId);
    } else if (categoryName) {
      cardsQuery = cardsQuery.where("category_name", "==", categoryName);
    }

    const cardsSnapshot = await cardsQuery.get();

    // If there are cards assigned, show confirmation alert
    if (!cardsSnapshot.empty) {
      const cardCount = cardsSnapshot.size;

      return new Promise((resolve) => {
        Alert.alert(
          "Unassign Category",
          `This category contains ${cardCount} card(s) assigned to this learner. Unassigning the category will also unassign all these cards. Do you want to continue?`,
          [
            {
              text: "Cancel",
              style: "cancel",
              onPress: () => resolve({ success: false }),
            },
            {
              text: "Continue",
              style: "destructive",
              onPress: async () => {
                try {
                  // Remove learner from category
                  await categoryCollection.doc(categoryId).update({
                    assigned_to: arrayRemove(learnerId),
                  });

                  // Batch unassign learner from all cards
                  const batch = firestore().batch();
                  cardsSnapshot.forEach((cardDoc) => {
                    batch.update(cardDoc.ref, {
                      assigned_to: arrayRemove(learnerId),
                    });
                  });
                  await batch.commit();

                  showToast(
                    "success",
                    "Unassigned Successfully",
                    `Category and ${cardCount} card(s) unassigned from learner.`
                  );

                  resolve({ success: true });
                } catch (err) {
                  console.error("Error unassigning category/cards:", err);
                  showToast("error", "Error", "Something went wrong.");
                  resolve({ success: false, error: err });
                }
              },
            },
          ]
        );
      });
    }

    // If no cards, just unassign the category directly
    await categoryCollection.doc(categoryId).update({
      assigned_to: arrayRemove(learnerId),
    });

    showToast(
      "success",
      "Unassigned Successfully",
      "Category unassigned from learner."
    );

    return { success: true };
  } catch (err) {
    console.error("Error unassigning category: ", err);
    showToast("error", "Error", "Something went wrong.");
    return { success: false, error: err };
  }
};

const userCollection = firestore().collection("users");

export const listenAssignedCategories = (
  learnerId: string,
  callback: (categories: any[]) => void
) => {
  const uid = useAuthStore.getState().user?.uid;
  if (!uid) return () => {};

  return categoryCollection.onSnapshot(async (snapshot) => {
    const categories: any[] = [];

    // We’ll collect promises here for fetching creator names
    const promises = snapshot.docs.map(async (doc) => {
      const category = doc.data();
      category.id = doc.id;

      if (
        category.assigned_to?.includes(learnerId) ||
        category.created_by_role?.toString().toLowerCase() === "admin"
      ) {
        if (category.created_by) {
          try {
            const userDoc = await userCollection.doc(category.created_by).get();
            if (userDoc.exists()) {
              category.creatorName = userDoc.data()?.first_name || null;
            } else {
              category.creatorName = null;
            }
          } catch (error) {
            category.creatorName = null;
          }
        } else {
          category.creatorName = null;
        }
        categories.push(category);
      }
    });

    await Promise.all(promises); // wait for all creator lookups
    callback(categories); // push enriched categories to state
  });
};

export const updateCategory = async (
  categoryId: string,
  updates: {
    category_name?: string;
    background_color?: string;
    image?: string;
  }
) => {
  const networkStatus = await NetInfo.fetch();
  if (!networkStatus.isConnected) {
    showToast(
      "error",
      "No Internet Connection",
      "Please check your connection and try again"
    );
    throw new Error("No Internet Connection");
  }

  try {
    const category = await getCategoryWithId(categoryId);

    const logBody: UpdateLog = {
      action: "Update Category",
      before: {
        category_name: category?.category_name,
        background_color: category?.background_color,
        image: category?.image,
      },
      after: {
        category_name: updates?.category_name,
        background_color: updates?.background_color,
        image: updates?.image,
      },
      timestamp: new Date(),
      user_id: "",
      user_name: "",
      user_type: "",
    };

    await categoryCollection.doc(categoryId).update({
      ...updates,
      updated_at: firestore.FieldValue.serverTimestamp(), // for tracking
    });

    createLog(logBody);

    console.log(`✅ Category ${categoryId} updated successfully`);
  } catch (err) {
    console.error("Error updating category:", err);
    throw err;
  }
};

export const deleteCategory = async (categoryId: string): Promise<boolean> => {
  try {
    // First, check if category has cards
    const cardsSnapshot = await firestore()
      .collection("cards")
      .where("category_id", "==", categoryId)
      .get();

    // Get category data before deletion
    const category = await getCategoryWithId(categoryId);
    if (!category) {
      Alert.alert("Error", "Category not found!");
      return false;
    }

    // If category has cards, show confirmation dialog
    if (!cardsSnapshot.empty) {
      return new Promise<boolean>((resolve) => {
        Alert.alert(
          "Delete Category",
          `This category contains ${cardsSnapshot.size} card(s). Are you sure you want to delete it? This action cannot be undone.`,
          [
            {
              text: "Cancel",
              style: "cancel",
              onPress: () => resolve(false), // Return false for cancelled
            },
            {
              text: "Delete",
              style: "destructive",
              onPress: async () => {
                try {
                  await performDeletion(categoryId, category);
                  resolve(true);
                } catch (error) {
                  console.error("Error in confirmation deletion:", error);
                  Alert.alert(
                    "Error",
                    "Failed to delete category. Please try again."
                  );
                  resolve(false);
                }
              },
            },
          ]
        );
      });
    }

    // If no cards, delete directly
    await performDeletion(categoryId, category);
    return true;
  } catch (error) {
    console.error("Error deleting category:", error);
    Alert.alert("Error", "Failed to delete category. Please try again.");
    return false;
  }
};

// Helper function to perform the actual deletion
const performDeletion = async (categoryId: string, category: any) => {
  const networkStatus = await NetInfo.fetch();
  if (!networkStatus.isConnected) {
    showToast(
      "error",
      "No Internet Connection",
      "Please check your connection and try again"
    );
    throw new Error("No Internet Connection");
  }

  try {
    // 1. Get all cards in this category
    const cardsSnapshot = await firestore()
      .collection("cards")
      .where("category_id", "==", categoryId)
      .get();

    // 2. Batch delete cards (Firestore has 500 ops per batch limit)
    const batch = firestore().batch();
    cardsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // 3. Prepare log body
    const logBody: DeleteLogInput = {
      action: "Delete Category",
      category_id: categoryId,
      category_name: category?.category_name,
      image: null,
      item_category: null,
      item_id: null,
      item_name: null,
      item_type: "Category",
      deleted_at: new Date(),
      deleted_categories: [
        {
          category_name: category?.category_name,
          id: categoryId,
          image: category?.image,
        },
      ],
    };

    // 4. Commit all in parallel (log, batch delete cards, delete category)
    await Promise.all([
      createLog(logBody),
      batch.commit(),
      categoryCollection.doc(categoryId).delete(),
    ]);

    Alert.alert("Success", "Category and its cards deleted successfully!");
  } catch (error) {
    console.error("Error in performDeletion:", error);
    throw error; // Re-throw to be handled by caller
  }
};

// Alternative version with better error handling and loading states
export const deleteCategoryWithLoading = async (
  categoryId: string,
  onLoadingChange?: (loading: boolean) => void
): Promise<boolean> => {
  const networkStatus = await NetInfo.fetch();
  if (!networkStatus.isConnected) {
    showToast(
      "error",
      "No Internet Connection",
      "Please check your connection and try again"
    );
    throw new Error("No Internet Connection");
  }

  onLoadingChange?.(true);

  try {
    const result = await deleteCategory(categoryId);
    return result;
  } catch (error) {
    console.error("Delete category error:", error);
    return false;
  } finally {
    onLoadingChange?.(false);
  }
};
