import COLORS from "@/constants/Colors";
import getCurrentUid from "@/helper/getCurrentUid";
import { useCardsStore } from "@/stores/cardsStore";
import { useCategoriesStore } from "@/stores/categoriesStores";
import { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Octicons";
import MySearchBar from "../mySearchBar";
import AssignCardPreview from "./AssignCardPreview";

type Props = {
  visible: boolean;
  onClose: () => void;
  learnerId?: string;
  categoryId?: string;
};

const AssignCardModal = ({
  visible,
  onClose,
  learnerId,
  categoryId,
}: Props) => {
  const [searchQuery, setSearchQuery] = useState("");

  const cards = useCardsStore((state) => state.cards);
  const categories = useCategoriesStore((state) => state.categories);

  const uid = getCurrentUid();

  const mappedCards = cards.filter((card) => {
    if (
      card.created_by === uid &&
      card.category_id === categoryId &&
      (!card.created_for ||
        card.created_for === learnerId ||
        card.created_for === "all") &&
      !card.assigned_to?.includes(learnerId)
    )
      return card;
  });

  const filteredCards = mappedCards.filter((card) => {
    if (!searchQuery.trim()) return true;

    // Filter by search query (case-insensitive)
    const query = searchQuery.toLowerCase().trim();
    const cardName = card.card_name.toLowerCase();

    return cardName.includes(query);
  });

  const activeCategory = categories.find(
    (category) => category.id === categoryId
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={() => {
        Alert.alert("Modal has been closed.");
        onClose();
      }}
    >
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
        <View style={styles.modalContainer}>
          {/* Close button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="x" size={22} color={COLORS.gray} />
          </TouchableOpacity>

          {/* Scrollable content */}
          <ScrollView
            style={styles.mainContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.headerContainer}>
              <Text style={styles.title}>Assign Cards</Text>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <MySearchBar
                collectionToSearch="cards"
                onSearch={(query) => {
                  handleSearch(query as string);
                }}
                placeholder="Search Cards"
                query="local"
              />
            </View>

            {/* Cards List */}
            <View style={styles.cardContainer}>
              {filteredCards?.map((result, index) => (
                <AssignCardPreview
                  learnerId={learnerId as string}
                  cardId={result.id}
                  cardName={result.card_name}
                  cardCategory={activeCategory?.category_name!}
                  categoryColor={activeCategory?.background_color!}
                  image={result.image}
                  key={result.id}
                />
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.shadow,
    flexDirection: "row",
    justifyContent: "flex-end", // pushes modal to right side
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    width: "50%", // side sheet style
    height: "100%",
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 5,
    shadowColor: COLORS.black,
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 10,
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 16,
    padding: 6,
    zIndex: 10,
  },
  mainContainer: {
    flex: 1,
  },
  headerContainer: {
    paddingTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.gray,
  },
  searchContainer: {
    marginBottom: 20,
  },
  cardContainer: {
    gap: 10,
    paddingBottom: 20,
  },
});

export default AssignCardModal;
