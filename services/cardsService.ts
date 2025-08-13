import { useAuthStore } from "@/stores/userAuthStore";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

type cardProps = {
  name: string;
  categoryId: string;
};

export const addCard = async (cardInfo: cardProps) => {
  const uid = useAuthStore.getState().user?.uid;

  const cardCollection = firestore().collection("cards");
  const currentDate = new Date();

  const newCard = {
    title: cardInfo.name,
    board: cardInfo.categoryId,
    createdAt: currentDate,
    createdBy: uid,
  };

  console.log(newCard);
  console.log(auth().currentUser);

  await cardCollection.add(newCard);
};

export const deleteCard = async (cardId: string) => {
  const cardCollection = firestore().collection("cards");

  cardCollection.doc(cardId).delete();
};
