import { useAuthStore } from "@/stores/userAuthStore";
import firestore, { arrayUnion } from "@react-native-firebase/firestore";
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

type Card = {
  backgroundColor: string | null;
  categoryTitle: string | null;
  [key: string]: any; // keep extra fields from Firestore
};

export const getAssignedCards = async (
  learnerId: string,
  categoryId: string | string[]
): Promise<[Card[], string]> => {
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
  let categoryData: any = null;

  if (!Array.isArray(categoryId)) {
    const categorySnapshot = await categoryCollection.doc(categoryId).get();
    categoryData = categorySnapshot.data();
    categoryName = categoryData?.categoryName || "";
  }

  const cards = (
    await Promise.all(
      querySnapshot.docs.map(async (doc) => {
        const card = doc.data();

        let cardCategory = categoryData;
        if (Array.isArray(categoryId)) {
          const categorySnapshot = await categoryCollection
            .doc(card.categoryId)
            .get();
          cardCategory = categorySnapshot.data();
        }

        if (card.assignedTo?.includes(learnerId)) {
          return {
            ...card,
            backgroundColor: cardCategory?.backgroundColor || null,
            categoryTitle: cardCategory?.categoryName || null,
          } as Card;
        }
        return null;
      })
    )
  ).filter(Boolean) as Card[];

  return [cards, categoryName];
};

export const getUnassignedCards = async (
  learnerId: string,
  categoryId: string | string[]
): Promise<[Card[], string]> => {
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
  let categoryData: any = null;

  if (!Array.isArray(categoryId)) {
    const categorySnapshot = await categoryCollection.doc(categoryId).get();
    categoryData = categorySnapshot.data();
    categoryName = categoryData?.categoryName || "";
  }

  const cards = (
    await Promise.all(
      querySnapshot.docs.map(async (doc) => {
        const card = doc.data();

        card.id = doc.id;

        let cardCategory = categoryData;
        if (Array.isArray(categoryId)) {
          const categorySnapshot = await categoryCollection
            .doc(card.categoryId)
            .get();
          cardCategory = categorySnapshot.data();
        }

        if (!card.assignedTo?.includes(learnerId)) {
          return {
            ...card,
            backgroundColor: cardCategory?.backgroundColor || null,
            categoryTitle: cardCategory?.categoryName || null,
          } as Card;
        }
        return null;
      })
    )
  ).filter(Boolean) as Card[];

  return [cards, categoryName];
};

export const assignCard = async (cardId: string, learnerId?: string) => {
  try {
    await cardCollection
      .doc(cardId)
      .update({ assignedTo: arrayUnion(learnerId) });
  } catch (err) {
    console.error("Error assigning card: ", err);
  }
};

export const listenAssignedCard = (
  learnerId: string,
  callback: (cards: any[]) => void
) => {
  const uid = useAuthStore.getState().user?.uid;
  if (!uid) return () => {};

  const categoryCollection = firestore().collection("pecsCategories");

  return cardCollection
    .where("createdBy", "==", uid)
    .onSnapshot(async (snapshot) => {
      const cards: any[] = [];

      // ⚡️ get all categoryIds in this snapshot (to avoid multiple queries)
      const categoryIds = Array.from(
        new Set(snapshot.docs.map((doc) => doc.data().categoryId))
      );

      // fetch categories in parallel
      const categoryDocs = await Promise.all(
        categoryIds.map((id) => categoryCollection.doc(id).get())
      );

      const categoryMap: Record<string, any> = {};
      categoryDocs.forEach((doc) => {
        if (doc) categoryMap[doc.id] = doc.data();
      });

      snapshot.forEach((doc) => {
        const card = doc.data();
        card.id = doc.id;

        if (card.assignedTo?.includes(learnerId)) {
          const category = categoryMap[card.categoryId];
          cards.push({
            ...card,
            backgroundColor: category?.backgroundColor || null,
            categoryTitle: category?.categoryName || null,
          });
        }
      });

      callback(cards);
    });
};
