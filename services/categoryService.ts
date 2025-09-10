import { useAuthStore } from "@/stores/userAuthStore";
import firestore, { arrayUnion } from "@react-native-firebase/firestore";
import * as FileSystem from "expo-file-system";
import { Alert } from "react-native";

type categoryProps = { name: string; color: string; image: string };

const categoryCollection = firestore().collection("pecsCategories");

export const addCategory = async (categoryInfo: categoryProps) => {
  const uid = useAuthStore.getState().user?.uid;

  const currentDate = new Date();

  let base64Image = "";
  if (categoryInfo.image) {
    try {
      base64Image = await FileSystem.readAsStringAsync(categoryInfo.image, {
        encoding: FileSystem.EncodingType.Base64,
      });
      base64Image = `data:image/jpeg;base64,${base64Image}`;
    } catch (err) {
      console.error("Error converting image to base64:", err);
    }
  }

  const newCategory = {
    category_name: categoryInfo.name,
    background_color: categoryInfo.color,
    created_at: currentDate,
    created_by: uid,
    image: base64Image,
  };

  await categoryCollection.add(newCategory);
};

export const getCategories = async () => {
  const uid = useAuthStore.getState().user?.uid;

  const categories: any[] = [];

  await categoryCollection
    .where("created_by", "==", uid)
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const category = doc.data();
        category.id = doc.id;

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

  return categoryCollection
    .where("created_by", "==", uid)
    .onSnapshot((snapshot) => {
      const categories: any[] = [];

      snapshot.forEach((doc) => {
        const category = doc.data();
        category.id = doc.id;

        categories.push(category);
      });

      callback(categories);
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
      categories.push(category);
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
  try {
    await categoryCollection
      .doc(categoryId)
      .update({ assigned_to: arrayUnion(learnerId) });
  } catch (err) {
    console.error("Error assigning category: ", err);
  }
};

export const listenAssignedCategories = (
  learnerId: string,
  callback: (categories: any[]) => void
) => {
  const uid = useAuthStore.getState().user?.uid;
  if (!uid) return () => {};

  return categoryCollection
    .where("created_by", "==", uid)
    .onSnapshot((snapshot) => {
      const categories: any[] = [];

      snapshot.forEach((doc) => {
        const category = doc.data();
        category.id = doc.id;

        if (category.assigned_to?.includes(learnerId)) {
          categories.push(category);
        }
      });

      callback(categories); // push new categories to state
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
  try {
    await categoryCollection.doc(categoryId).update({
      ...updates,
      updated_at: firestore.FieldValue.serverTimestamp(), // for tracking
    });

    console.log(`✅ Category ${categoryId} updated successfully`);
  } catch (err) {
    console.error("Error updating category:", err);
    throw err;
  }
};

export const deleteCategory = async (categoryId: string) => {
  try {
    const cardsSnapshot = await firestore()
      .collection("cards")
      .where("category_id", "==", categoryId)
      .get();

    if (!cardsSnapshot.empty) {
      return new Promise<void>((resolve, reject) => {
        Alert.alert(
          "Delete Category",
          "This category contains cards. Are you sure you want to delete it?",
          [
            {
              text: "Cancel",
              style: "cancel",
              onPress: () => reject(new Error("User cancelled delete")),
            },
            {
              text: "Yes, Delete",
              style: "destructive",
              onPress: async () => {
                try {
                  await categoryCollection.doc(categoryId).delete();
                  resolve();
                } catch (err) {
                  console.error("Error deleting category:", err);
                  reject(err);
                }
              },
            },
          ]
        );
      });
    }

    await categoryCollection.doc(categoryId).delete();
  } catch (err) {
    console.error("Error deleting category:", err);
    throw err;
  }
};
