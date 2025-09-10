import COLORS from "@/constants/Colors";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Octicons";
import ColorPicker, { Panel5 } from "reanimated-color-picker";
import PrimaryButton from "../PrimaryButton";

import {
  deleteCategory,
  getCategoryWithId,
  updateCategory,
} from "@/services/categoryService";
import * as ImagePicker from "expo-image-picker";
import { runOnJS } from "react-native-reanimated";
import SecondaryButton from "../SecondaryButton";

type modalProps = {
  visible: boolean;
  onClose: () => void;
  categoryId: string;
};

const EditCategoryModal = ({ visible, onClose, categoryId }: modalProps) => {
  const [categoryName, setCategoryName] = useState("");
  const [selectedColor, setSelectedColor] = useState("#fff");
  const [image, setImage] = useState("");
  const [error, setError] = useState("");

  // Load category details when modal opens
  useEffect(() => {
    if (!visible || !categoryId) return;

    const fetchCategoryDetails = async () => {
      try {
        const category = await getCategoryWithId(categoryId);
        if (category) {
          setCategoryName(category.category_name);
          setSelectedColor(category.background_color || "#fff");
          setImage(category.image || "");
        }
      } catch (err) {
        console.error("Error fetching category: ", err);
      }
    };

    fetchCategoryDetails();
  }, [visible, categoryId]);

  // Reset image on close
  useEffect(() => {
    if (!visible) setImage("");
  }, [visible]);

  const onSelectColor = ({ hex }: any) => {
    "worklet";
    runOnJS(setSelectedColor)(hex);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("Permission Denied", "Camera roll permission is needed.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync();

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setError("");
    }
  };

  const handleSave = async () => {
    if (!categoryName.trim()) {
      setError("Category name is required");
      return;
    }

    try {
      await updateCategory(categoryId, {
        category_name: categoryName,
        background_color: selectedColor,
        image,
      });

      Alert.alert("Success", "Category updated successfully!");
      onClose();
    } catch (err) {
      console.error("Error updating category: ", err);
      Alert.alert("Error", "Failed to update category.");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCategory(categoryId);

      Alert.alert("Success", "Category deleted successfully!");
      onClose();
    } catch (err) {
      console.error("Error deleting category: ", err);
      Alert.alert("Error", "Failed to delete category.");
    }
  };
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={() => {
        Alert.alert("Modal has been closed.");
        onClose();
      }}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="x" size={20} color={COLORS.gray} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
            {image !== "" ? (
              <Image source={{ uri: image }} style={styles.imagePreview} />
            ) : (
              <Icon name="image" size={40} color={COLORS.gray} />
            )}
          </TouchableOpacity>
          <View style={styles.mainContainer}>
            <TextInput
              value={categoryName}
              onChangeText={setCategoryName}
              placeholder="Category Name"
              style={styles.input}
            />
            <View style={styles.colorPickerContainer}>
              <Text>Background</Text>
              <ColorPicker
                style={styles.colorPicker}
                value={selectedColor}
                onComplete={onSelectColor}
              >
                <Panel5 />
              </ColorPicker>
            </View>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <PrimaryButton title="Save" clickHandler={handleSave} />

              <SecondaryButton title="Delete" clickHandler={handleDelete} />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.shadow,
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    aspectRatio: 1,

    justifyContent: "center",
    alignItems: "center",

    backgroundColor: COLORS.cardBg,
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  modalContainer: {
    position: "relative",

    width: "auto",
    maxWidth: "80%",

    backgroundColor: COLORS.white,
    borderRadius: 5,
    overflow: "hidden",

    flexDirection: "row",

    elevation: 5,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  closeButton: {
    position: "absolute",
    top: 5,
    right: 10,

    zIndex: 1,

    padding: 2,
  },
  mainContainer: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    alignSelf: "flex-start",

    padding: 30,
    gap: 10,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
  },
  colorPickerContainer: {
    width: "100%",
  },
  colorPicker: {
    width: 175,
  },
});

export default EditCategoryModal;
