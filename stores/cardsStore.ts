import firestore from "@react-native-firebase/firestore";
import { useAuthStore } from "./userAuthStore";

const CARD_COLLECTION = firestore().collection("cards");

export const listenToCards = (onCardsUpdate: (cards: any[]) => void) => {
  const uid = useAuthStore.getState().user?.uid;

  const cardQuery = CARD_COLLECTION.where("created_by", "==", uid);
  const categoryCollection = firestore().collection("pecsCategories");

  const unsubscribe = cardQuery.onSnapshot(async (querySnapshot) => {
    const cards = await Promise.all(
      querySnapshot.docs.map(async (doc) => {
        const card = doc.data();
        card.id = doc.id;

        // fetch related category
        const categorySnapshot = await categoryCollection
          .doc(card.category_id)
          .get();
        const category = categorySnapshot.data();

        return {
          ...card,
          background_color: category?.background_color || null,
          category_title: category?.category_name || null,
        };
      })
    );

    onCardsUpdate(cards);
  });

  return unsubscribe; // Call this when you want to stop listening
};
