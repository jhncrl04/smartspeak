import COLORS from "@/constants/Colors";
import { getUnassignedCards } from "@/services/cardsService";
import { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
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
  const [results, setResults] = useState<any[]>([]);
  const [categoryName, setCategoryName] = useState("");

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const [data, categoryName] = await getUnassignedCards(
          learnerId as string,
          categoryId as string
        );
        setResults(data);
        setCategoryName(categoryName);
      } catch (err) {
        console.error("Error fetching boards: ", err);
      }
    };
    fetchCards();
  }, []);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={() => {
        setResults([]);
      }}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="x" size={22} color={COLORS.gray} />
          </TouchableOpacity>

          <View style={{ flex: 1, gap: 10 }}>
            <View>
              <MySearchBar
                collectionToSearch="cards"
                onSearch={(results) => {
                  setResults(results);
                }}
                placeholder="Search Cards"
                query="card"
              />
            </View>
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: "75%" }}
            >
              <View style={styles.cardContainer}>
                {results?.map((result, index) => (
                  <AssignCardPreview
                    learnerId={learnerId as string}
                    cardId={result.id}
                    cardName={result.card_name}
                    cardCategory={categoryName}
                    categoryColor={result.background_color}
                    image={result.image}
                    key={index}
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.shadow,
  },
  modalContent: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 30,

    position: "relative",
    borderRadius: 16,
    maxHeight: "90%",
    width: "85%",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  closeButton: { position: "absolute", top: 15, right: 20 },
  cardContainer: {
    gap: 10,
  },
});

export default AssignCardModal;
