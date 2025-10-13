// stores/learnerSentencesStore.ts
import firestore from "@react-native-firebase/firestore";
import { create } from "zustand";

type Card = {
  card_id: string;
  card_name: string;
  category: string;
  position: number;
};

export type SentenceLog = {
  id: string;
  user_id: string;
  sentence_text: string;
  cards_in_sentence: Card[];
  timestamp: any; // Firestore timestamp
  user_name: string;
  card_count: number;
  action: string; // "sentence played", etc.
};

type LearnerSentencesStore = {
  sentences: SentenceLog[];
  isLoading: boolean;
  error: string | null;
  lastVisible: any | null;
  hasMore: boolean;

  // Fetch first page
  fetchSentences: (learnerId: string, limit?: number) => Promise<void>;

  // Load more (pagination)
  loadMore: (learnerId: string, limit?: number) => Promise<void>;

  // Clear data (when modal closes)
  clearSentences: () => void;
};

const SENTENCE_LOGS_COLLECTION = firestore().collection("pecsLogs");

export const useLearnerSentencesStore = create<LearnerSentencesStore>(
  (set, get) => ({
    sentences: [],
    isLoading: false,
    error: null,
    lastVisible: null,
    hasMore: true,

    fetchSentences: async (learnerId: string, limit = 20) => {
      set({ isLoading: true, error: null, sentences: [], lastVisible: null });

      try {
        const snapshot = await SENTENCE_LOGS_COLLECTION.where(
          "user_id",
          "==",
          learnerId
        )
          .where("action", "==", "sentence played")
          .orderBy("timestamp", "desc") // Most recent first
          .limit(limit)
          .get();

        const sentences = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as SentenceLog[];

        const lastVisible = snapshot.docs[snapshot.docs.length - 1];
        const hasMore = snapshot.docs.length === limit;

        set({
          sentences,
          lastVisible,
          hasMore,
          isLoading: false,
          error: null,
        });
      } catch (error: any) {
        console.error("Error fetching sentences:", error);
        set({ error: error.message, isLoading: false });
      }
    },

    loadMore: async (learnerId: string, limit = 20) => {
      const { lastVisible, hasMore, isLoading } = get();

      if (!hasMore || isLoading || !lastVisible) return;

      set({ isLoading: true });

      try {
        const snapshot = await SENTENCE_LOGS_COLLECTION.where(
          "user_id",
          "==",
          learnerId
        )
          .where("action", "==", "sentence played")
          .orderBy("timestamp", "desc")
          .startAfter(lastVisible)
          .limit(limit)
          .get();

        const newSentences = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as SentenceLog[];

        const newLastVisible = snapshot.docs[snapshot.docs.length - 1];
        const newHasMore = snapshot.docs.length === limit;

        set({
          sentences: [...get().sentences, ...newSentences],
          lastVisible: newLastVisible,
          hasMore: newHasMore,
          isLoading: false,
        });
      } catch (error: any) {
        console.error("Error loading more sentences:", error);
        set({ error: error.message, isLoading: false });
      }
    },

    clearSentences: () => {
      set({
        sentences: [],
        lastVisible: null,
        hasMore: true,
        error: null,
        isLoading: false,
      });
    },
  })
);
