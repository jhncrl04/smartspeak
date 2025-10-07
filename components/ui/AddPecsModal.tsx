import COLORS from "@/constants/Colors";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Octicons";
import PrimaryButton from "../PrimaryButton";
import MyDropdown from "./MyDropdown";

import * as ImagePicker from "expo-image-picker";

import {
  cleanupCompressedImage,
  compressImageToSize,
  validateImage,
} from "@/helper/imageCompressor";
import imageToBase64 from "@/helper/imageToBase64";
import { addCard } from "@/services/cardsService";
import { useCategoriesStore } from "@/stores/categoriesStores";
import { useAuthStore } from "@/stores/userAuthStore";
import { useUsersStore } from "@/stores/userStore";
import { useEffect, useState } from "react";
import TextFieldWrapper from "../TextfieldWrapper";
import LoadingScreen from "./LoadingScreen";

type AddPecsModalProps = {
  visible: boolean;
  onClose: () => void;
  categoryId?: string;
};

const user = useAuthStore.getState().user;

const AddPecsModal = ({ visible, onClose, categoryId }: AddPecsModalProps) => {
  const { users: students } = useUsersStore();
  // ✅ FIX: Get all categories once (stable reference)
  const allCategories = useCategoriesStore((state) => state.categories);

  // ✅ Filter in useMemo with stable dependency
  const categories = allCategories.filter((c) => c.created_by === user?.uid);

  const [image, setImage] = useState("");
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [cardName, setCardName] = useState("");
  const [isSpecificLearnerCard, setIsSpecificLearnerCard] = useState(false);
  const [selectedLearner, setSelectedLearner] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

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
          quality: 0.9, // Slightly reduce initial quality
        })
      : await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          quality: 0.9, // Slightly reduce initial quality
          mediaTypes: ImagePicker.MediaTypeOptions.Images, // Only images
        });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setError("");

      // 1. Only validate file type (not size - we'll compress it)
      const validate = await validateImage(uri);
      if (!validate.isValid && validate.error?.includes("Invalid image type")) {
        Alert.alert("Invalid Image", validate.error);
        return;
      }

      // 2. Always compress the image (handles oversized images automatically)
      const compression = await compressImageToSize(uri);
      if (!compression.success) {
        Alert.alert(
          "Compression Failed",
          compression.error || "Failed to process image"
        );
        return;
      }

      // Skip base64 size validation - compressImageToSize already handles this

      // 3. Log compression stats (optional)
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
        // Alert.alert("Success", "Profile picture updated!");
      } else {
        Alert.alert("Upload Failed", "Please try again.");
      }

      // 5. Cleanup temporary file
      if (compression.compressedUri) {
        await cleanupCompressedImage(compression.compressedUri);
      }
    }
  };

  const selectedCategoryData = categories.find(
    (cat) => cat.id === selectedCategory
  );

  useEffect(() => {
    if (!visible) {
      setImage("");
      setCardName("");
      setIsSpecificLearnerCard(false);
      if (!categoryId) {
        setSelectedCategory("");
      }
    }
  }, [visible, categoryId]);

  const mappedStudents = students
    .filter((student) => user?.handledChildren?.includes(student.id))
    .map((student) => ({
      label: `${student.first_name} ${student.last_name}`,
      value: student.id,
    }));

  // ✅ Handle category change properly
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);

    const categoryData = categories.find((cat) => cat.id === categoryId);

    if (categoryData) {
      if (categoryData.is_assignable !== false) {
        // Assignable category - default to assignable
        setIsSpecificLearnerCard(false);
        setSelectedLearner("");
      } else {
        // Non-assignable category - default to specific learner
        setIsSpecificLearnerCard(true);
        // Set the learner this category is assigned to
        if (categoryData.created_for) {
          setSelectedLearner(categoryData.created_for);
        }
      }
    }
  };

  const categoryDropdownItems = categories.map((cat) => {
    if (cat.is_assignable === false) {
      const assignedUser = students.find((u) => u.id === cat.created_for);

      const userName = assignedUser
        ? `${assignedUser.first_name} ${assignedUser.last_name}`.trim()
        : "Unknown";

      return {
        label: `${cat.category_name} (${userName} use only)`,
        value: cat.id,
      };
    }

    return {
      label: cat.category_name,
      value: cat.id,
    };
  });

  console.log(categoryDropdownItems);

  // Show card type selection only when category is assignable (gives user freedom to choose)
  const showCardTypeSelection =
    selectedCategoryData && selectedCategoryData.is_assignable !== false;

  const canSubmit = image !== "" && cardName !== "" && selectedCategory !== "";

  return (
    <>
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

              {/* Card Name */}
              <TextFieldWrapper label="Card Name">
                <TextInput
                  value={cardName}
                  onChangeText={setCardName}
                  placeholder="Card Name"
                  style={styles.input}
                />
              </TextFieldWrapper>

              {/* Category Selection */}
              <TextFieldWrapper label="Category Name">
                <MyDropdown
                  dropdownItems={categoryDropdownItems}
                  placeholder="Select Category"
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                />
              </TextFieldWrapper>

              {/* Card Type Selection - Only show when category is assignable (gives user choice) */}
              {showCardTypeSelection && (
                <TextFieldWrapper label="Card Type">
                  <View style={styles.radioContainer}>
                    {/* Assignable Option */}
                    <TouchableOpacity
                      style={styles.radioOption}
                      onPress={() => setIsSpecificLearnerCard(false)}
                    >
                      <View
                        style={[
                          styles.radioButton,
                          !isSpecificLearnerCard && styles.radioButtonSelected,
                        ]}
                      >
                        {!isSpecificLearnerCard && (
                          <View style={styles.radioButtonInner} />
                        )}
                      </View>
                      <Text style={styles.radioLabel}>
                        Assignable (Available to everyone)
                      </Text>
                    </TouchableOpacity>

                    {/* Specific Learner Option */}
                    <TouchableOpacity
                      style={styles.radioOption}
                      onPress={() => setIsSpecificLearnerCard(true)}
                    >
                      <View
                        style={[
                          styles.radioButton,
                          isSpecificLearnerCard && styles.radioButtonSelected,
                        ]}
                      >
                        {isSpecificLearnerCard && (
                          <View style={styles.radioButtonInner} />
                        )}
                      </View>
                      <Text style={styles.radioLabel}>
                        Specific Learner Only
                      </Text>
                    </TouchableOpacity>
                  </View>
                </TextFieldWrapper>
              )}

              {isSpecificLearnerCard &&
                selectedCategoryData?.is_assignable !== false && (
                  <TextFieldWrapper label="Select Learner">
                    <MyDropdown
                      dropdownItems={mappedStudents}
                      onChange={(value) => {
                        setSelectedLearner(value as string);
                      }}
                      placeholder="Select a learner"
                      value={selectedLearner}
                    />
                  </TextFieldWrapper>
                )}

              {/* Submit Button */}
              <View style={styles.buttonContainer}>
                <PrimaryButton
                  title="Add Card"
                  clickHandler={() => {
                    if (!canSubmit) {
                      if (image === "") {
                        Alert.alert("Error", "Please select an image.");
                      } else if (cardName === "") {
                        Alert.alert("Error", "Please enter a card name.");
                      } else if (selectedCategory === "") {
                        Alert.alert("Error", "Please select a category.");
                      }
                      return;
                    }

                    const card = {
                      name: cardName,
                      category_id: selectedCategory,
                      image: image,
                      is_assignable: !isSpecificLearnerCard,
                      created_for: isSpecificLearnerCard
                        ? selectedLearner
                        : null,
                    };

                    setIsLoading(true);

                    addCard(card)
                      .then(() => {
                        setIsLoading(false);

                        onClose();
                      })
                      .catch((err) => {
                        console.error("Error uploading card:", err);
                        setIsLoading(false);
                      });
                  }}
                  disabled={!canSubmit}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
      <LoadingScreen visible={isLoading} />
    </>
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
  mainContainer: {
    flex: 1,
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
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 15,
    marginBottom: 10,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: COLORS.gray,
    borderRadius: 4,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  checkboxLabel: {
    fontSize: 16,
    color: COLORS.black,
    flex: 1,
  },
  radioContainer: {
    paddingVertical: 8,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: COLORS.gray,
    borderRadius: 10,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonSelected: {
    borderColor: COLORS.accent,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.accent,
  },
  radioLabel: {
    fontSize: 16,
    color: COLORS.black,
    flex: 1,
  },
});

export default AddPecsModal;
