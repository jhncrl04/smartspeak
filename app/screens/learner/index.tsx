import { ThemedView } from "@/components/ThemedView";
import { useAuthStore } from "@/stores/userAuthStore";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import AppLoading from "expo-app-loading";
import { useFonts } from "expo-font";
import { router } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import * as Speech from "expo-speech";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, Dimensions, FlatList, Image, Modal, StyleSheet, Text, TouchableOpacity, View, } from "react-native";
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
  const [userFullName, setUserFullName] = useState<string>('');

  // Function to get user's full name from Firebase
  const fetchUserFullName = async () => {
    if (!user?.uid) return '';

    try {
      console.log("=== FETCHING USER FULL NAME ===");
      const userDoc = await firestore()
        .collection("users")
        .doc(user.uid)
        .get();

      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("User data from Firebase:", userData);
        
        // Get the full name using the same logic as ProfileScreen
        const firstName = userData?.first_name || userData?.fname || '';
        const lastName = userData?.last_name || userData?.lname || '';
        const fullName = `${firstName} ${lastName}`.trim();
        
        console.log("First name:", firstName);
        console.log("Last name:", lastName);
        console.log("Combined full name:", fullName);
        
        // If no name is available, fall back to email
        const displayName = fullName || user?.email || 'Unknown User';
        console.log("Final display name:", displayName);
        
        setUserFullName(displayName);
        return displayName;
      } else {
        console.log("User document does not exist");
        const fallbackName = user?.email || 'Unknown User';
        setUserFullName(fallbackName);
        return fallbackName;
      }
    } catch (error) {
      console.error('Error fetching user full name:', error);
      const fallbackName = user?.email || 'Unknown User';
      setUserFullName(fallbackName);
      return fallbackName;
    }
  };

  // LOGGING FUNCTIONS - Updated to get fresh name if userFullName is empty
  const logCardTap = async (card: CardType, action: 'add' | 'remove', sentencePosition?: number) => {
    try {
      // Get fresh user name if not already loaded
      let currentUserName = userFullName;
      if (!currentUserName || currentUserName === user?.email) {
        console.log("User full name not loaded, fetching now...");
        currentUserName = await fetchUserFullName();
      }
      
      console.log("Logging card tap with user name:", currentUserName);

      const logData = {
        user_id: user?.uid || 'unknown',
        user_name: currentUserName || user?.email || 'unknown',
        action: action === 'add' ? 'card added to sentence' : 'card removed from sentence',
        item_category: card.categoryId,
        item_id: card.id,
        item_name: card.text,
        sentence_position: sentencePosition,
        timestamp: firestore.FieldValue.serverTimestamp(),
        user_type: 'learner',
      };

      await firestore().collection('pecsLogs').add(logData);
      console.log(`Card ${action} logged to pecsLogs:`, card.text, sentencePosition ? `at position ${sentencePosition}` : '');
    } catch (error) {
      console.error('Error logging card tap:', error);
    }
  };

  const logPlaySentence = async (sentenceCards: SentenceCardType[]) => {
    try {
      // Get fresh user name if not already loaded
      let currentUserName = userFullName;
      if (!currentUserName || currentUserName === user?.email) {
        console.log("User full name not loaded, fetching now...");
        currentUserName = await fetchUserFullName();
      }
      
      console.log("Logging sentence play with user name:", currentUserName);

      const sentence = sentenceCards.map(card => card.text).join(' ');
      const cardDetails = sentenceCards.map((card, index) => ({
        card_id: card.id,
        card_name: card.text,
        category: card.categoryId,
        position: index + 1
      }));

      const logData = {
        user_id: user?.uid || 'unknown',
        user_name: currentUserName || user?.email || 'unknown',
        action: 'sentence played',
        sentence_text: sentence,
        card_count: sentenceCards.length,
        cards_in_sentence: cardDetails,
        timestamp: firestore.FieldValue.serverTimestamp(),
        user_type: 'learner',
      };

      await firestore().collection('pecsLogs').add(logData);
      console.log('Sentence play logged to pecsLogs:', sentence);
    } catch (error) {
      console.error('Error logging sentence play:', error);
    }
  };

  // Function to handle logout
  const handleLogout = async () => {
    setShowSettingsModal(false);

    try {
      // Sign out from Firebase Auth
      await auth().signOut();

      // Clear user data from Zustand store (use the logout function already declared at component level)
      logout(); // ✅ Use the logout function that's already available

      // Navigate back to login screen
      router.replace("/"); // Use replace instead of push to prevent going back

      console.log("User logged out successfully");
    } catch (error) {
      console.error("Error during logout:", error);
      // Show error to user if needed
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

  const { width, height } = Dimensions.get("window");
  const isTablet = width > 968;
  const cardsPerRow = isTablet ? 8 : width > 600 ? 6 : 4;
  const cardWidth = (width * 1 - 25 * (cardsPerRow + 1)) / cardsPerRow;
  const cardHeight = cardWidth * 0.9;

  type CardType = {
    id: string;
    image: string;
    text: string;
    categoryId: string;
  };

  // UPDATED: Add background_color to sentence card type
  type SentenceCardType = CardType & {
    categoryColor: string; // Store the category color with the card
  };

  // UPDATED: Add background_color to CategoryType
  type CategoryType = {
    id: string;
    category_name: string;
    image: string;
    active: boolean;
    background_color?: string; // Add this field
  };

  // UPDATED: Change sentenceCards type to SentenceCardType
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
  const notificationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Animation for card tap feedback
  const cardTapScale = useRef(new Animated.Value(1)).current;

  // Function to show notification
  const showNotificationMessage = () => {
    // Clear any existing timeout
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }

    setShowNotification(true);

    // Fade in animation
    Animated.timing(notificationOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();

    // Auto hide after 2 seconds
    notificationTimeoutRef.current = setTimeout(() => {
      // Fade out animation
      Animated.timing(notificationOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        setShowNotification(false);
      });
    }, 2000);
  };

  // Function to handle profile image taps
  const handleProfileTap = () => {
    setTapCount((prev) => {
      const newCount = prev + 1;

      // Clear existing timeout
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
      }

      // If reached 5 taps, show modal
      if (newCount >= 5) {
        setShowSettingsModal(true);
        return 0; // Reset counter
      }

      // Reset counter after 2 seconds of no taps
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
    return () => {
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
      }
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, []);

  // Function to play card name when added to sentence strip
  const playCardName = async (cardText: string) => {
    if (isPlayingCardName) {
      // If already playing a card name, stop the current one first
      await Speech.stop();
    }

    setIsPlayingCardName(true);

    try {
      // Configure speech options for card name
      const speechOptions = {
        language: "fil-PH",
        pitch: 1.1, // Slightly higher pitch for card names
        rate: 0.9, // Normal speed for single words
        voice: undefined,
      };

      // Speak the card name
      await Speech.speak(cardText, {
        ...speechOptions,
        onStart: () => {
          console.log("Card name speech started:", cardText);
        },
        onDone: () => {
          console.log("Card name speech finished:", cardText);
          setIsPlayingCardName(false);
        },
        onStopped: () => {
          console.log("Card name speech stopped:", cardText);
          setIsPlayingCardName(false);
        },
        onError: (error) => {
          console.error("Card name speech error:", error);
          setIsPlayingCardName(false);
        },
      });
    } catch (error) {
      console.error("Error playing card name:", error);
      setIsPlayingCardName(false);
    }
  };

  // UPDATED: Function to handle card tap - now includes category color AND logging
  const handleCardTap = async (card: CardType) => {
    // Check if sentence strip is full (max 8 cards)
    if (sentenceCards.length >= 8) {
      console.log("Sentence strip is full");
      return;
    }

    // Add visual feedback animation
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

    // Get the current category color
    const currentCategoryColor = getCurrentCategoryBackgroundColor();

    // Create sentence card with category color
    const sentenceCard: SentenceCardType = {
      ...card,
      categoryColor: currentCategoryColor,
    };

    // Add card to sentence strip with its category color
    setSentenceCards((prev) => [...prev, sentenceCard]);

    // LOG: Card added to sentence strip
    await logCardTap(card, 'add', sentenceCards.length + 1);

    // Play the card name when added to sentence strip
    await playCardName(card.text);

    console.log("Card added to sentence with color:", card.text, currentCategoryColor);
  };

  // NEW: Helper function to get current category background color
  const getCurrentCategoryBackgroundColor = () => {
    const currentCategory = categories.find(cat => cat.id === selectedCategory);
    return currentCategory?.background_color || "#5FA056"; // Default fallback color
  };

// UPDATED: Fetch data from Firebase with user-based filtering using React Native Firebase SDK
useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);

      // Get current user ID from auth store
      const currentUserId = user?.uid;

      if (!currentUserId) {
        console.error("No current user ID found");
        setLoading(false);
        return;
      }

      console.log("=== FETCHING DATA FOR USER ===");
      console.log("Current user ID:", currentUserId);

      // Fetch user's full name first
      await fetchUserFullName();

      // UPDATED: Fetch categories with background_color field
      const categoriesSnapshot = await firestore()
        .collection("pecsCategories")
        .get();
      
      const allCategoriesData: CategoryType[] = [];

      categoriesSnapshot.docs.forEach((categoryDoc) => {
        const categoryData = categoryDoc.data();

        console.log(`\n--- Category ${categoryDoc.id} ---`);
        console.log("Category name:", categoryData.category_name);
        console.log("Background color:", categoryData.background_color);
        console.log("Created by:", categoryData.created_by);
        console.log("Assigned to:", categoryData.assigned_to);

        // Fixed logic for array-based assigned_to field:
        // 1. Show if created by current user (admin/teacher view)
        // 2. Show if assigned_to array contains current user ID
        // 3. Show if no assigned_to field (public categories)
        const shouldShowCategory = 
          categoryData.created_by === currentUserId || // created by user
          (categoryData.assigned_to && Array.isArray(categoryData.assigned_to) && categoryData.assigned_to.includes(currentUserId)) || // assigned to user (array contains)
          !categoryData.assigned_to; // no assignment (public)

        console.log("Should show category:", shouldShowCategory);

        if (shouldShowCategory) {
          allCategoriesData.push({
            id: categoryDoc.id,
            category_name: categoryData.category_name || "Unknown Category",
            image: categoryData.image || "",
            active: false,
            background_color: categoryData.background_color || "#5FA056", // Include background_color with fallback
          });
        }
      });

      console.log("Filtered categories:", allCategoriesData.map(c => `${c.category_name} (${c.background_color})`));

      // Fetch cards with the same filtering pattern using React Native Firebase SDK
      const cardsSnapshot = await firestore()
        .collection("cards")
        .get();
      
      const cardsData: CardType[] = [];

      console.log("\n=== FETCHING CARDS ===");
      console.log("Total cards in database:", cardsSnapshot.docs.length);
      
      cardsSnapshot.docs.forEach((cardDoc) => {
        const cardData = cardDoc.data();
        
        console.log(`\n--- Card ${cardDoc.id} ---`);
        console.log("Card name:", cardData.card_name);
        console.log("Created by:", cardData.created_by);
        console.log("Assigned to:", cardData.assigned_to);
        console.log("Category:", cardData.category_name || cardData.category_id);
        
        // Fixed logic for array-based assigned_to field:
        // 1. Show if created by current user
        // 2. Show if assigned_to array contains current user ID  
        // 3. Show if no assigned_to field (public cards)
        const shouldShowCard = 
          cardData.created_by === currentUserId || // created by user
          (cardData.assigned_to && Array.isArray(cardData.assigned_to) && cardData.assigned_to.includes(currentUserId)) || // assigned to user (array contains)
          !cardData.assigned_to; // no assignment (public)

        console.log("Should show card:", shouldShowCard);

        if (shouldShowCard) {
          cardsData.push({
            id: cardDoc.id,
            image: cardData.image || "",
            text: cardData.card_name || cardData.text || "No text",
            categoryId: cardData.category_name || cardData.category_id || "",
          });
        }
      });

      console.log("Filtered cards:", cardsData.length);

      // UPDATED: Filter categories to only show those that have cards
      const categoriesWithCards = allCategoriesData.filter((category) => {
        // Check if this category has any cards
        const categoryCards = cardsData.filter((card) => {
          const categoryName = category.category_name;
          const cardCategoryId = card.categoryId;
          
          const exactMatch = cardCategoryId === categoryName;
          const caseInsensitiveMatch = cardCategoryId.toLowerCase() === categoryName.toLowerCase();
          const trimmedMatch = cardCategoryId.trim().toLowerCase() === categoryName.trim().toLowerCase();
          
          return exactMatch || caseInsensitiveMatch || trimmedMatch;
        });

        const hasCards = categoryCards.length > 0;
        console.log(`Category "${category.category_name}" (${category.background_color}) has ${categoryCards.length} cards - ${hasCards ? 'SHOWING' : 'HIDING'}`);
        
        return hasCards;
      });

      console.log("Categories with cards:", categoriesWithCards.map(c => `${c.category_name} (${c.background_color})`));

      // Set first category as active and load its cards
      if (categoriesWithCards.length > 0) {
        categoriesWithCards[0].active = true;
        setSelectedCategory(categoriesWithCards[0].id);

        // Filter cards for the first category
        const firstCategoryName = categoriesWithCards[0].category_name;
        const firstCategoryCards = cardsData.filter((card) => {
          const categoryName = firstCategoryName;
          const cardCategoryId = card.categoryId;
          
          const exactMatch = cardCategoryId === categoryName;
          const caseInsensitiveMatch = cardCategoryId.toLowerCase() === categoryName.toLowerCase();
          const trimmedMatch = cardCategoryId.trim().toLowerCase() === categoryName.trim().toLowerCase();
          
          return exactMatch || caseInsensitiveMatch || trimmedMatch;
        });

        console.log(`First category "${firstCategoryName}" cards:`, firstCategoryCards.length);
        setDisplayedCards(firstCategoryCards);
      } else {
        console.log("No categories with cards found");
        setDisplayedCards([]);
      }

      setCategories(categoriesWithCards);
      setAllCards(cardsData);

      console.log("=== DATA FETCH COMPLETE ===");
    } catch (error) {
      console.error("Error fetching data from Firebase:", error);
      alert("Error loading data from Firebase: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  // Only fetch data if user exists
  if (user?.uid) {
    fetchData();
  } else {
    console.log("No user found, not fetching data");
    setLoading(false);
  }
}, [user]);

  // Also update the handleCategoryPress function to use the same matching logic:
  const handleCategoryPress = (categoryId: string) => {
    console.log("Category pressed:", categoryId);

    setSelectedCategory(categoryId);

    // Update categories active state
    const updatedCategories = categories.map((cat) => ({
      ...cat,
      active: cat.id === categoryId,
    }));
    setCategories(updatedCategories);

    // Find the selected category
    const selectedCategory = categories.find((cat) => cat.id === categoryId);
    if (!selectedCategory) {
      console.log("Category not found:", categoryId);
      setDisplayedCards([]);
      return;
    }

    console.log("Selected category name:", selectedCategory.category_name);
    console.log("Selected category background color:", selectedCategory.background_color);

    // Filter cards using consistent matching logic
    const filteredCards = allCards.filter((card) => {
      const categoryName = selectedCategory.category_name;
      const cardCategoryId = card.categoryId;
      
      const exactMatch = cardCategoryId === categoryName;
      const caseInsensitiveMatch = cardCategoryId.toLowerCase() === categoryName.toLowerCase();
      const trimmedMatch = cardCategoryId.trim().toLowerCase() === categoryName.trim().toLowerCase();
      
      const matches = exactMatch || caseInsensitiveMatch || trimmedMatch;
      
      console.log(`Card "${card.text}": categoryId="${cardCategoryId}", categoryName="${categoryName}", matches=${matches}`);
      
      return matches;
    });

    console.log(`Found ${filteredCards.length} cards for category "${selectedCategory.category_name}"`);
    setDisplayedCards(filteredCards);
  };

  const clearSentence = () => {
    setSentenceCards([]);
  };

  const removeLastCard = () => {
    setSentenceCards((prev) => prev.slice(0, -1));
  };

  // UPDATED: Play sentence function with logging
  const playSentence = async () => {
    if (sentenceCards.length > 0 && !isPlaying) {
      setIsPlaying(true);

      // LOG: Sentence play action
      await logPlaySentence(sentenceCards);

      try {
        // Stop any ongoing speech (including card names)
        await Speech.stop();
        setIsPlayingCardName(false);

        // Create the sentence from card texts
        const sentence = sentenceCards.map((card) => card.text).join(" ");
        console.log("Playing sentence:", sentence);

        // Configure speech options
        const speechOptions = {
          language: "fil-PH", // You can change this to other languages like 'es-ES', 'fr-FR', etc.
          pitch: 1.1, // Range: 0.5 - 2.0
          rate: 0.9, // Range: 0.1 - 2.0 (0.8 is slightly slower for better clarity)
          voice: undefined, // Let the system choose the default voice
        };

        // Speak the sentence
        await Speech.speak(sentence, {
          ...speechOptions,
          onStart: () => {
            console.log("Speech started");
          },
          onDone: () => {
            console.log("Speech finished");
            setIsPlaying(false);
          },
          onStopped: () => {
            console.log("Speech stopped");
            setIsPlaying(false);
          },
          onError: (error) => {
            console.error("Speech error:", error);
            setIsPlaying(false);
          },
        });
      } catch (error) {
        console.error("Error playing sentence:", error);
        setIsPlaying(false);
        alert("Error playing audio. Please try again.");
      }
    } else if (sentenceCards.length === 0) {
      // Show notification instead of alert
      showNotificationMessage();
    }
  };

  // Stop speech function (useful for cleanup)
  const stopSpeech = async () => {
    try {
      await Speech.stop();
      setIsPlaying(false);
      setIsPlayingCardName(false);
    } catch (error) {
      console.error("Error stopping speech:", error);
    }
  };

  // Cleanup speech when component unmounts
  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  // UPDATED: Simplified card render function - now uses dynamic background color
  const renderCard = ({
    item,
    index,
  }: {
    item: CardType;
    index: number;
  }): JSX.Element => {
    // Get the background color from the current category
    const cardBackgroundColor = getCurrentCategoryBackgroundColor();
    
    return (
      <TouchableOpacity
        style={[
          styles.card,
          {
            width: cardWidth,
            height: cardHeight,
            backgroundColor: cardBackgroundColor, // Apply dynamic background color
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
                height: cardHeight * 0.7, // 70% of card height for image
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
                height: cardHeight * 0.3, // 30% of card height for text
              },
            ]}
          >
            <Text
              style={[styles.cardText]}
              numberOfLines={2} // Allow maximum 2 lines
              adjustsFontSizeToFit={true} // Auto adjust font size to fit
              minimumFontScale={0.6} // Minimum scale for font size
              textBreakStrategy="balanced" // Better text wrapping
            >
              {item.text}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // UPDATED: Sentence card now uses individual card's stored category color AND includes logging for removal
  const renderSentenceCard = (card: SentenceCardType, index: number): JSX.Element => {
    return (
      <TouchableOpacity
        key={`sentence-${card.id}-${index}`}
        style={[
          styles.sentenceCard,
          { backgroundColor: card.categoryColor } // Use the stored category color for each card
        ]}
        onPress={async () => {
          // // LOG: Card removed from sentence strip
          // await logCardTap(card, 'remove', index + 1);
          
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

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  // Fixed getItemLayout function
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
      {/* NOTIFICATION BOX */}
      {showNotification && (
        <Animated.View
          style={[
            styles.notificationContainer,
            {
              opacity: notificationOpacity,
            }
          ]}
        >
          <View style={styles.notificationBox}>
            <Text style={styles.notificationText}>
              Please add cards to create a sentence first
            </Text>
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
            {/* Optional tap indicator */}
            {tapCount > 0 && tapCount < 5 && (
              <View style={styles.tapIndicator}>
                <Text style={styles.tapIndicatorText}>{tapCount}/5</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* DEBUG: Show current user ID */}
          {/* <View style={styles.debugContainer}>
            <Text style={styles.debugText}>
              User ID: {user?.uid || 'No user ID'}
            </Text>
          </View> */}
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
              { width: Math.min(width * 0.95, 1200) },
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
            // getItemLayout={getItemLayout}
            removeClippedSubviews={false}
            initialNumToRender={cardsPerRow * 3}
            maxToRenderPerBatch={cardsPerRow * 2}
            windowSize={5}
          />
        </View>
      </View>

      {/* FOOTER - Only show if there are categories with cards */}
      {categories.length > 0 && (
        <View style={styles.footer}>
          <FlatList
            data={categories}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={[
                  styles.categoryInfos,
                  item.active && styles.categoryInfosActive,
                  index === categories.length - 1 && styles.categoryInfosLast, // Remove border on last item
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
                <Text
                  style={styles.categoryText}
                >
                  {item.category_name}
                </Text>
              </TouchableOpacity>
            )}
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
    fontSize: 16,
    color: "#9B72CF",
    fontWeight: "500",
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
    paddingVertical: hp(1),
    paddingHorizontal: wp(4),
    borderRadius: wp(2),
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
    fontSize: wp(2.2),
    fontWeight: "500",
    textAlign: "center",
    fontFamily: "Poppins",
  },

  // HEADER STYLES
  header: {
    paddingHorizontal: wp(8),
    paddingVertical: hp(0.5),
    backgroundColor: "#E5E5E5",
    height: hp(4),
    justifyContent: "center",
    alignItems: "flex-end",
    position: "relative",
  },

  userInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(2),
  },

  userName: {
    fontSize: wp(2.5),
    fontWeight: "500",
    color: "#9B72CF",
    fontFamily: "Poppins",
  },

  headerImage: {
    width: wp(3),
    height: hp(3.5),
    resizeMode: "contain",
  },

  // DEBUG STYLES
  debugContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 4,
    borderRadius: 4,
    marginLeft: 10,
  },

  debugText: {
    fontSize: 10,
    color: '#9B72CF',
    fontWeight: '500',
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
    borderRadius: wp(2),
    padding: wp(3),
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
    fontSize: wp(3),
    fontWeight: "700",
    color: "#9B72CF",
    marginBottom: hp(2),
    fontFamily: "Poppins",
  },
  modalButton: {
    backgroundColor: "#9B72CF",
    paddingVertical: hp(1),
    paddingHorizontal: wp(2),
    borderRadius: wp(2),
    marginBottom: 15,
    minWidth: 200,
    alignItems: "center",
  },
  modalButtonText: {
    color: "white",
    fontSize: wp(2.2),
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
    paddingVertical: wp(1),
    paddingHorizontal: wp(1),
  },
  cancelButtonText: {
    color: "#434343",
    fontSize: wp(2.2),
    fontFamily: "Poppins",
  },

  // BODY STYLES
  body: {
    flex: 1,
  },

  firstContainer: {
    height: isTablet ? hp(7) : hp(11), // Increased for mobile
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: wp(2.5),
  },

  sentenceStrip: {
    backgroundColor: "#9B72CF",
    height: isTablet ? hp(5) : hp(9), // Increased for mobile
    flexDirection: "row",
    gap: wp(1),
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: wp(2),
    paddingHorizontal: wp(2),
  },

  button: {
    backgroundColor: "#fafafa",
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(1),
    borderRadius: wp(2),
    height: isTablet ? hp(4) : hp(6), // Increased for mobile
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
    fontSize: wp(2),
    fontFamily: "Poppins",
    letterSpacing: 0.5,
    fontWeight: "bold",
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
    marginBottom: wp(0.2),
  },

  imageBtnActive: {
    opacity: 0.7,
  },

  sentence: {
    backgroundColor: "#fafafa",
    flex: 1,
    height: isTablet ? hp(4) : hp(8),
    borderRadius: wp(2),
    justifyContent: "center",
    alignItems: "center",
  },

  dropHint: {
    color: "#9B72CF",
    fontSize: wp(2.6),
    textAlign: "center",
    opacity: 0.5,
  },

  sentenceCardsContainer: {
    alignItems: "center",
    paddingHorizontal: wp(1),
  },

  // CARDS IN SENTENCE STRIP - Each card now uses its own stored category color
  sentenceCard: {
    // backgroundColor is now set dynamically using card.categoryColor
    borderRadius: wp(2),
    marginRight: wp(0.5),
    alignItems: "center",
    justifyContent: "center",
    width: wp(16),
    height: isTablet ? hp(3) : hp(7),
    overflow: "hidden",
    flexDirection: "column",
  },

  sentenceCardImageContainer: {
    width: wp(16),
    height: (isTablet ? hp(3) : hp(7)) * 0.8,
    backgroundColor: "#9B72CF",
    overflow: "hidden",
  },

  sentenceCardImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",

  },

  sentenceCardTextContainer: {
    width: wp(16),
    height: (isTablet ? hp(10) : hp(13)) * 0.2, // 30% of updated sentence card height
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: wp(0.5),
    paddingVertical: wp(0.2),
  },

  sentenceCardText: {
    color: "#fafafa",
    fontSize: wp(1.4),
    fontWeight: "500",
    textAlign: "center",
    fontFamily: "Poppins",
  },

  secondContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: hp(1),
  },

  // DISPLAYED CARDS - Uses current category color
  cardsContainer: {
    justifyContent: "space-around",
    borderRadius: wp(1.5),
  },

  card: {
    // backgroundColor is now set dynamically using current category color
    borderRadius: wp(2),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
    fontSize: wp(2.2),
  },

  // FOOTER STYLES
  footer: {
    backgroundColor: "#E5E5E5",
    height: hp(4),
    justifyContent: "center",
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
    gap: wp(1.5),
    paddingHorizontal: wp(6),
    borderRightWidth: 1,
    borderColor: "#9B72CF",
    minWidth: wp(18),
    height: hp(3),
  },

  categoryInfosActive: {
    backgroundColor: "#fafafa",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: hp(4),
    gap: wp(1.5),
    borderBottomLeftRadius: wp(2),
    borderBottomRightRadius: wp(2),
    paddingHorizontal: wp(6),
    paddingVertical: hp(1),
    borderRightWidth: 1,
    borderColor: "#9B72CF",
  },

  categoryInfosLast: {
    borderRightWidth: 0,
  },

  categoryImage: {
    borderRadius: wp(0.5),
    resizeMode: "contain",
    aspectRatio: 1,
    width: wp(4),
    height: hp(4),
  },

  categoryText: {
    fontSize: wp(2.2),
    fontWeight: "500",
    color: "#9B72CF",
    fontFamily: "Poppins",
    textAlign: "left",
    justifyContent: 'center',
    marginTop: 0,
  },
});