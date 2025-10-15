import { ThemedView } from "@/components/ThemedView";
import { useAuthStore } from "@/stores/userAuthStore";
import NetInfo from "@react-native-community/netinfo";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { useFonts } from "expo-font";
import { router } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import * as Speech from "expo-speech";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";

export default function HomeScreen() {
  // Get user data from auth store
  const user = useAuthStore((state) => state.user);

  // LOGOUT FUNCTION
  const logout = useAuthStore((state) => state.logout);

  const [fontsLoaded] = useFonts({
    Poppins: require("../../../assets/fonts/Poppins-Regular.ttf"),
  });

  // State to store user's full name
  const [userFullName, setUserFullName] = useState<string>("");

  // Speech initialization state
  const [isSpeechReady, setIsSpeechReady] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  // Network status state
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // Voice status state
  const [currentVoice, setCurrentVoice] = useState<string>("Checking...");

  // Function to check available voices
  const checkAvailableVoices = async () => {
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      console.log("=== AVAILABLE VOICES ===");
      voices.forEach((voice, index) => {
        console.log(
          `${index + 1}. ${voice.name} - ${voice.language} - ${
            voice.quality || "Unknown quality"
          }`
        );
      });
      console.log("=== END VOICES ===");

      // Check if Filipino voice is available
      const filipinoVoices = voices.filter(
        (voice) =>
          voice.language.includes("fil") ||
          voice.language.includes("tl") ||
          voice.name.toLowerCase().includes("filipino")
      );
      console.log("Filipino voices found:", filipinoVoices.length);

      if (filipinoVoices.length > 0) {
        setCurrentVoice(`Filipino (${filipinoVoices[0].name})`);
      } else {
        setCurrentVoice("English (Default)");
      }

      return voices;
    } catch (error) {
      console.error("Error checking voices:", error);
      setCurrentVoice("Error checking voices");
      return [];
    }
  };

  // Function to get user's full name from Firebase
  const fetchUserFullName = async () => {
    if (!user?.uid) return "";

    try {
      console.log("=== FETCHING USER FULL NAME ===");
      const userDoc = await firestore().collection("users").doc(user.uid).get();

      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("User data from Firebase:", userData);

        // Get the full name using the same logic as ProfileScreen
        const firstName = userData?.first_name || userData?.fname || "";
        const lastName = userData?.last_name || userData?.lname || "";
        const fullName = `${firstName} ${lastName}`.trim();

        console.log("First name:", firstName);
        console.log("Last name:", lastName);
        console.log("Combined full name:", fullName);

        // If no name is available, fall back to email
        const displayName = fullName || user?.email || "Unknown User";
        console.log("Final display name:", displayName);

        setUserFullName(displayName);
        return displayName;
      } else {
        console.log("User document does not exist");
        const fallbackName = user?.email || "Unknown User";
        setUserFullName(fallbackName);
        return fallbackName;
      }
    } catch (error) {
      console.error("Error fetching user full name:", error);
      const fallbackName = user?.email || "Unknown User";
      setUserFullName(fallbackName);
      return fallbackName;
    }
  };

  // ONLY KEEP: Sentence play logging function
  const logPlaySentence = async (sentenceCards: SentenceCardType[]) => {
    try {
      // Only log if online
      if (!isOnline) {
        console.log("Offline mode - skipping sentence play logging");
        return;
      }

      // Get fresh user name if not already loaded
      let currentUserName = userFullName;
      if (!currentUserName || currentUserName === user?.email) {
        console.log("User full name not loaded, fetching now...");
        currentUserName = await fetchUserFullName();
      }

      console.log("Logging sentence play with user name:", currentUserName);

      const sentence = sentenceCards.map((card) => card.text).join(" ");
      const cardDetails = sentenceCards.map((card, index) => ({
        card_id: card.id,
        card_name: card.text,
        category: card.categoryId,
        position: index + 1,
      }));

      const logData = {
        user_id: user?.uid || "unknown",
        user_name: currentUserName || user?.email || "unknown",
        action: "sentence played",
        sentence_text: sentence,
        card_count: sentenceCards.length,
        cards_in_sentence: cardDetails,
        timestamp: firestore.FieldValue.serverTimestamp(),
        user_type: "learner",
      };

      await firestore().collection("pecsLogs").add(logData);
      console.log("Sentence play logged to pecsLogs:", sentence);
    } catch (error) {
      console.error("Error logging sentence play:", error);
    }
  };

  // Function to handle logout
  const handleLogout = async () => {
    setShowSettingsModal(false);

    try {
      // Sign out from Firebase Auth
      await auth().signOut();

      // Clear user data from Zustand store
      logout();

      // Navigate back to login screen
      router.replace("/");

      console.log("User logged out successfully");
    } catch (error) {
      console.error("Error during logout:", error);
      alert("Error logging out. Please try again.");
    }
  };

  useEffect(() => {
    const lockOrientation = async () => {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE
      );
    };
    lockOrientation();
  }, []);

  // Network status detection
  useEffect(() => {
    const checkNetworkStatus = async () => {
      try {
        const networkState = await NetInfo.fetch();
        setIsOnline(networkState.isConnected ?? true);
        console.log(
          "Network status:",
          networkState.isConnected ? "Online" : "Offline"
        );
      } catch (error) {
        console.error("Error checking network status:", error);
        setIsOnline(true); // Assume online as fallback
      }
    };

    // Check initially
    checkNetworkStatus();

    // Listen for network changes
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? true);
      console.log(
        "Network status changed:",
        state.isConnected ? "Online" : "Offline"
      );
    });

    return () => unsubscribe();
  }, []);

  const { width, height } = Dimensions.get("window");
  const isTablet = width > 968;
  const cardsPerRow = isTablet ? 8 : width > 600 ? 6 : 4;
  const cardWidth = (width * 1 - 26 * (cardsPerRow + 1)) / cardsPerRow;
  const cardHeight = cardWidth * 1;

  type CardType = {
    id: string;
    image: string;
    text: string;
    categoryId: string;
  };

  type SentenceCardType = CardType & {
    categoryColor: string;
  };

  type CategoryType = {
    id: string;
    category_name: string;
    image: string;
    background_color?: string;
  };

  const [sentenceCards, setSentenceCards] = useState<SentenceCardType[]>([]);
  const [allCards, setAllCards] = useState<CardType[]>([]);
  const [displayedCards, setDisplayedCards] = useState<CardType[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPlayingCardName, setIsPlayingCardName] = useState<boolean>(false);

  // New states for tap unlock feature
  const [tapCount, setTapCount] = useState<number>(0);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const tapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // New states for notification
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const notificationOpacity = useRef(new Animated.Value(0)).current;
  const notificationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  // Break reminder states
  const [showBreakReminder, setShowBreakReminder] = useState<boolean>(false);
  const breakReminderOpacity = useRef(new Animated.Value(0)).current;
  const breakReminderTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  // Animation for card tap feedback
  const cardTapScale = useRef(new Animated.Value(1)).current;

  // Refs to prevent infinite updates
  const categoriesRef = useRef<CategoryType[]>([]);
  const allCardsRef = useRef<CardType[]>([]);
  const displayedCardsRef = useRef<CardType[]>([]);

  // Add state for footer readiness
  const [isFooterReady, setIsFooterReady] = useState(false);

  // Enhanced speech function with better Filipino support
  const speakWithSpeech = async (text: string, options = {}) => {
    try {
      // Stop any current speech first
      await Speech.stop();
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Check available voices
      const availableVoices = await Speech.getAvailableVoicesAsync();

      // Try to find the best available voice for Filipino
      let bestVoice = null;

      // Priority 1: Exact Filipino voice
      bestVoice = availableVoices.find(
        (voice) => voice.language === "fil-PH" || voice.language === "tl-PH"
      );

      // Priority 2: Any Filipino language
      if (!bestVoice) {
        bestVoice = availableVoices.find(
          (voice) =>
            voice.language.includes("fil") || voice.language.includes("tl")
        );
      }

      // Priority 3: Enhanced quality default voice
      if (!bestVoice) {
        bestVoice = availableVoices.find(
          (voice) => voice.quality === "Enhanced"
        );
      }

      // Priority 4: Any default voice
      if (!bestVoice) {
        bestVoice = availableVoices.find(
          (voice) => voice.quality === "Default"
        );
      }

      console.log(
        "Selected voice:",
        bestVoice?.name,
        "Language:",
        bestVoice?.language
      );

      const speechOptions = {
        language: "fil-PH", // Always try Filipino first
        pitch: 1.1,
        rate: 0.75,
        ...options,
      };

      // Add voice if found
      if (bestVoice) {
        speechOptions.voice = bestVoice.identifier;
      }

      await Speech.speak(text, speechOptions);

      return true;
    } catch (error) {
      console.error("Error with Filipino speech:", error);

      // Fallback strategies for Filipino
      try {
        // Try different Filipino language codes
        const languageAttempts = ["fil-PH", "tl-PH", "fil", "tl"];

        for (const lang of languageAttempts) {
          try {
            await Speech.stop();
            await new Promise((resolve) => setTimeout(resolve, 50));

            await Speech.speak(text, {
              language: lang,
              pitch: 1.0,
              rate: 0.8,
            });
            console.log(`Success with language: ${lang}`);
            return true;
          } catch (langError) {
            if (langError instanceof Error) {
              console.log(`Failed with language ${lang}:`, langError.message);
            } else {
              console.log(`Failed with language ${lang}:`, String(langError));
            }
            continue;
          }
        }

        // If all Filipino attempts fail, try English as last resort
        if (!isOnline) {
          await Speech.speak(text, {
            language: "en-US",
            pitch: 1.0,
            rate: 0.8,
          });
          console.log("Used English fallback for offline speech");
          return true;
        }
      } catch (fallbackError) {
        console.error("All speech fallbacks failed:", fallbackError);
      }

      return false;
    }
  };

  // Initialize Speech with voice checking
  useEffect(() => {
    const initializeSpeech = async () => {
      try {
        console.log("Initializing Speech...");

        // Check available voices first
        await checkAvailableVoices();

        // Pre-warm the speech engine with a silent utterance
        await Speech.speak(" ", {
          language: "fil-PH",
          pitch: 1.0,
          rate: 0.8,
          volume: 0.01,
        });

        // Stop immediately after a short delay
        setTimeout(async () => {
          await Speech.stop();
          setIsSpeechReady(true);
          console.log("Speech initialized successfully");
        }, 100);
      } catch (error) {
        console.error("Error initializing speech:", error);
        setSpeechError("Speech may not work properly");
        setIsSpeechReady(true);
      }
    };

    initializeSpeech();
  }, []);

  // Ultimate fallback: play each card individually
  const playCardsIndividually = async (cards: SentenceCardType[]) => {
    for (const card of cards) {
      await playCardName(card.text);
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
  };

  // Play sentence in chunks for better offline reliability
  const playChunkedSentence = async (cards: SentenceCardType[]) => {
    const chunkSize = 3;
    const delayBetweenChunks = 500;

    for (let i = 0; i < cards.length; i += chunkSize) {
      const chunk = cards.slice(i, i + chunkSize);
      const chunkText = chunk.map((card) => card.text).join(" ");

      const success = await speakWithSpeech(chunkText, { rate: 0.8 });

      if (!success) {
        // If chunk fails, try playing individual cards in this chunk
        for (const card of chunk) {
          await playCardName(card.text);
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      }

      // Wait between chunks
      if (i + chunkSize < cards.length) {
        await new Promise((resolve) => setTimeout(resolve, delayBetweenChunks));
      }
    }
  };

  // Function to show notification
  const showNotificationMessage = () => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }

    setShowNotification(true);

    Animated.timing(notificationOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();

    notificationTimeoutRef.current = setTimeout(() => {
      Animated.timing(notificationOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        setShowNotification(false);
      });
    }, 2000);
  };

  // Function to show break reminder
  const showBreakReminderMessage = async () => {
    setShowBreakReminder(true);

    Animated.timing(breakReminderOpacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: false,
    }).start();

    // Speak the break reminder message
    try {
      await Speech.stop(); // Stop any ongoing speech
      await new Promise((resolve) => setTimeout(resolve, 100));

      const breakMessage =
        "Time for a break! You've been using the app for 1 hour. Take a short break to rest your eyes and stretch.";
      await speakWithSpeech(breakMessage, { rate: 0.8 });
    } catch (error) {
      console.error("Error speaking break reminder:", error);
    }
  };

  // Function to dismiss break reminder
  const dismissBreakReminder = () => {
    Animated.timing(breakReminderOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setShowBreakReminder(false);
      // Reset timer for another 30 minutes
      startBreakReminderTimer();
    });
  };

  // Function to start break reminder timer
  const startBreakReminderTimer = () => {
    if (breakReminderTimeoutRef.current) {
      clearTimeout(breakReminderTimeoutRef.current);
    }

    // 30 minutes = 1800000 milliseconds
    breakReminderTimeoutRef.current = setTimeout(() => {
      showBreakReminderMessage();
    }, 3600000); // 30 minutes
  };

  // Function to handle profile image taps
  const handleProfileTap = () => {
    setTapCount((prev) => {
      const newCount = prev + 1;

      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
      }

      if (newCount >= 5) {
        setShowSettingsModal(true);
        return 0;
      }

      tapTimeoutRef.current = setTimeout(() => {
        setTapCount(0);
      }, 2000);

      return newCount;
    });
  };

  // Function to handle account settings
  const handleAccountSettings = () => {
    setShowSettingsModal(false);
    router.push("../screens/learner/profile");
  };

  // Clean up timeout on unmount
  useEffect(() => {
    // Start break reminder timer when component mounts
    startBreakReminderTimer();

    return () => {
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
      }
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
      if (breakReminderTimeoutRef.current) {
        clearTimeout(breakReminderTimeoutRef.current);
      }
      Speech.stop();
    };
  }, []);

  // Function to play card name using Expo Speech
  const playCardName = async (cardText: string) => {
    if (isPlayingCardName) {
      await Speech.stop();
    }

    setIsPlayingCardName(true);

    try {
      const success = await speakWithSpeech(cardText);

      if (!success) {
        console.warn("Speech failed for card:", cardText);
      }

      const estimatedDuration = Math.max(1000, cardText.length * 200);
      setTimeout(() => {
        setIsPlayingCardName(false);
      }, estimatedDuration);
    } catch (error) {
      console.error("Error playing card name:", error);
      setIsPlayingCardName(false);
    }
  };

  // Function to handle card tap
  const handleCardTap = async (card: CardType) => {
    if (sentenceCards.length >= 8) {
      console.log("Sentence strip is full");
      return;
    }

    Animated.sequence([
      Animated.timing(cardTapScale, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(cardTapScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    const currentCategoryColor = getCurrentCategoryBackgroundColor();

    const sentenceCard: SentenceCardType = {
      ...card,
      categoryColor: currentCategoryColor,
    };

    setSentenceCards((prev) => [...prev, sentenceCard]);
    await playCardName(card.text);

    console.log(
      "Card added to sentence with color:",
      card.text,
      currentCategoryColor
    );
  };

  // Helper function to get current category background color
  const getCurrentCategoryBackgroundColor = () => {
    const currentCategory = categories.find(
      (cat) => cat.id === selectedCategory
    );
    return currentCategory?.background_color || "#5FA056";
  };

  // Enhanced function to filter and update displayed cards with ID-based matching
  const updateDisplayedCards = useCallback(
    (
      allCards: CardType[],
      categories: CategoryType[],
      selectedCatId: string
    ) => {
      if (!selectedCatId || categories.length === 0 || allCards.length === 0) {
        setDisplayedCards([]);
        displayedCardsRef.current = [];
        return;
      }

      const selectedCat = categories.find((cat) => cat.id === selectedCatId);
      if (!selectedCat) {
        console.log("Selected category not found:", selectedCatId);
        setDisplayedCards([]);
        displayedCardsRef.current = [];
        return;
      }

      console.log(
        "Updating displayed cards for category:",
        selectedCat.category_name,
        "ID:",
        selectedCat.id
      );

      const filteredCards = allCards.filter((card) => {
        const hasDirectCategoryIdMatch = card.categoryId === selectedCat.id;

        const categoryName = selectedCat.category_name;
        const cardCategoryId = card.categoryId;

        const exactMatch = cardCategoryId === categoryName;
        const caseInsensitiveMatch =
          cardCategoryId.toLowerCase() === categoryName.toLowerCase();
        const trimmedMatch =
          cardCategoryId.trim().toLowerCase() ===
          categoryName.trim().toLowerCase();

        const matches =
          hasDirectCategoryIdMatch ||
          exactMatch ||
          caseInsensitiveMatch ||
          trimmedMatch;

        if (matches) {
          console.log(
            `Card "${card.text}" matches category "${selectedCat.category_name}"`
          );
        }

        return matches;
      });

      console.log(
        `Found ${filteredCards.length} cards for category "${selectedCat.category_name}"`
      );

      if (!areArraysEqual(displayedCardsRef.current, filteredCards)) {
        displayedCardsRef.current = filteredCards;
        setDisplayedCards(filteredCards);
      }
    },
    []
  );

  // Improved function to filter categories to only show those with cards
  const filterCategoriesWithCards = useCallback(
    (
      allCategories: CategoryType[],
      allCardsData: CardType[]
    ): CategoryType[] => {
      const categoriesWithCards = allCategories.filter((category) => {
        const categoryCards = allCardsData.filter((card) => {
          const hasDirectCategoryIdMatch = card.categoryId === category.id;

          const categoryName = category.category_name;
          const cardCategoryId = card.categoryId;

          const exactMatch = cardCategoryId === categoryName;
          const caseInsensitiveMatch =
            cardCategoryId.toLowerCase() === categoryName.toLowerCase();
          const trimmedMatch =
            cardCategoryId.trim().toLowerCase() ===
            categoryName.trim().toLowerCase();

          return (
            hasDirectCategoryIdMatch ||
            exactMatch ||
            caseInsensitiveMatch ||
            trimmedMatch
          );
        });

        const hasCards = categoryCards.length > 0;
        console.log(
          `Category "${category.category_name}" (ID: ${category.id}) has ${
            categoryCards.length
          } cards - ${hasCards ? "SHOWING" : "HIDING"}`
        );

        return hasCards;
      });

      console.log(
        "Categories with cards:",
        categoriesWithCards.map((c) => `${c.category_name} (${c.id})`)
      );
      return categoriesWithCards;
    },
    []
  );

  // Helper function to check if data actually changed
  const hasDataChanged = (oldData: any[], newData: any[]) => {
    if (oldData.length !== newData.length) return true;

    return newData.some((newItem, index) => {
      const oldItem = oldData[index];
      if (!oldItem) return true;

      if (newItem.id !== oldItem.id) return true;
      if (newItem.category_name !== oldItem.category_name) return true;
      if (newItem.image !== oldItem.image) return true;
      if (newItem.background_color !== oldItem.background_color) return true;
      if (newItem.categoryId !== oldItem.categoryId) return true;

      return false;
    });
  };

  const areArraysEqual = (arr1: any[], arr2: any[]) => {
    if (arr1.length !== arr2.length) return false;

    return arr1.every((item, index) => {
      const item2 = arr2[index];
      if (!item2) return false;

      if (item.id !== item2.id) return false;
      if (item.category_name !== item2.category_name) return false;
      if (item.image !== item2.image) return false;
      if (item.background_color !== item2.background_color) return false;
      if (item.categoryId !== item2.categoryId) return false;

      return true;
    });
  };

  // Handle category press
  const handleCategoryPress = useCallback((categoryId: string) => {
    console.log("Category pressed:", categoryId);
    setSelectedCategory(categoryId);
  }, []);

  // Use real-time listeners with proper update handling
  useEffect(() => {
    if (!user?.uid) {
      console.log("No user found, not setting up listeners");
      setLoading(false);
      setIsFooterReady(true);
      return;
    }

    console.log("=== SETTING UP REAL-TIME LISTENERS ===");
    console.log("Current user ID:", user.uid);

    setLoading(true);
    setIsFooterReady(false);

    fetchUserFullName();

    const unsubscribeListeners: (() => void)[] = [];

    // Real-time listener for categories - ONLY SHOW ASSIGNED CATEGORIES
    const categoriesUnsubscribe = firestore()
      .collection("pecsCategories")
      .onSnapshot(
        async (categoriesSnapshot) => {
          try {
            console.log("=== CATEGORIES UPDATED ===");
            const allCategoriesData: CategoryType[] = [];

            categoriesSnapshot.docs.forEach((categoryDoc) => {
              const categoryData = categoryDoc.data();
              const currentUserId = user?.uid;

              console.log(`\n--- Category ${categoryDoc.id} ---`);
              console.log("Category name:", categoryData.category_name);
              console.log("Created by:", categoryData.created_by);
              console.log("Assigned to:", categoryData.assigned_to);

              let shouldShowCategory = false;

              if (
                categoryData.assigned_to &&
                Array.isArray(categoryData.assigned_to) &&
                categoryData.assigned_to.includes(currentUserId)
              ) {
                shouldShowCategory = true;
                console.log("Showing category: Assigned to current user");
              } else {
                console.log("Hiding category: Not assigned to current user");
              }

              if (shouldShowCategory) {
                allCategoriesData.push({
                  id: categoryDoc.id,
                  category_name:
                    categoryData.category_name || "Unknown Category",
                  image: categoryData.image || "",
                  background_color: categoryData.background_color || "#5FA056",
                });
                console.log("✓ Category added to display");
              } else {
                console.log("✗ Category filtered out");
              }
            });

            console.log(
              "All accessible categories:",
              allCategoriesData.map((c) => c.category_name)
            );

            const categoriesChanged = hasDataChanged(
              categoriesRef.current,
              allCategoriesData
            );

            if (categoriesChanged) {
              console.log("Categories changed - updating state");
              categoriesRef.current = allCategoriesData;

              const filteredCategories = filterCategoriesWithCards(
                allCategoriesData,
                allCardsRef.current
              );
              console.log(
                "Categories with cards:",
                filteredCategories.map((c) => c.category_name)
              );

              setCategories(filteredCategories);

              if (filteredCategories.length > 0 && !selectedCategory) {
                const firstCategoryId = filteredCategories[0].id;
                setSelectedCategory(firstCategoryId);
                console.log("Auto-selected first category:", firstCategoryId);
              }

              setIsFooterReady(true);

              if (selectedCategory) {
                updateDisplayedCards(
                  allCardsRef.current,
                  filteredCategories,
                  selectedCategory
                );
              }
            } else {
              console.log("Categories unchanged - skipping state update");
              setIsFooterReady(true);
            }
          } catch (error) {
            console.error("Error processing categories update:", error);
            setIsFooterReady(true);
          }
        },
        (error) => {
          console.error("Error in categories listener:", error);
          setIsFooterReady(true);
        }
      );

    unsubscribeListeners.push(categoriesUnsubscribe);

    // Real-time listener for cards - ONLY SHOW ASSIGNED CARDS
    const cardsUnsubscribe = firestore()
      .collection("cards")
      .onSnapshot(
        async (cardsSnapshot) => {
          try {
            console.log("=== CARDS UPDATED ===");
            const cardsData: CardType[] = [];

            console.log("Total cards in database:", cardsSnapshot.docs.length);

            cardsSnapshot.docs.forEach((cardDoc) => {
              const cardData = cardDoc.data();
              const currentUserId = user?.uid;

              console.log(`\n--- Card ${cardDoc.id} ---`);
              console.log("Card name:", cardData.card_name);
              console.log("Created by:", cardData.created_by);
              console.log("Assigned to:", cardData.assigned_to);

              let shouldShowCard = false;

              if (
                cardData.assigned_to &&
                Array.isArray(cardData.assigned_to) &&
                cardData.assigned_to.includes(currentUserId)
              ) {
                shouldShowCard = true;
                console.log("Showing card: Assigned to current user");
              } else {
                console.log("Hiding card: Not assigned to current user");
              }

              if (shouldShowCard) {
                cardsData.push({
                  id: cardDoc.id,
                  image: cardData.image || "",
                  text: cardData.card_name || cardData.text || "No text",
                  categoryId:
                    cardData.category_id || cardData.category_name || "",
                });
                console.log(
                  "✓ Card added to display:",
                  cardData.card_name,
                  "Category ref:",
                  cardData.category_id || cardData.category_name
                );
              } else {
                console.log("✗ Card filtered out");
              }
            });

            console.log("Filtered cards count:", cardsData.length);

            const cardsChanged = hasDataChanged(allCardsRef.current, cardsData);

            const hasIndividualCardChanges = allCardsRef.current.some(
              (oldCard, index) => {
                const newCard = cardsData[index];
                if (!newCard) return true;

                return (
                  oldCard.text !== newCard.text ||
                  oldCard.image !== newCard.image ||
                  oldCard.categoryId !== newCard.categoryId
                );
              }
            );

            if (cardsChanged || hasIndividualCardChanges) {
              console.log(
                "Cards changed or individual card properties updated - updating state"
              );
              allCardsRef.current = cardsData;
              setAllCards(cardsData);

              const filteredCategories = filterCategoriesWithCards(
                categoriesRef.current,
                cardsData
              );
              console.log(
                "Categories with cards after cards update:",
                filteredCategories.map((c) => c.category_name)
              );

              setCategories(filteredCategories);

              if (selectedCategory && filteredCategories.length > 0) {
                updateDisplayedCards(
                  cardsData,
                  filteredCategories,
                  selectedCategory
                );
              } else if (filteredCategories.length > 0 && !selectedCategory) {
                const firstCategoryId = filteredCategories[0].id;
                setSelectedCategory(firstCategoryId);
                console.log(
                  "Auto-selected first category after cards update:",
                  firstCategoryId
                );
              }
            } else {
              console.log("Cards unchanged - skipping state update");
            }
          } catch (error) {
            console.error("Error processing cards update:", error);
          }
        },
        (error) => {
          console.error("Error in cards listener:", error);
        }
      );

    unsubscribeListeners.push(cardsUnsubscribe);

    // Individual card update listener for real-time text changes
    const cardUpdatesUnsubscribe = firestore()
      .collection("cards")
      .where("assigned_to", "array-contains", user.uid)
      .onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "modified") {
            console.log(
              "Card modified - forcing update:",
              change.doc.id,
              change.doc.data().card_name
            );

            setAllCards((prev) => [...prev]);
            setDisplayedCards((prev) => [...prev]);
          }
        });
      });

    unsubscribeListeners.push(cardUpdatesUnsubscribe);

    setTimeout(() => {
      setLoading(false);
      if (!isFooterReady) {
        setIsFooterReady(true);
      }
    }, 1000);

    return () => {
      console.log("=== CLEANING UP REAL-TIME LISTENERS ===");
      unsubscribeListeners.forEach((unsubscribe) => unsubscribe());
    };
  }, [user?.uid, updateDisplayedCards, filterCategoriesWithCards]);

  // Effect to handle category selection changes
  useEffect(() => {
    if (selectedCategory && categories.length > 0 && allCards.length > 0) {
      console.log("Category selection changed, updating displayed cards");
      updateDisplayedCards(allCards, categories, selectedCategory);
    }
  }, [selectedCategory, categories, allCards, updateDisplayedCards]);

  const clearSentence = () => {
    setSentenceCards([]);
  };

  const removeLastCard = () => {
    setSentenceCards((prev) => prev.slice(0, -1));
  };

  // Enhanced Play sentence function with offline support
  const playSentence = async () => {
    if (sentenceCards.length > 0 && !isPlaying) {
      setIsPlaying(true);

      // LOG: Sentence play action
      await logPlaySentence(sentenceCards);

      try {
        await Speech.stop();
        setIsPlayingCardName(false);

        await new Promise((resolve) => setTimeout(resolve, 100));

        const sentence = sentenceCards.map((card) => card.text).join(" ");
        console.log("Playing sentence:", sentence);

        // Always try Filipino first, even offline
        const success = await speakWithSpeech(sentence, { rate: 0.75 });

        if (!success) {
          console.warn(
            "Filipino sentence speech failed, trying chunked approach"
          );
          await playChunkedSentence(sentenceCards);
        }

        const sentenceDuration = Math.max(2000, sentence.length * 150);
        setTimeout(() => {
          setIsPlaying(false);
        }, sentenceDuration);
      } catch (error) {
        console.error("Error playing sentence:", error);

        // Final fallback: play cards individually
        await playCardsIndividually(sentenceCards);
        setIsPlaying(false);
      }
    } else if (sentenceCards.length === 0) {
      showNotificationMessage();
    }
  };

  // Stop speech function
  const stopSpeech = async () => {
    try {
      await Speech.stop();
      setIsPlaying(false);
      setIsPlayingCardName(false);
    } catch (error) {
      console.error("Error stopping speech:", error);
    }
  };

  // Simplified card render function
  const renderCard = ({
    item,
    index,
  }: {
    item: CardType;
    index: number;
  }): JSX.Element => {
    console.log(`Rendering card: ${item.text} (ID: ${item.id})`);

    const cardBackgroundColor = getCurrentCategoryBackgroundColor();

    return (
      <TouchableOpacity
        style={[
          styles.card,
          {
            width: cardWidth,
            height: cardHeight,
            backgroundColor: cardBackgroundColor,
          },
        ]}
        onPress={() => handleCardTap(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>
          <View
            style={[
              styles.imageContainer,
              {
                width: cardWidth,
                height: cardHeight * 0.7,
              },
            ]}
          >
            <Image
              source={
                item.image
                  ? { uri: item.image }
                  : require("@/assets/images/User.png")
              }
              style={styles.imageCard}
            />
          </View>
          <View
            style={[
              styles.textContainer,
              {
                width: cardWidth,
                height: cardHeight * 0.3,
              },
            ]}
          >
            <Text
              style={[styles.cardText]}
              numberOfLines={2}
              adjustsFontSizeToFit={true}
              minimumFontScale={0.6}
              textBreakStrategy="balanced"
            >
              {item.text}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Sentence card render function
  const renderSentenceCard = (
    card: SentenceCardType,
    index: number
  ): JSX.Element => {
    return (
      <TouchableOpacity
        key={`sentence-${card.id}-${index}`}
        style={[styles.sentenceCard, { backgroundColor: card.categoryColor }]}
        onPress={() => {
          setSentenceCards((prev: SentenceCardType[]) =>
            prev.filter((_, i: number) => i !== index)
          );
        }}
      >
        <View style={styles.sentenceCardImageContainer}>
          <Image
            source={
              card.image
                ? { uri: card.image }
                : require("@/assets/images/User.png")
            }
            style={styles.sentenceCardImage}
          />
        </View>
        <View style={styles.sentenceCardTextContainer}>
          <Text
            style={styles.sentenceCardText}
            numberOfLines={2}
            adjustsFontSizeToFit={true}
            minimumFontScale={0.5}
            textBreakStrategy="balanced"
          >
            {card.text}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Add a debug component to show speech status
  const renderSpeechStatus = () => {
    if (speechError) {
      return (
        <View style={styles.speechErrorContainer}>
          <Text style={styles.speechErrorText}>Note: {speechError}</Text>
        </View>
      );
    }
    return null;
  };

  if (!fontsLoaded) {
    return null;
  }

  const getItemLayout = (
    data: CardType[] | null | undefined,
    index: number
  ) => ({
    length: cardHeight + 10,
    offset: Math.floor(index / cardsPerRow) * (cardHeight + 10),
    index,
  });

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#9B72CF" />
        <Text style={styles.loadingText}>Loading data from Firebase...</Text>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Speech Status Indicator */}
      {renderSpeechStatus()}

      {/* Network Status Indicator */}
      {!isOnline && (
        <View style={styles.offlineContainer}>
          <Text style={styles.offlineText}>Offline Mode</Text>
        </View>
      )}

      {/* NOTIFICATION BOX */}
      {showNotification && (
        <Animated.View
          style={[
            styles.notificationContainer,
            {
              opacity: notificationOpacity,
            },
          ]}
        >
          <View style={styles.notificationBox}>
            <Text style={styles.notificationText}>
              Please add cards to create a sentence first
            </Text>
          </View>
        </Animated.View>
      )}

      {/* BREAK REMINDER NOTIFICATION */}
      {showBreakReminder && (
        <Animated.View
          style={[
            styles.breakReminderContainer,
            {
              opacity: breakReminderOpacity,
            },
          ]}
        >
          <View style={styles.breakReminderBox}>
            <Text style={styles.breakReminderTitle}>Time for a Break!</Text>
            <Text style={styles.breakReminderText}>
              You've been using the app for 1 hour. Take a short break to rest
              your eyes and stretch!
            </Text>
            <TouchableOpacity
              style={styles.breakReminderButton}
              onPress={dismissBreakReminder}
            >
              <Text style={styles.breakReminderButtonText}>OK, Got it!</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.userInfoContainer}>
          <TouchableOpacity onPress={handleProfileTap}>
            <Image
              source={require("@/assets/images/user2.png")}
              style={styles.headerImage}
            />
            {tapCount > 0 && tapCount < 5 && (
              <View style={styles.tapIndicator}>
                <Text style={styles.tapIndicatorText}>{tapCount}/5</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Settings Modal */}
      <Modal
        visible={showSettingsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSettingsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Settings</Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleAccountSettings}
            >
              <Text style={styles.modalButtonText}>Account Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.logoutButton]}
              onPress={handleLogout}
            >
              <Text style={[styles.modalButtonText, styles.logoutButtonText]}>
                Log Out
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowSettingsModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MAIN BODY */}
      <View style={styles.body}>
        {/* SENTENCE STRIP */}
        <View style={styles.firstContainer}>
          <View
            style={[
              styles.sentenceStrip,
              { width: Math.min(width * 0.98, 1200) },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.button,
                { minWidth: isTablet ? 80 : 50 },
                isPlaying && styles.buttonActive,
              ]}
              onPress={playSentence}
              disabled={isPlaying}
            >
              <Image
                source={require("@/assets/images/play.png")}
                style={[styles.imageBtn, isPlaying && styles.imageBtnActive]}
              />
              <Text
                style={[
                  styles.buttonText,
                  isPlaying && styles.buttonTextActive,
                ]}
              >
                {isPlaying ? "Playing..." : "Play"}
              </Text>
            </TouchableOpacity>

            <View style={styles.sentence}>
              {sentenceCards.length === 0 ? (
                <Text style={styles.dropHint}>
                  Tap cards to build a sentence
                </Text>
              ) : (
                <FlatList
                  data={sentenceCards}
                  renderItem={({ item, index }) =>
                    renderSentenceCard(item, index)
                  }
                  keyExtractor={(item, index) => `sentence-${item.id}-${index}`}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.sentenceCardsContainer}
                />
              )}
            </View>

            <TouchableOpacity
              style={[styles.button, { minWidth: isTablet ? 80 : 50 }]}
              onPress={removeLastCard}
            >
              <Image
                source={require("@/assets/images/remove.png")}
                style={styles.imageBtn}
              />
              <Text style={styles.buttonText}>Remove</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { minWidth: isTablet ? 80 : 50 }]}
              onPress={clearSentence}
            >
              <Image
                source={require("@/assets/images/clear.png")}
                style={styles.imageBtn}
              />
              <Text style={styles.buttonText}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* DIGITAL PECS CARDS */}
        <View style={styles.secondContainer}>
          <FlatList
            data={displayedCards}
            renderItem={renderCard}
            keyExtractor={(item) => item.id}
            numColumns={cardsPerRow}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.cardsContainer]}
            removeClippedSubviews={false}
            initialNumToRender={cardsPerRow * 3}
            maxToRenderPerBatch={cardsPerRow * 2}
            windowSize={5}
          />
        </View>
      </View>

      {/* FOOTER - Only show when ready and there are categories with cards */}
      {isFooterReady && categories.length > 0 && (
        <View style={styles.footer}>
          <FlatList
            data={categories}
            renderItem={({ item, index }) => {
              const isActive = item.id === selectedCategory;
              return (
                <TouchableOpacity
                  style={[
                    styles.categoryInfos,
                    isActive && styles.categoryInfosActive,
                    index === categories.length - 1 && styles.categoryInfosLast,
                  ]}
                  onPress={() => handleCategoryPress(item.id)}
                >
                  <Image
                    source={
                      item.image
                        ? { uri: item.image }
                        : require("@/assets/images/pecs1.png")
                    }
                    style={styles.categoryImage}
                  />
                  <Text style={styles.categoryText}>{item.category_name}</Text>
                </TouchableOpacity>
              );
            }}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryContainer}
          />
        </View>
      )}
    </ThemedView>
  );
}

const { width, height } = Dimensions.get("window");
const isTablet = width > 915;

const styles = StyleSheet.create({
  breakReminderContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  breakReminderBox: {
    backgroundColor: "#fafafa",
    borderRadius: width * 0.02,
    padding: 30,
    width: "80%",
    maxWidth: 500,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  breakReminderTitle: {
    fontSize: RFValue(16),
    fontWeight: "700",
    color: "#9B72CF",
    marginBottom: 15,
    textAlign: "center",
  },
  breakReminderText: {
    fontSize: RFValue(12),
    color: "#434343",
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 22,
  },
  breakReminderButton: {
    backgroundColor: "#9B72CF",
    paddingVertical: height * 0.03,
    paddingHorizontal: width * 0.01,
    borderRadius: width * 0.01,
    marginBottom: width * 0.015,
    minWidth: 200,
    alignItems: "center",
  },
  breakReminderButtonText: {
    color: "#fafafa",
    fontSize: RFValue(12),
    fontWeight: "600",
  },
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },

  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 10,
    fontSize: RFValue(12),
    color: "#9B72CF",
    fontWeight: "500",
  },

  // Speech Error Styles
  speechErrorContainer: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    backgroundColor: "#FFEAA7",
    padding: 8,
    borderRadius: 5,
    zIndex: 1000,
  },
  speechErrorText: {
    color: "#E17055",
    fontSize: 10,
    textAlign: "center",
    fontFamily: "Poppins",
  },

  // Offline Indicator Styles
  offlineContainer: {
    position: "absolute",
    top: 12,
    left: 20,
    backgroundColor: "#9B72CF",
    borderRadius: width * 0.005,
    paddingVertical: 2,
    paddingHorizontal: 6,
    zIndex: 1000,
  },
  offlineText: {
    color: "#fafafa",
    fontSize: RFValue(7),
    fontWeight: "bold",
    fontFamily: "Poppins",
  },

  // Voice Status Styles
  voiceStatusContainer: {
    position: "absolute",
    bottom: 10,
    left: 10,
    backgroundColor: "rgba(155, 114, 207, 0.8)",
    borderRadius: width * 0.005,
    zIndex: 1000,
  },
  voiceStatusText: {
    color: "#ffffff",
    fontSize: 10,
    fontFamily: "Poppins",
  },

  // NOTIFICATION STYLES
  notificationContainer: {
    position: "absolute",
    top: hp(3),
    left: wp(2.5),
    right: wp(2.5),
    zIndex: 9999,
    alignItems: "center",
  },

  notificationBox: {
    backgroundColor: "#FF6B6B",
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.02,
    borderRadius: width * 0.01,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 8,
  },

  notificationText: {
    color: "#fafafa",
    fontSize: RFValue(8),
    fontWeight: "500",
    textAlign: "center",
    fontFamily: "Poppins",
  },

  // HEADER STYLES
  header: {
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.02,
    backgroundColor: "#E5E5E5",
    justifyContent: "center",
    alignItems: "flex-end",
    position: "relative",
  },

  headerImage: {
    width: wp(3),
    height: hp(3.5),
    resizeMode: "contain",
  },

  userInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  // DEBUG STYLES
  debugContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 4,
    borderRadius: 4,
    marginLeft: 10,
  },

  debugText: {
    fontSize: 10,
    color: "#9B72CF",
    fontWeight: "500",
    fontFamily: "Poppins",
  },

  // Tap indicator styles
  tapIndicator: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#9B72CF",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  tapIndicatorText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fafafa",
    borderRadius: width * 0.01,
    padding: width * 0.02,
    minWidth: wp(25),
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: RFValue(12),
    fontWeight: "700",
    color: "#9B72CF",
    marginBottom: height * 0.04,
    fontFamily: "Poppins",
  },
  modalButton: {
    backgroundColor: "#9B72CF",
    paddingVertical: height * 0.03,
    paddingHorizontal: width * 0.02,
    borderRadius: width * 0.01,
    marginBottom: width * 0.015,
    minWidth: 200,
    alignItems: "center",
  },
  modalButtonText: {
    color: "white",
    fontSize: RFValue(9),
    fontWeight: "600",
    fontFamily: "Poppins",
  },
  logoutButton: {
    backgroundColor: "#FF6B6B",
  },
  logoutButtonText: {
    color: "#fafafa",
  },
  cancelButton: {
    paddingVertical: height * 0.01,
    paddingHorizontal: width * 0.01,
  },
  cancelButtonText: {
    color: "#434343",
    fontSize: RFValue(9),
    fontFamily: "Poppins",
  },

  // BODY STYLES
  body: {
    flex: 1,
  },

  firstContainer: {
    paddingVertical: height * 0.02,
    justifyContent: "center",
    alignItems: "center",
  },

  sentenceStrip: {
    backgroundColor: "#9B72CF",
    height: isTablet ? height * 0.17 : height * 0.19,
    flexDirection: "row",
    gap: width * 0.01,
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: width * 0.01,
    paddingHorizontal: width * 0.01,
  },

  button: {
    backgroundColor: "#fafafa",
    paddingVertical: height * 0.01,
    paddingHorizontal: width * 0.01,
    borderRadius: width * 0.01,
    height: isTablet ? height * 0.12 : height * 0.14,
    justifyContent: "center",
    alignItems: "center",
  },

  // Active button styles for when speech is playing
  buttonActive: {
    backgroundColor: "#E8F5E8",
    borderWidth: 2,
    borderColor: "#9B72CF",
  },

  buttonText: {
    fontSize: RFValue(7),
    fontFamily: "Poppins",
    letterSpacing: 0.5,
    fontWeight: "600",
    color: "#9B72CF",
    textAlign: "center",
  },

  buttonTextActive: {
    color: "#9B72CF",
  },

  imageBtn: {
    width: wp(3),
    height: hp(3),
    resizeMode: "contain",
    marginBottom: width * 0.002,
  },

  imageBtnActive: {
    opacity: 0.7,
  },

  sentence: {
    backgroundColor: "#fafafa",
    flex: 1,
    height: isTablet ? height * 0.15 : height * 0.17,
    borderRadius: width * 0.01,
    justifyContent: "center",
    alignItems: "center",
  },

  dropHint: {
    color: "#9B72CF",
    fontSize: RFValue(8),
    textAlign: "center",
    opacity: 0.5,
  },

  sentenceCardsContainer: {
    alignItems: "center",
  },

  // CARDS IN SENTENCE STRIP
  sentenceCard: {
    borderRadius: width * 0.01,
    marginRight: wp(0.5),
    alignItems: "center",
    justifyContent: "center",
    width: width * 0.08,
    height: height * 0.16,
    overflow: "hidden",
    flexDirection: "column",
  },

  sentenceCardImageContainer: {
    width: width * 0.08,
    height: height * 0.16 * 0.7,
    backgroundColor: "#fafafa",
    overflow: "hidden",
  },

  sentenceCardImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  sentenceCardTextContainer: {
    width: width * 0.08,
    height: height * 0.16 * 0.3,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: wp(0.5),
  },

  sentenceCardText: {
    color: "#fafafa",
    fontSize: RFValue(7),
    fontWeight: "500",
    textAlign: "center",
    fontFamily: "Poppins",
  },

  secondContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // DISPLAYED CARDS
  cardsContainer: {
    justifyContent: "space-around",
    borderRadius: width * 0.01,
  },

  card: {
    borderRadius: width * 0.01,
    shadowColor: "rgba(67, 67, 67, 0.3)",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1.84,
    elevation: 2,
    margin: 5,
    overflow: "hidden",
  },

  cardContent: {
    flex: 1,
    flexDirection: "column",
  },

  imageContainer: {
    overflow: "hidden",
    backgroundColor: "#ffffff",
  },

  imageCard: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  textContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  cardText: {
    color: "#fafafa",
    textAlign: "center",
    fontFamily: "Poppins",
    fontWeight: "500",
    lineHeight: 16,
    fontSize: RFValue(10),
  },

  // FOOTER STYLES
  footer: {
    backgroundColor: "#E5E5E5",
    flex: 0,
    justifyContent: "center",
    minHeight: height * 0.1,
  },

  categoryContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(1),
    minWidth: "100%",
    justifyContent: "flex-start",
  },

  categoryInfos: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: width * 0.02,
    paddingHorizontal: width * 0.03,
    borderRightWidth: 1,
    borderColor: "#9B72CF",
    minWidth: wp(18),
  },

  categoryInfosActive: {
    backgroundColor: "#fafafa",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: height * 0.1,
    gap: width * 0.02,
    borderBottomLeftRadius: width * 0.01,
    borderBottomRightRadius: width * 0.01,
    borderRightWidth: 1,
    borderColor: "#9B72CF",
  },

  categoryInfosLast: {
    borderRightWidth: 0,
  },

  categoryImage: {
    borderRadius: width * 0.005,
    resizeMode: "cover",
    aspectRatio: 1,
    width: width * 0.025,
    height: height * 0.025,
  },

  categoryText: {
    fontSize: RFValue(9),
    fontWeight: "500",
    color: "#9B72CF",
    fontFamily: "Poppins",
    textAlign: "left",
    justifyContent: "center",
  },
});
