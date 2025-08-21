import { useAuthStore } from "@/stores/userAuthStore";
import firestore from "@react-native-firebase/firestore";

type cardProps = {
  name: string;
  categoryId: string;
};

const cardCollection = firestore().collection("cards");

export const addCard = async (cardInfo: cardProps) => {
  const uid = useAuthStore.getState().user?.uid;

  const currentDate = new Date();

  const newCard = {
    title: cardInfo.name,
    categoryId: cardInfo.categoryId,
    createdAt: currentDate,
    createdBy: uid,
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
