import COLORS from "@/constants/Colors";
import { getUnassignedCategories } from "@/services/categoryService";
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
import AssignCategoryPreview from "./AssignCategoryPreview";

type Props = {
  visible: boolean;
  onClose: () => void;
  learnerId?: string;
};

const AssignCategoryModal = ({ visible, onClose, learnerId }: Props) => {
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getUnassignedCategories(learnerId as string);
        setResults(data);
      } catch (err) {
        console.error("Error fetching boards: ", err);
      }
    };
    fetchCategories();
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
                collectionToSearch="pecsCategories"
                onSearch={(results) => {
                  setResults(results);
                }}
                placeholder="Search Category"
                query="assignCategory"
              />
            </View>
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: "75%" }}
            >
              <View style={styles.categoryContainer}>
                {results?.map((result, index) => (
                  <AssignCategoryPreview
                    categoryName={result.category_name}
                    categoryImage={result?.image}
                    categoryId={result.id}
                    learnerId={learnerId}
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
  categoryContainer: {
    gap: 10,
  },
});

export default AssignCategoryModal;
