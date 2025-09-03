import { ThemedView } from "@/components/ThemedView";
import "@/firebaseConfig";
import AppLoading from "expo-app-loading";
import { useFonts } from "expo-font";
import { router } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import * as Speech from "expo-speech";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
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
import { PanGestureHandler } from "react-native-gesture-handler";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
const db = getFirestore();

export default function HomeScreen() {
  let [fontsLoaded] = useFonts({
    Poppins: require("../../assets/fonts/Poppins-Regular.ttf"),
  });
  if (!fontsLoaded) {
    return <AppLoading />;
  }

  useEffect(() => {
    const lockOrientation = async () => {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE
      );
    };
    lockOrientation();
  }, []);
  if (!fontsLoaded) {
    return null;
  }

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

  type CategoryType = {
    id: string;
    categoryName: string;
    image: string;
    active: boolean;
  };

  const [sentenceCards, setSentenceCards] = useState<CardType[]>([]);
  const [draggedCard, setDraggedCard] = useState<string | null>(null);
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
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const dragPosition = useRef(new Animated.ValueXY()).current;

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
    router.push("/profile");
  };

  // Function to handle logout
  const handleLogout = () => {
    setShowSettingsModal(false);
    // Add your logout logic here
    alert("Logout functionality would be implemented here");
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
      }
    };
  }, []);

  const handleUserPress = () => {
    alert("User profile pressed!");
  };

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
        language: "en-US",
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

  // Fetch data from Firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch categories first
        const categoriesSnapshot = await getDocs(
          collection(db, "pecsCategories")
        );
        const categoriesData: CategoryType[] = [];

        categoriesSnapshot.docs.forEach((categoryDoc) => {
          const categoryData = categoryDoc.data();
          categoriesData.push({
            id: categoryDoc.id,
            categoryName: categoryData.categoryName || "Unknown Category",
            image: categoryData.image || "",
            active: false,
          });
        });

        // Fetch all cards from the cards collection
        const cardsSnapshot = await getDocs(collection(db, "cards"));
        const cardsData: CardType[] = [];

        cardsSnapshot.docs.forEach((cardDoc) => {
          const cardData = cardDoc.data();

          // Debug: log each card's data
          console.log("Card data:", cardData);

          cardsData.push({
            id: cardDoc.id,
            image: cardData.image || "",
            text: cardData.cardName || cardData.text || "No text",
            categoryId: cardData.categoryName || "", // This should match the category name exactly
          });
        });

        console.log("All categories loaded:", categoriesData);
        console.log("All cards loaded:", cardsData);

        // Check what category names exist in cards
        const uniqueCardCategories = [
          ...new Set(cardsData.map((card) => card.categoryId)),
        ];
        console.log("Unique card categories:", uniqueCardCategories);

        // Set first category as active by default
        if (categoriesData.length > 0) {
          categoriesData[0].active = true;
          setSelectedCategory(categoriesData[0].id);

          // Filter cards for the first category
          const firstCategoryName = categoriesData[0].categoryName;
          const firstCategoryCards = cardsData.filter((card) => {
            const matches = card.categoryId === firstCategoryName;
            console.log(
              `Card "${card.text}" category "${card.categoryId}" matches "${firstCategoryName}":`,
              matches
            );
            return matches;
          });

          console.log("First category cards:", firstCategoryCards);
          setDisplayedCards(firstCategoryCards);
        }

        setCategories(categoriesData);
        setAllCards(cardsData);
      } catch (error) {
        console.error("Error fetching data from Firebase:", error);
        alert("Error loading data from Firebase: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter cards when category changes
  const handleCategoryPress = (categoryId: string) => {
    console.log("Category pressed:", categoryId);

    setSelectedCategory(categoryId);

    // Update categories active state
    const updatedCategories = categories.map((cat) => ({
      ...cat,
      active: cat.id === categoryId,
    }));
    setCategories(updatedCategories);

    // Find the selected category to get its name
    const selectedCategory = categories.find((cat) => cat.id === categoryId);
    if (!selectedCategory) {
      console.log("Category not found:", categoryId);
      setDisplayedCards([]);
      return;
    }

    console.log("Selected category name:", selectedCategory.categoryName);

    // Filter cards that match this category name
    const filteredCards = allCards.filter((card) => {
      const matches = card.categoryId === selectedCategory.categoryName;
      console.log(
        `Card "${card.text}" (category: "${card.categoryId}") matches "${selectedCategory.categoryName}":`,
        matches
      );
      return matches;
    });

    console.log(
      "Filtered cards for category:",
      selectedCategory.categoryName,
      filteredCards
    );
    setDisplayedCards(filteredCards);

    // If no cards found, let's also try a case-insensitive match
    if (filteredCards.length === 0) {
      console.log("No exact matches, trying case-insensitive...");
      const caseInsensitiveFiltered = allCards.filter(
        (card) =>
          card.categoryId.toLowerCase() ===
          selectedCategory.categoryName.toLowerCase()
      );
      console.log("Case-insensitive matches:", caseInsensitiveFiltered);
      setDisplayedCards(caseInsensitiveFiltered);
    }
  };

  const onGestureEvent = Animated.event(
    [
      {
        nativeEvent: {
          translationX: dragPosition.x,
          translationY: dragPosition.y,
        },
      },
    ],
    { useNativeDriver: false }
  );

  interface PanGestureHandlerStateChangeEvent {
    nativeEvent: {
      state: number;
      translationX: number;
      translationY: number;
      absoluteX: number;
      absoluteY: number;
    };
  }

  const onHandlerStateChange = async (
    event: PanGestureHandlerStateChangeEvent,
    card: CardType
  ): Promise<void> => {
    if (event.nativeEvent.state === 5) {
      const { translationX, translationY, absoluteX, absoluteY } =
        event.nativeEvent;

      // Get sentence strip bounds more accurately
      const sentenceStripTop = hp(6);
      const sentenceStripBottom = hp(6) + (isTablet ? hp(18) : hp(22));
      const sentenceStripLeft = wp(2.5);
      const sentenceStripRight = width - wp(2.5);

      // Check if dropped within sentence strip area
      const isInSentenceStrip =
        absoluteY >= sentenceStripTop &&
        absoluteY <= sentenceStripBottom &&
        absoluteX >= sentenceStripLeft &&
        absoluteX <= sentenceStripRight;

      if (isInSentenceStrip && sentenceCards.length < 8) {
        setSentenceCards((prev) => [...prev, card]);

        // Play the card name when added to sentence strip
        await playCardName(card.text);

        // Visual feedback - could add a success animation here
        console.log("Card added to sentence:", card.text);
      } else if (sentenceCards.length >= 8) {
        // Could show feedback that sentence strip is full
        console.log("Sentence strip is full");
      }

      // Reset position with smooth animation
      Animated.spring(dragPosition, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: false,
        tension: 100,
        friction: 8,
      }).start();

      setDraggedCard(null);
    } else if (event.nativeEvent.state === 2) {
      // BEGAN state
      setDraggedCard(card.id);

      // Prepare drag by extracting any offset so translation uses fresh values
      // This avoids accessing internal _value fields on Animated.ValueXY
      dragPosition.extractOffset();
    }
  };

  const clearSentence = () => {
    setSentenceCards([]);
  };

  const removeLastCard = () => {
    setSentenceCards((prev) => prev.slice(0, -1));
  };

  // Updated playSentence function with AI speech
  const playSentence = async () => {
    if (sentenceCards.length > 0 && !isPlaying) {
      setIsPlaying(true);

      try {
        // Stop any ongoing speech (including card names)
        await Speech.stop();
        setIsPlayingCardName(false);

        // Create the sentence from card texts
        const sentence = sentenceCards.map((card) => card.text).join(" ");
        console.log("Playing sentence:", sentence);

        // Configure speech options
        const speechOptions = {
          language: "en-US", // You can change this to other languages like 'es-ES', 'fr-FR', etc.
          pitch: 1.0, // Range: 0.5 - 2.0
          rate: 0.8, // Range: 0.1 - 2.0 (0.8 is slightly slower for better clarity)
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
      alert("Please add cards to create a sentence first.");
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

  const renderCard = ({
    item,
    index,
  }: {
    item: CardType;
    index: number;
  }): JSX.Element => {
    const isDragged = draggedCard === item.id;

    return (
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={(event) => onHandlerStateChange(event, item)}
        minDist={2} // Minimum distance before drag starts
      >
        <Animated.View
          style={[
            styles.card,
            {
              width: cardWidth,
              height: cardHeight,
              transform: isDragged
                ? [
                    ...dragPosition.getTranslateTransform(),
                    { scale: isDragged ? 1.05 : 1 }, // Slight scale when dragging
                  ]
                : [],
              zIndex: isDragged ? 1000 : 1,
              elevation: isDragged ? 15 : 5,
              opacity: isDragged ? 0.9 : 1, // Slight transparency when dragging
            },
          ]}
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
                style={[
                  styles.cardText,
                  {
                    fontSize: Math.min(cardWidth * 0.1, 16), // Responsive font size
                  },
                ]}
                numberOfLines={2} // Allow maximum 2 lines
                adjustsFontSizeToFit={true} // Auto adjust font size to fit
                minimumFontScale={0.6} // Minimum scale for font size
                textBreakStrategy="balanced" // Better text wrapping
              >
                {item.text}
              </Text>
            </View>
          </View>
        </Animated.View>
      </PanGestureHandler>
    );
  };

  interface SentenceCardProps {
    card: CardType;
    index: number;
  }

  const renderSentenceCard = (card: CardType, index: number): JSX.Element => (
    <TouchableOpacity
      key={`sentence-${card.id}-${index}`}
      style={styles.sentenceCard}
      onPress={() => {
        setSentenceCards((prev: CardType[]) =>
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

  // Fixed getItemLayout function
  const getItemLayout = (
    data: CardType[] | null | undefined,
    index: number
  ) => ({
    length: cardHeight + 10, // Use cardHeight instead of cardWidth for grid layout
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
      {/* HEADER */}
      <View style={styles.header}>
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
                  Drag cards here to build a sentence
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
            getItemLayout={getItemLayout}
            removeClippedSubviews={false}
            initialNumToRender={cardsPerRow * 3}
            maxToRenderPerBatch={cardsPerRow * 2}
            windowSize={5}
          />
        </View>
      </View>

      {/* FOOTER */}
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
                numberOfLines={2}
                adjustsFontSizeToFit
              >
                {item.categoryName}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryContainer}
        />
      </View>
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

  // HEADER STYLES
  header: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(0.5),
    backgroundColor: "#E5E5E5",
    height: hp(6),
    justifyContent: "center",
    alignItems: "flex-end",
    position: "relative",
  },
  headerImage: {
    width: wp(3),
    height: hp(3.5),
    resizeMode: "contain",
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
    backgroundColor: "white",
    borderRadius: wp(1),
    padding: wp(2),
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
    fontSize: wp(1.8),
    fontWeight: "700",
    color: "#9B72CF",
    marginBottom: hp(3),
    fontFamily: "Poppins",
  },
  modalButton: {
    backgroundColor: "#9B72CF",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: wp(1),
    marginBottom: 15,
    minWidth: 200,
    alignItems: "center",
  },
  modalButtonText: {
    color: "white",
    fontSize: wp(1.2),
    fontWeight: "500",
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
    fontSize: wp(1.2),
    fontFamily: "Poppins",
  },

  // BODY STYLES
  body: {
    flex: 1,
  },

  firstContainer: {
    height: isTablet ? hp(18) : hp(22), // Increased for mobile
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: wp(2.5),
  },

  sentenceStrip: {
    backgroundColor: "#9B72CF",
    height: isTablet ? hp(14) : hp(18), // Increased for mobile
    flexDirection: "row",
    gap: wp(1),
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: wp(1),
    paddingHorizontal: wp(2),
  },

  button: {
    backgroundColor: "#fafafa",
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(1),
    borderRadius: wp(1),
    height: isTablet ? hp(9) : hp(11), // Increased for mobile
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
    fontSize: wp(1),
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
    height: isTablet ? hp(12) : hp(16), // Increased for mobile
    borderRadius: wp(1),
    justifyContent: "center",
    alignItems: "center",
  },

  dropHint: {
    color: "#9B72CF",
    fontSize: wp(1.5),
    textAlign: "center",
    opacity: 0.7,
  },

  sentenceCardsContainer: {
    alignItems: "center",
    paddingHorizontal: wp(1),
  },

  // CARDS IN SENTENCE STRIP
  sentenceCard: {
    backgroundColor: "#5FA056",
    borderRadius: wp(1),
    marginRight: wp(0.5),
    alignItems: "center",
    justifyContent: "center",
    width: wp(7.5),
    height: isTablet ? hp(11) : hp(14), // Increased for mobile
    overflow: "hidden",
    flexDirection: "column",
  },

  sentenceCardImageContainer: {
    width: wp(7.5),
    height: (isTablet ? hp(11) : hp(14)) * 0.7, // 70% of updated sentence card height
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },

  sentenceCardImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  sentenceCardTextContainer: {
    width: wp(7.5),
    height: (isTablet ? hp(11) : hp(14)) * 0.3, // 30% of updated sentence card height
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: wp(0.5),
    paddingVertical: wp(0.2),
  },

  sentenceCardText: {
    color: "#fafafa",
    fontSize: wp(0.8),
    fontWeight: "500",
    textAlign: "center",
    fontFamily: "Poppins",
    lineHeight: 12, // Better line spacing for multi-line text
  },

  secondContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: hp(2),
  },

  // DISPLAYED CARDS - UPDATED STYLES
  cardsContainer: {
    justifyContent: "space-around",
    paddingVertical: hp(1),
    paddingHorizontal: wp(1),
    borderRadius: wp(1.5),
  },

  card: {
    backgroundColor: "#5FA056",
    borderRadius: wp(1),
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
    color: "#ffffff",
    textAlign: "center",
    fontFamily: "Poppins",
    fontWeight: "500",
    lineHeight: 16,
  },

  // FOOTER STYLES
  footer: {
    backgroundColor: "#E5E5E5",
    height: hp(8),
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
    gap: wp(0.5),
    paddingHorizontal: wp(2),
    paddingVertical: hp(1),
    borderRightWidth: 1,
    borderColor: "#9B72CF",
    minWidth: wp(15), // Ensure minimum width
  },

  categoryInfosActive: {
    backgroundColor: "#fafafa",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    height: hp(8),
    gap: wp(0.5),
    borderBottomLeftRadius: wp(1),
    borderBottomRightRadius: wp(1),
    paddingHorizontal: wp(2),
    paddingVertical: hp(1),
    borderRightWidth: 1,
    borderColor: "#9B72CF",
  },

  categoryInfosLast: {
    borderRightWidth: 0, // Remove border on last item
  },

  categoryImage: {
    borderRadius: wp(0.5),
    resizeMode: "contain",
    aspectRatio: 1,
    width: wp(2.5), // Consistent size like profile
    height: hp(2.5),
  },

  categoryText: {
    fontSize: wp(1.2),
    fontWeight: "500",
    color: "#9B72CF",
    fontFamily: "Poppins",
    textAlign: "left", // Left align like profile
    marginTop: 0,
  },
});
