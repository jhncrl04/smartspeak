import { useAuthStore } from "@/stores/userAuthStore";
import firestore from "@react-native-firebase/firestore";

type categoryProps = { name: string; color: string };

const categoryCollection = firestore().collection("pecsCategories");

export const addCategory = async (categoryInfo: categoryProps) => {
  const uid = useAuthStore.getState().user?.uid;

  const currentDate = new Date();

  const newCategory = {
    categoryName: categoryInfo.name,
    backgroundColor: categoryInfo.color,
    createdAt: currentDate,
    createdBy: uid,
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
