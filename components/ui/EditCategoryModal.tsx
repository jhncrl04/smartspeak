import COLORS from "@/constants/Colors";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Octicons";
import ColorPicker, { Panel5 } from "reanimated-color-picker";
import PrimaryButton from "../PrimaryButton";

import imageToBase64 from "@/helper/imageToBase64";
import {
  deleteCategoryWithLoading,
  getCategoryWithId,
  updateCategory,
} from "@/services/categoryService";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { runOnJS } from "react-native-reanimated";
import SecondaryButton from "../SecondaryButton";
import TextFieldWrapper from "../TextfieldWrapper";
import LoadingScreen from "./LoadingScreen";

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
        image: await imageToBase64(image),
      });

      Alert.alert("Success", "Category updated successfully!");
      onClose();
    } catch (err) {
      console.error("Error updating category: ", err);
      Alert.alert("Error", "Failed to update category.");
    }
  };

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      const success = await deleteCategoryWithLoading(
        categoryId,
        setIsDeleting
      );

      if (success) {
        router.back();
      }

      onClose();
    } catch (err) {
      console.error("Error deleting category: ", err);
      Alert.alert("Error", "Failed to delete category.");
    }
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
      <LoadingScreen visible={isDeleting} />

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
            {/* Image Upload */}
            <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
              {image !== "" ? (
                <Image source={{ uri: image }} style={styles.imagePreview} />
              ) : (
                <Icon name="image" size={50} color={COLORS.gray} />
              )}
            </TouchableOpacity>
            <TextFieldWrapper label="Category Name">
              <TextInput
                value={categoryName}
                onChangeText={setCategoryName}
                placeholder="Category Name"
                style={styles.input}
              />
            </TextFieldWrapper>

            <TextFieldWrapper label="Background Color">
              <ColorPicker
                style={styles.colorPicker}
                value={selectedColor}
                onComplete={onSelectColor}
              >
                <Panel5 />
              </ColorPicker>
            </TextFieldWrapper>

            {/* Buttons */}
            <View style={{ flexDirection: "row", gap: 10, marginTop: 30 }}>
              <PrimaryButton title="Save" clickHandler={handleSave} />
              <SecondaryButton title="Delete" clickHandler={handleDelete} />
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
    width: "50%", // side-sheet style
    height: "100%",
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 25,
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
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.cardBg,
    alignSelf: "center",
    marginBottom: 20,
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  mainContainer: {
    flex: 1,
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
  colorPicker: {
    width: 175,
    marginTop: 8,
  },
});

export default EditCategoryModal;
