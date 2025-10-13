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

import {
  cleanupCompressedImage,
  compressImageToSize,
  validateImage,
} from "@/helper/imageCompressor";
import imageToBase64 from "@/helper/imageToBase64";
import {
  deleteCategoryWithLoading,
  updateCategory,
} from "@/services/categoryService";
import { useCategoriesStore } from "@/stores/categoriesStores";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { runOnJS } from "react-native-reanimated";
import SecondaryButton from "../SecondaryButton";
import TextFieldWrapper from "../TextfieldWrapper";
import LoadingScreen from "./LoadingScreen";
import { showToast } from "./MyToast";

type modalProps = {
  visible: boolean;
  onClose: () => void;
  categoryId: string;
};

const EditCategoryModal = ({ visible, onClose, categoryId }: modalProps) => {
  const { categories } = useCategoriesStore();

  const [categoryName, setCategoryName] = useState("");
  const [selectedColor, setSelectedColor] = useState("#fff");
  const [image, setImage] = useState("");
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Load category data whenever modal opens or categoryId changes
  useEffect(() => {
    if (visible && categoryId) {
      const category = categories.find((c) => c.id === categoryId);

      if (category) {
        setCategoryName(category.category_name || "");
        setSelectedColor(category.background_color || "#fff");
        setImage(category.image || "");
      }
    }
  }, [visible, categoryId, categories]);

  // Reset form when modal closes
  useEffect(() => {
    if (!visible) {
      setCategoryName("");
      setSelectedColor("#fff");
      setImage("");
      setError("");
    }
  }, [visible]);

  const onSelectColor = ({ hex }: any) => {
    "worklet";
    runOnJS(setSelectedColor)(hex);
  };

  const showImagePickerOptions = () => {
    Alert.alert("Select Photo", "Choose how you want to add a photo", [
      { text: "Camera", onPress: () => pickImage(true) },
      { text: "Gallery", onPress: () => pickImage(false) },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const pickImage = async (useCamera: boolean = false) => {
    let permissionResult;

    if (useCamera) {
      // Camera permission
      permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    } else {
      // Gallery permission
      permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
    }

    if (permissionResult.status !== "granted") {
      Alert.alert(
        "Permission Denied",
        `Sorry, ${
          useCamera ? "camera" : "media library"
        } permission is needed to upload.`
      );
      return;
    }

    // Open camera or gallery
    const result = useCamera
      ? await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          quality: 0.9,
        })
      : await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          quality: 0.9,
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
        });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setError("");

      // 1. Only validate file type
      const validate = await validateImage(uri);
      if (!validate.isValid && validate.error?.includes("Invalid image type")) {
        Alert.alert("Invalid Image", validate.error);
        return;
      }

      // 2. Always compress the image
      const compression = await compressImageToSize(uri);
      if (!compression.success) {
        Alert.alert(
          "Compression Failed",
          compression.error || "Failed to process image"
        );
        return;
      }

      // 3. Log compression stats
      if (compression.originalSize && compression.compressedSize) {
        const savings = (
          ((compression.originalSize - compression.compressedSize) /
            compression.originalSize) *
          100
        ).toFixed(1);
        console.log(
          `Image compressed: ${Math.round(
            compression.originalSize / 1024
          )}KB → ${Math.round(
            compression.compressedSize / 1024
          )}KB (${savings}% reduction)`
        );
      }

      // 4. Upload the compressed base64 image
      const uploadedBase64 = await imageToBase64(compression.base64!);

      if (uploadedBase64) {
        setImage(uploadedBase64);
      } else {
        Alert.alert("Upload Failed", "Please try again.");
      }

      // 5. Cleanup temporary file
      if (compression.compressedUri) {
        await cleanupCompressedImage(compression.compressedUri);
      }
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
        image: image ? await imageToBase64(image) : "",
      });

      showToast(
        "success",
        "Category Updated",
        `${categoryName} category has been updated`
      );
      onClose();
    } catch (err) {
      console.error("Error updating category: ", err);

      showToast(
        "error",
        "Category Update Failed",
        `Failed to update ${categoryName} category`
      );
    }
  };

  const handleDelete = async () => {
    try {
      const success = await deleteCategoryWithLoading(
        categoryId,
        setIsDeleting
      );

      if (success) {
        showToast(
          "success",
          "Category Deletion Success",
          `${categoryName} deleted successfully`
        );

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
            <TouchableOpacity
              style={styles.imageContainer}
              onPress={showImagePickerOptions}
            >
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
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    width: "50%",
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
