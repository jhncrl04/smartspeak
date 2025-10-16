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

import { useCardsStore } from "@/stores/cardsStore";
import { useUsersStore } from "@/stores/userStore";
import NetInfo from "@react-native-community/netinfo";
import { createNotification } from "./notificationService";

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

  const networkStatus = await NetInfo.fetch();
  if (!networkStatus.isConnected) {
    showToast(
      "error",
      "No Internet Connection",
      "Please check your connection and try again"
    );
    throw new Error("No Internet Connection");
  }

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
    assigned_to: [cardInfo.created_for ?? ""],
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
  const networkStatus = await NetInfo.fetch();
  if (!networkStatus.isConnected) {
    showToast(
      "error",
      "No Internet Connection",
      "Please check your connection and try again"
    );
    throw new Error("No Internet Connection");
  }

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
  await cardRef.delete().then(() => {
    showToast(
      "success",
      "Card Deleted",
      `${cardInfo?.card_name} card has been deleted.`
    );
  });

  createLog(logBody);
};

export const updateCard = async (
  cardId: string,
  cardName: string,
  cardImage: string
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

export const assignCard = async (cardId: string, learnerId?: string) => {
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

    const assignedByUser = useAuthStore.getState().user;

    const assignedCard: CardDetail = {
      card_name: card?.card_name,
      card_id: card?.id,
      image: card?.image,
      category_name: category?.category_name,
    };

    const notification: any = {
      action: "Assign Card",
      created_for: learnerId!,
      message: `${assignedByUser?.fname} ${assignedByUser?.lname}(${assignedByUser?.role}) has assigned ${card?.card_name} card to ${learner?.first_name} ${learner?.last_name}`,
      timestamp: firestore.Timestamp.fromDate(new Date()),
      item_name: card?.card_name,
      notification_type: "Card",
      read: false,
      learner_id: learnerId!,
      user_name: `${assignedByUser?.fname} ${assignedByUser?.lname}`,
      user_type: assignedByUser?.role,
      sender_id: assignedByUser?.uid,
    };

    console.log(notification);

    createNotification(notification);

    if (card!.created_by.toLowerCase() !== "admin") {
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
    }
  } catch (err) {
    console.error("Error assigning card: ", err);
  }
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
    const users = useUsersStore.getState().users;
    const cards = useCardsStore.getState().cards;

    const learner = users.find((u) => u.id === learnerId);
    const card = cards.find((c) => c.id === cardId);

    const assignedByUser = useAuthStore.getState().user;

    const notification: any = {
      action: "Unassign Card",
      created_for: learnerId!,
      message: `${assignedByUser?.fname} ${assignedByUser?.lname}(${assignedByUser?.role}) has unassigned ${card?.card_name} card to ${learner?.first_name} ${learner?.last_name}`,
      timestamp: firestore.Timestamp.fromDate(new Date()),
      item_name: card?.card_name,
      notification_type: "Card",
      read: false,
      learner_id: learnerId!,
      user_name: `${assignedByUser?.fname} ${assignedByUser?.lname}`,
      user_type: assignedByUser?.role,
      sender_id: assignedByUser?.uid,
    };

    console.log(notification);

    createNotification(notification);

    await cardCollection
      .doc(cardId)
      .update({ assigned_to: arrayRemove(learnerId) });
  } catch (err) {
    console.error("Error unassigning card: ", err);
  }
};
