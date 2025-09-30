import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

export type Card = {
  id: string;
  assigned_to?: any[];
  card_name: string;
  category_id: string;
  category_name: string;
  created_at: FirebaseFirestoreTypes.Timestamp;
  created_by: string;
  created_for?: string;
  image: string;
  background_color?: string | null;
};

export type CardsStore = {
  cards: Card[];
  isLoading: boolean;
  error: string | null;
  unsubscribe: (() => void) | null;

  // Actions
  startListener: (userId: string) => void;
  stopListener: () => void;
};
