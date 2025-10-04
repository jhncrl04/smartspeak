import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

export type Category = {
  id: string;
  category_name: string;
  background_color: string;
  created_at: FirebaseFirestoreTypes.Timestamp;
  created_by: string;
  created_for?: string;
  image: string;
  is_assignable?: boolean;
  assigned_to?: string[];
};

export type CategoriesStore = {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  unsubscribe: (() => void) | null;

  startListener: (userId: string) => void;
  stopListener: () => void;
};
