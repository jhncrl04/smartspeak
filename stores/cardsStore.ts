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

  startListener: (userId: string, learnerIds?: string[]) => {
    // Stop existing listener if any
    get().stopListener();

    set({ isLoading: true, error: null });

    const cardsMap = new Map<string, Card>();
    const unsubscribers: (() => void)[] = [];

    const updateCards = () => {
      const cards = Array.from(cardsMap.values());
      set({ cards, isLoading: false, error: null });
    };

    // Listen to cards created by the current user
    // These should ALWAYS be included, regardless of learner filtering
    const userUnsubscribe = CARD_COLLECTION.where(
      "created_by",
      "==",
      userId
    ).onSnapshot(
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const card = {
            id: change.doc.id,
            ...change.doc.data(),
          } as Card;

          if (change.type === "added" || change.type === "modified") {
            // Always include cards created by the user
            cardsMap.set(change.doc.id, card);
          } else if (change.type === "removed") {
            cardsMap.delete(change.doc.id);
          }
        });

        updateCards();
      },
      (error) => {
        console.error("Cards listener error:", error);
        set({ error: error.message, isLoading: false });
      }
    );
    unsubscribers.push(userUnsubscribe);

    // Listen to cards from OTHER teachers/guardians assigned to learners
    if (learnerIds && learnerIds.length > 0) {
      // Split into batches of 10 if needed (array-contains-any limit)
      const batchSize = 10;
      for (let i = 0; i < learnerIds.length; i += batchSize) {
        const batch = learnerIds.slice(i, i + batchSize);

        const assignedUnsubscribe = CARD_COLLECTION.where(
          "assigned_to",
          "array-contains-any",
          batch
        ).onSnapshot(
          (snapshot) => {
            snapshot.docChanges().forEach((change) => {
              const card = {
                id: change.doc.id,
                ...change.doc.data(),
              } as Card;

              // Only process cards NOT created by the current user
              // (to avoid duplicates with the user listener above)
              if (card.created_by !== userId) {
                if (change.type === "added" || change.type === "modified") {
                  cardsMap.set(change.doc.id, card);
                } else if (change.type === "removed") {
                  cardsMap.delete(change.doc.id);
                }
              }
            });
            updateCards();
          },
          (error) => {
            console.error("Assigned cards listener error:", error);
            set({ error: error.message, isLoading: false });
          }
        );
        unsubscribers.push(assignedUnsubscribe);
      }
    }

    // Listen to admin cards
    // Always include admin cards regardless of learner filtering
    const adminUnsubscribe = CARD_COLLECTION.where(
      "created_by",
      "==",
      "ADMIN"
    ).onSnapshot(
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const card = {
            id: change.doc.id,
            ...change.doc.data(),
          } as Card;

          if (change.type === "added" || change.type === "modified") {
            // Always include admin cards
            cardsMap.set(change.doc.id, card);
          } else if (change.type === "removed") {
            cardsMap.delete(change.doc.id);
          }
        });
        updateCards();
      },
      (error) => {
        console.error("Admin cards listener error:", error);
        set({ error: error.message, isLoading: false });
      }
    );
    unsubscribers.push(adminUnsubscribe);

    // Combined unsubscribe function
    const combinedUnsubscribe = () => {
      unsubscribers.forEach((unsub) => unsub());
    };

    set({ unsubscribe: combinedUnsubscribe });
  },

  stopListener: () => {
    const { unsubscribe } = get();
    if (unsubscribe) {
      unsubscribe();
      set({ unsubscribe: null });
    }
  },
}));
