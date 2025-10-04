import { showToast } from "@/components/ui/MyToast";
import imageToBase64 from "@/helper/imageToBase64";
import { useAuthStore } from "@/stores/userAuthStore";
import {
  AssignLog,
  CardDetail,
  CreateLogInput,
  DeleteLogInput,
  UpdateLog,
} from "@/types/log";
import firestore, {
  arrayRemove,
  arrayUnion,
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";
import { Alert } from "react-native";
import { getCategoryWithId } from "./categoryService";
import { createLog } from "./loggingService";

type cardProps = {
  name: string;
  category_id: string;
  image: string;
  is_assignable: boolean;
  created_for: string | null;
};

const cardCollection = firestore().collection("cards");

export const addCard = async (cardInfo: cardProps) => {
  const uid = useAuthStore.getState().user?.uid;

  const current_date = new Date();

  let base64Image = await imageToBase64(cardInfo.image);

  const category = await getCategoryWithId(cardInfo.category_id);
  if (!category) throw new Error("Category not found");

  const cardExist = await cardCollection
    .where("card_name", "==", cardInfo.name)
    .where("category_id", "==", cardInfo.category_id)
    .get();

  if (cardExist.docs.length > 0) {
    showToast(
      "error",
      "Card Already Exist",
      `${cardInfo.name} already exist at ${category.category_name}`
    );

    return;
  }

  const new_card: any = {
    card_name: cardInfo.name,
    category_name: category.category_name,
    category_id: cardInfo.category_id,
    created_at: current_date,
    created_by: uid,
    image: base64Image,
    created_for: cardInfo.created_for ?? "all",
  };
  try {
    const cardRef = await cardCollection.add(new_card);

    const logBody: CreateLogInput = {
      action: "Create Card",
      image: base64Image,
      item_category: category.category_name,
      item_id: cardRef.id,
      item_name: cardInfo.name,
      item_type: "Card",
      timestamp: current_date,
      created_for: cardInfo.created_for ?? "all",
    };

    createLog(logBody);

    showToast(
      "success",
      "Card Created",
      `${cardInfo.name} card created successfully`
    );
  } catch (error) {
    showToast(
      "error",
      "Card Creation Failed",
      `Failed to upload ${cardInfo.name} card.`
    );
  }
};

export const deleteCard = async (cardId: string) => {
  const cardRef = cardCollection.doc(cardId);
  const cardSnap = await cardRef.get();
  const card = cardSnap.data();

  if (card?.assigned_to?.length > 0) {
    Alert.alert(
      "Continue card deletion?",
      "Card is currently assigned to a student\nDo you wish to continue deleting this card?",
      [
        {
          text: "Yes",
          onPress: async () => {
            await confirmCardDeletion(cardRef, card);
          },
          style: "destructive",
        },
        { text: "No", style: "cancel" },
      ],
      { cancelable: true }
    );
  } else {
    await confirmCardDeletion(cardRef, card);
  }
};

const confirmCardDeletion = async (
  cardRef: FirebaseFirestoreTypes.DocumentReference,
  cardInfo: any
) => {
  if (!cardInfo) throw new Error("Card not found");

  const current_date = new Date();

  const category = await getCategoryWithId(cardInfo.category_id);
  if (!category) throw new Error("Category not found");

  const deleteCard = {
    id: cardRef.id,
    card_name: cardInfo.card_name,
    category_name: category.category_name,
  };

  const logBody: DeleteLogInput = {
    action: "Delete Card",
    category_id: cardInfo.category_id,
    category_name: category.category_name,
    image: cardInfo.image,
    item_category: category.category_name,
    item_id: cardRef.id,
    item_name: cardInfo.card_name,
    item_type: "Card",
    deleted_at: current_date,

    deleted_cards: [deleteCard],
  };

  // Delete first AFTER we save the info
  await cardRef.delete();

  createLog(logBody);
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

    const card = (await cardRef.get()).data();

    console.log(card);

    const logBody: UpdateLog = {
      action: "Update Card",
      before: {
        card_name: card?.card_name,
        category_name: card?.category_name,
        image: card?.image,
      },
      after: {
        card_name: cardName,
        category_name: card?.category_name,
        image: image,
      },
      timestamp: new Date(),
      user_id: "",
      user_name: "",
      user_type: "",
    };

    await cardRef.update({
      card_name: cardName,
      image: image,
    });

    createLog(logBody);

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

interface ListenedCard {
  id: string;
  category_id: string;
  category_name?: string;
  background_color?: string | null;
  category_title?: string | null;
  [key: string]: any;
}

interface Category {
  id: string;
  category_name: string;
  background_color?: string;
  created_by_role?: string;
  [key: string]: any;
}

export const listenCardsWithCategoryEnhanced = (
  categoryId: string,
  callback: (
    cards: ListenedCard[],
    categoryName: string,
    loading: boolean,
    error?: string
  ) => void
): (() => void) => {
  const uid = useAuthStore.getState().user?.uid;

  if (!uid) {
    callback([], "", false, "No authenticated user");
    return () => {};
  }

  callback([], "", true); // Initial loading state

  const categoryCollection = firestore().collection("pecsCategories");
  let unsubscribe: (() => void) | null = null;

  const setupListener = async () => {
    try {
      const category = await getCategoryWithId(categoryId);

      if (!category) {
        callback([], "", false, "Category not found");
        return;
      }

      const isAdminCategory =
        category?.created_by_role?.toLowerCase() === "admin";
      const query = isAdminCategory
        ? cardCollection.where("category_name", "==", category.category_name)
        : cardCollection.where("category_id", "==", categoryId);

      unsubscribe = query.onSnapshot(
        async (snapshot) => {
          try {
            const cards = await processCardsOptimized(snapshot.docs, category);
            callback(cards, category.category_name, false);
          } catch (error) {
            console.error("Error processing cards:", error);
            callback([], category.category_name, false, "Error loading cards");
          }
        },
        (error) => {
          console.error("Listener error:", error);
          callback([], "", false, "Connection error");
        }
      );
    } catch (error) {
      console.error("Setup error:", error);
      callback([], "", false, "Setup failed");
    }
  };

  const processCardsOptimized = async (
    docs: any[],
    primaryCategory: any
  ): Promise<ListenedCard[]> => {
    // Same optimized processing logic as above
    const categoryIds = [...new Set(docs.map((doc) => doc.data().category_id))];
    const categoryMap = new Map([[primaryCategory.id, primaryCategory]]);

    // Batch fetch categories
    if (categoryIds.length > 1) {
      const otherIds = categoryIds.filter((id) => id !== primaryCategory.id);
      const categoryPromises = otherIds.map(async (id) => {
        const doc = await categoryCollection.doc(id).get();
        return { id, data: doc.data() as Category };
      });

      const results = await Promise.all(categoryPromises);
      results.forEach(({ id, data }) => {
        if (data) categoryMap.set(id, data);
      });
    }

    return docs.map((doc) => {
      const cardData = doc.data();
      const category =
        cardData.category_id && categoryMap.get(cardData.category_id)
          ? categoryMap.get(cardData.category_id)
          : primaryCategory;

      return {
        ...cardData,
        id: doc.id,
        background_color: category?.background_color || null,
        category_title: category?.category_name || null,
      };
    });
  };

  setupListener();

  return () => {
    if (unsubscribe) unsubscribe();
  };
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

        if (
          !card.assigned_to?.includes(learnerId) &&
          (!card.created_for || card.created_for === "all")
        ) {
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

export const listenToUnassignedCards = (
  learnerId: string,
  categoryId: string | string[],
  callback: (cards: Card[], categoryName: string) => void
): (() => void) => {
  const uid = useAuthStore.getState().user?.uid;
  const categoryCollection = firestore().collection("pecsCategories");

  let query = cardCollection.where("created_by", "==", uid);

  if (Array.isArray(categoryId)) {
    query = query.where("category_id", "in", categoryId);
  } else {
    query = query.where("category_id", "==", categoryId);
  }

  const unsubscribe = query.onSnapshot(async (querySnapshot) => {
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

          // console.log(
          //   `Cards: {card_name: ${card.card_name}, created_for: ${card.created_for}}`
          // );

          if (
            !card.assigned_to?.includes(learnerId) &&
            (!card.created_for ||
              card.created_for === "all" ||
              card.created_for === learnerId)
          ) {
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

    callback(cards, categoryName);
  });

  return unsubscribe;
};

export const assignCard = async (cardId: string, learnerId?: string) => {
  try {
    await cardCollection
      .doc(cardId)
      .update({ assigned_to: arrayUnion(learnerId) });

    const card = await getCardInfoWithId(cardId);
    const category = await getCategoryWithId(card?.category_id);
    const learnerSnapshot = await firestore()
      .collection("users")
      .doc(learnerId)
      .get();

    const learner = learnerSnapshot.data();

    const assignedCard: CardDetail = {
      card_name: card?.card_name,
      card_id: card?.id,
      image: card?.image,
      category_name: category?.category_name,
    };

    const logBody: AssignLog = {
      action: "Assign Card",
      card: assignedCard,
      assigned_by_user_id: "",
      assigned_by_user_name: "",
      assigned_by_user_type: "",
      assigned_to: {
        id: learnerId,
        name: `${learner?.first_name} ${learner?.last_name}`,
      },
      timestamp: new Date(),
    };

    createLog(logBody);
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

  let unsubscribeCards: (() => void) | null = null;

  const unsubscribeCategory = categoryRef.onSnapshot((categoryDoc) => {
    const categoryCache = categoryDoc.data();

    // cleanup old card listener before attaching a new one
    if (unsubscribeCards) unsubscribeCards();

    // If the category itself is admin-created
    if (categoryCache?.created_by_role?.toLowerCase() === "admin") {
      unsubscribeCards = cardCollection
        .where("created_by", "==", "ADMIN")
        .where("category_name", "==", categoryCache.category_name)
        .onSnapshot((snapshot) => {
          const cards: any[] = [];

          snapshot.forEach((doc) => {
            const card = doc.data();
            card.id = doc.id;

            cards.push({
              ...card,
              background_color: categoryCache?.background_color || null,
              category_title: categoryCache?.category_name || "Admin Cards",
            });
          });

          callback(cards);
        });
    } else {
      // Normal case: only cards under this category
      unsubscribeCards = cardCollection
        .where("category_id", "==", categoryId)
        .onSnapshot((snapshot) => {
          const cards: any[] = [];

          snapshot.forEach((doc) => {
            const card = doc.data();
            card.id = doc.id;

            if (
              card.assigned_to?.includes(learnerId) ||
              card?.created_by?.toString().toLowerCase() === "admin"
            ) {
              cards.push({
                ...card,
                background_color: categoryCache?.background_color || null,
                category_title: categoryCache?.category_name || null,
              });
            }
          });

          callback(cards);
        });
    }
  });

  return () => {
    unsubscribeCategory();
    if (unsubscribeCards) unsubscribeCards();
  };
};

export const getCardInfoWithId = async (cardId: string) => {
  const uid = useAuthStore.getState().user?.uid;
  const categoryCollection = firestore().collection("pecsCategories");

  let cardSnapshot = await cardCollection.doc(cardId).get();
  let card = cardSnapshot?.data();

  if (card) {
    card.id = cardId;
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
