import { useAuthStore } from "@/stores/userAuthStore";
import firestore from "@react-native-firebase/firestore";
import * as FileSystem from "expo-file-system";

type cardProps = {
  name: string;
  categoryId: string;
  image: string;
};

const cardCollection = firestore().collection("cards");

export const addCard = async (cardInfo: cardProps) => {
  const uid = useAuthStore.getState().user?.uid;

  const currentDate = new Date();

  let base64Image = "";
  if (cardInfo.image) {
    try {
      base64Image = await FileSystem.readAsStringAsync(cardInfo.image, {
        encoding: FileSystem.EncodingType.Base64,
      });
      base64Image = `data:image/jpeg;base64,${base64Image}`;
    } catch (err) {
      console.error("Error converting image to base64:", err);
    }
  }

  const newCard = {
    cardName: cardInfo.name,
    categoryId: cardInfo.categoryId,
    createdAt: currentDate,
    createdBy: uid,
    image: base64Image,
  };

  await cardCollection.add(newCard);
};

export const deleteCard = async (cardId: string) => {
  cardCollection.doc(cardId).delete();
};

type cardType = {
  cardName: string;
  categoryTitle: string;
  categoryColor: string;
};

export const getCards = async () => {
  const uid = useAuthStore.getState().user?.uid;

  const categoryCollection = firestore().collection("pecsCategories");

  const querySnapshot = await cardCollection
    .where("createdBy", "==", uid)
    .get();

  const cards = await Promise.all(
    querySnapshot.docs.map(async (doc) => {
      const card = doc.data();

      // fetch related board
      const categorySnapshot = await categoryCollection
        .doc(card.categoryId)
        .get();
      const category = categorySnapshot.data();

      return {
        ...card,
        backgroundColor: category?.backgroundColor || null,
        categoryTitle: category?.categoryName || null,
      };
    })
  );

  return cards;
};

export const getCardsWithCategory = async (
  categoryId: string | string[]
): Promise<[any[], string]> => {
  const uid = useAuthStore.getState().user?.uid;

  const categoryCollection = firestore().collection("pecsCategories");

  let query = cardCollection.where("createdBy", "==", uid);

  if (Array.isArray(categoryId)) {
    query = query.where("categoryId", "in", categoryId);
  } else {
    query = query.where("categoryId", "==", categoryId);
  }

  const querySnapshot = await query.get();

  let categoryName = "";

  const cards = await Promise.all(
    querySnapshot.docs.map(async (doc) => {
      const card = doc.data();

      const categorySnapshot = await categoryCollection
        .doc(card.categoryId)
        .get();
      const category = categorySnapshot.data();

      categoryName = category?.categoryName;

      return {
        ...card,
        backgroundColor: category?.backgroundColor || null,
        categoryTitle: category?.categoryName || null,
      };
    })
  );

  return [cards, categoryName];
};
