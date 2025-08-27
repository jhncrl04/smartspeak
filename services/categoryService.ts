import { useAuthStore } from "@/stores/userAuthStore";
import firestore from "@react-native-firebase/firestore";
import * as FileSystem from "expo-file-system";

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
    categoryName: categoryInfo.name,
    backgroundColor: categoryInfo.color,
    createdAt: currentDate,
    createdBy: uid,
    image: base64Image,
  };

  await categoryCollection.add(newCategory);
};

export const deleteCategory = async (categoryId: string) => {
  categoryCollection.doc(categoryId).delete();
};

export const getCategories = async () => {
  const uid = useAuthStore.getState().user?.uid;

  const categories: any[] = [];

  await categoryCollection
    .where("createdBy", "==", uid)
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
