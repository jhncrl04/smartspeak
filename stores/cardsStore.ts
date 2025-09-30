import { Card, CardsStore } from "@/types/cards";
import firestore from "@react-native-firebase/firestore";
import { create } from "zustand";
import { useAuthStore } from "./userAuthStore";

const CARD_COLLECTION = firestore().collection("cards");

export const listenToCards = (onCardsUpdate: (cards: Card[]) => void) => {
  const uid = useAuthStore.getState().user?.uid;

  const cardQuery = CARD_COLLECTION.where("created_by", "==", uid);

  const unsubscribe = cardQuery.onSnapshot(async (querySnapshot) => {
    const cards = await Promise.all(
      querySnapshot.docs.map(async (doc) => {
        const card = doc.data();
        card.id = doc.id;

        return card as Card;
      })
    );

    onCardsUpdate(cards);
  });

  return unsubscribe; // Call this when you want to stop listening
};

export const useCardsStore = create<CardsStore>((set, get) => ({
  cards: [],
  isLoading: true,
  error: null,
  unsubscribe: null,

  startListener: (userId: string) => {
    // Stop existing listener if any
    get().stopListener();

    set({ isLoading: true, error: null });

    // Query based on user role
    const cardsQuery = CARD_COLLECTION.where("created_by", "==", userId);

    const unsubscribe = cardsQuery.onSnapshot(
      (snapshot) => {
        const cards = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Card[];

        set({ cards, isLoading: false, error: null });
      },
      (error) => {
        console.error("Cards listener error:", error);
        set({ error: error.message, isLoading: false });
      }
    );

    set({ unsubscribe });
  },

  stopListener: () => {
    const { unsubscribe } = get();
    if (unsubscribe) {
      unsubscribe();
      set({ unsubscribe: null });
    }
  },
}));
