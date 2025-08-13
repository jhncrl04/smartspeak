import { useAuthStore } from "@/stores/userAuthStore";
import firestore from "@react-native-firebase/firestore";

type boardProps = { name: string; color: string };

export const addBoard = async (boardInfo: boardProps) => {
  const uid = useAuthStore.getState().user?.uid;

  const boardCollection = firestore().collection("boards");
  const currentDate = new Date();

  const newBoard = {
    title: boardInfo.name,
    backgroundColor: boardInfo.color,
    createdAt: currentDate,
    createdBy: uid,
  };

  await boardCollection.add(newBoard);
};

export const deleteBoard = async (boardId: string) => {
  const boardCollection = firestore().collection("boards");

  boardCollection.doc(boardId).delete();
};

export const getBoard = async () => {
  const uid = useAuthStore.getState().user?.uid;

  const boardCollection = firestore().collection("boards");

  const boards: any[] = [];

  await boardCollection
    .where("createdBy", "==", uid)
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        boards.push(doc.data());
      });
    });

  return boards;
};
