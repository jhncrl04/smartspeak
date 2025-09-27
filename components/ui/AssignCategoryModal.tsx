import COLORS from "@/constants/Colors";
import { getUnassignedCategories } from "@/services/categoryService";
import { useEffect, useState } from "react";
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
              <Text style={styles.title}>Assign Categories</Text>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <MySearchBar
                collectionToSearch="pecsCategories"
                onSearch={(results) => {
                  setResults(results);
                }}
                placeholder="Search Category"
                query="assignCategory"
              />
            </View>

            {/* Categories List */}
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
  categoryContainer: {
    gap: 10,
    paddingBottom: 20,
  },
});

export default AssignCategoryModal;
