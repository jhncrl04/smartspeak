import imageToBase64 from "@/helper/imageToBase64";
import { useAuthStore } from "@/stores/userAuthStore";
import firestore, {
  arrayRemove,
  arrayUnion,
} from "@react-native-firebase/firestore";
import * as FileSystem from "expo-file-system";
import { Alert } from "react-native";

type cardProps = {
  name: string;
  category_id: string;
  image: string;
};

const cardCollection = firestore().collection("cards");

export const addCard = async (cardInfo: cardProps) => {
  const uid = useAuthStore.getState().user?.uid;

  const current_date = new Date();

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

  const new_card = {
    card_name: cardInfo.name,
    category_id: cardInfo.category_id,
    created_at: current_date,
    created_by: uid,
    image: base64Image,
  };

  await cardCollection.add(new_card);
};

export const deleteCard = async (cardId: string) => {
  const cardRef = cardCollection.doc(cardId);
  const card = (await cardRef.get()).data();

  if (card?.assigned_to?.length !== 0) {
    Alert.alert(
      "Continue card deletion?",
      "Card is currently assigned to a student\nDo you wish to continue deleting this card?",
      [
        {
          text: "Yes",
          onPress: async () => {
            await cardRef.delete();
            Alert.alert("Card deleted");
          },
          style: "destructive",
        },
        {
          text: "No",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  } else {
    await cardRef.delete();
    Alert.alert("Card deleted");
  }
};

type cardType = {
  card_name: string;
  category_title: string;
  category_color: string;
};

export const listenToCards = (onCardsUpdate: (cards: any[]) => void) => {
  const uid = useAuthStore.getState().user?.uid;
  const cardQuery = firestore()
    .collection("cards")
    .where("created_by", "==", uid);
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

export const updateCard = async (
  cardId: string,
  cardName: string,
  cardImage: string
) => {
  try {
    const cardRef = cardCollection.doc(cardId);

    const image = await imageToBase64(cardImage);

    await cardRef.update({
      card_name: cardName,
      image: image,
    });

    console.log("Card updated successfully");
  } catch (err) {
    console.error("Error updating card:", err);
  }
};

export const getCardsWithCategory = async (
  categoryId: string | string[]
): Promise<[any[], string]> => {
  const uid = useAuthStore.getState().user?.uid;

  const categoryCollection = firestore().collection("pecsCategories");

  let query = cardCollection.where("created_by", "==", uid);

  if (Array.isArray(categoryId)) {
    query = query.where("category_id", "in", categoryId);
  } else {
    query = query.where("category_id", "==", categoryId);
  }

  const querySnapshot = await query.get();

  let categoryName = "";

  const cards = await Promise.all(
    querySnapshot.docs.map(async (doc) => {
      const card = doc.data();

      const categorySnapshot = await categoryCollection
        .doc(card.category_id)
        .get();
      const category = categorySnapshot.data();

      categoryName = category?.category_name;

      return {
        ...card,
        background_color: category?.background_color || null,
        category_title: category?.category_name || null,
      };
    })
  );

  return [cards, categoryName];
};

export const listenCardsWithCategory = (
  categoryId: string | string[],
  callback: (cards: any[], categoryName: string) => void
) => {
  const uid = useAuthStore.getState().user?.uid;
  if (!uid) return () => {};

  const categoryCollection = firestore().collection("pecsCategories");

  let query = cardCollection.where("created_by", "==", uid);

  if (Array.isArray(categoryId)) {
    query = query.where("category_id", "in", categoryId);
  } else {
    query = query.where("category_id", "==", categoryId);
  }

  return query.onSnapshot(async (snapshot) => {
    let categoryName = "";
    const cards = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const card = doc.data();

        const categorySnapshot = await categoryCollection
          .doc(card.category_id)
          .get();
        const category = categorySnapshot.data();

        if (!categoryName) categoryName = category?.category_name || "";

        return {
          ...card,
          id: doc.id,
          background_color: category?.background_color || null,
          category_title: category?.category_name || null,
        };
      })
    );

    callback(cards, categoryName);
  });
};

type Card = {
  background_color: string | null;
  category_title: string | null;
  [key: string]: any; // keep extra fields from Firestore
};

export const getAssignedCards = async (
  learnerId: string,
  categoryId: string | string[]
): Promise<[Card[], string]> => {
  const uid = useAuthStore.getState().user?.uid;
  const categoryCollection = firestore().collection("pecsCategories");

  let query = cardCollection.where("created_by", "==", uid);

  if (Array.isArray(categoryId)) {
    query = query.where("category_id", "in", categoryId);
  } else {
    query = query.where("category_id", "==", categoryId);
  }

  const querySnapshot = await query.get();

  let categoryName = "";
  let categoryData: any = null;

  if (!Array.isArray(categoryId)) {
    const categorySnapshot = await categoryCollection.doc(categoryId).get();
    categoryData = categorySnapshot.data();
    categoryName = categoryData?.category_name || "";
  }

  const cards = (
    await Promise.all(
      querySnapshot.docs.map(async (doc) => {
        const card = doc.data();

        let cardCategory = categoryData;
        if (Array.isArray(categoryId)) {
          const categorySnapshot = await categoryCollection
            .doc(card.category_id)
            .get();
          cardCategory = categorySnapshot.data();
        }

        if (card.assigned_to?.includes(learnerId)) {
          return {
            ...card,
            background_color: cardCategory?.background_color || null,
            category_title: cardCategory?.category_name || null,
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

  let query = cardCollection.where("created_by", "==", uid);

  if (Array.isArray(categoryId)) {
    query = query.where("category_id", "in", categoryId);
  } else {
    query = query.where("category_id", "==", categoryId);
  }

  const querySnapshot = await query.get();

  let categoryName = "";
  let categoryData: any = null;

  if (!Array.isArray(categoryId)) {
    const categorySnapshot = await categoryCollection.doc(categoryId).get();
    categoryData = categorySnapshot.data();
    categoryName = categoryData?.category_name || "";
  }

  const cards = (
    await Promise.all(
      querySnapshot.docs.map(async (doc) => {
        const card = doc.data();

        card.id = doc.id;

        let cardCategory = categoryData;
        if (Array.isArray(categoryId)) {
          const categorySnapshot = await categoryCollection
            .doc(card.category_id)
            .get();
          cardCategory = categorySnapshot.data();
        }

        if (!card.assigned_to?.includes(learnerId)) {
          return {
            ...card,
            background_color: cardCategory?.background_color || null,
            category_title: cardCategory?.category_name || null,
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
      .update({ assigned_to: arrayUnion(learnerId) });
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
    .where("created_by", "==", uid)
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

        if (card.assigned_to?.includes(learnerId)) {
          const category = categoryMap[card.category_id];

          console.log(category);

          cards.push({
            ...card,
            background_color: category?.background_color || null,
            category_title: category?.category_name || null,
          });
        }
      });

      callback(cards);
    });
};

export const listenAssignedCardWithCategory = (
  learnerId: string,
  categoryId: string,
  callback: (cards: any[]) => void
) => {
  const uid = useAuthStore.getState().user?.uid;
  if (!uid) return () => {};

  const categoryRef = firestore().collection("pecsCategories").doc(categoryId);

  // fetch category once
  let categoryCache: any = null;
  categoryRef.get().then((doc) => {
    categoryCache = doc.data();
  });

  return cardCollection
    .where("created_by", "==", uid)
    .where("category_id", "==", categoryId)
    .onSnapshot((snapshot) => {
      const cards: any[] = [];

      snapshot.forEach((doc) => {
        const card = doc.data();
        card.id = doc.id;

        if (card.assigned_to?.includes(learnerId)) {
          cards.push({
            ...card,
            background_color: categoryCache?.background_color || null,
            category_title: categoryCache?.category_name || null,
          });
        }
      });

      callback(cards);
    });
};

export const getCardInfoWithId = async (cardId: string) => {
  const uid = useAuthStore.getState().user?.uid;
  const categoryCollection = firestore().collection("pecsCategories");

  let cardSnapshot = await cardCollection.doc(cardId).get();
  let card = cardSnapshot?.data();

  if (card) {
    return card;
  }

  return null;
};

export const unassignCard = async (learnerId: string, cardId: string) => {
  try {
    await cardCollection
      .doc(cardId)
      .update({ assigned_to: arrayRemove(learnerId) });
  } catch (err) {
    console.error("Error unassigning card: ", err);
  }
};
