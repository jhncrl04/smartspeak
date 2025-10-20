import COLORS from "@/constants/Colors";
import { useEffect, useMemo, useState } from "react";
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
import ColorPicker, { Panel5 } from "reanimated-color-picker";
import PrimaryButton from "../PrimaryButton";

import {
  cleanupCompressedImage,
  compressImageToSize,
  validateImage,
} from "@/helper/imageCompressor";
import { addCategory } from "@/services/categoryService";
import { useAuthStore } from "@/stores/userAuthStore";
import { useUsersStore } from "@/stores/userStore";
import * as ImagePicker from "expo-image-picker";
import { runOnJS } from "react-native-reanimated";
import TextFieldWrapper from "../TextfieldWrapper";
import LoadingScreen from "./LoadingScreen";
import MyDropdown from "./MyDropdown";
import { showToast } from "./MyToast";

type Learner = {
  id: string;
  name: string;
  avatar?: string;
};

type modalProps = {
  visible: boolean;
  onClose: () => void;
  learners?: Learner[];
};

const AddCategoryModal = ({ visible, onClose }: modalProps) => {
  const user = useAuthStore((state) => state.user); // ✅ Move inside component
  const { users: students } = useUsersStore();

  const [categoryName, setCategoryName] = useState("");
  const [selectedColor, setSelectedColor] = useState("#fff");
  const [isAssignable, setIsAssignable] = useState(true);
  const [image, setImage] = useState("");
  const [error, setError] = useState("");
  const [selectedLearner, setSelectedLearner] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

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
      permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    } else {
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

      const validate = await validateImage(uri);
      if (!validate.isValid && validate.error?.includes("Invalid image type")) {
        showToast("error", "Invalid Image", validate.error);
        return;
      }

      const compression = await compressImageToSize(uri);
      if (!compression.success) {
        Alert.alert(
          "Compression Failed",
          compression.error || "Failed to process image"
        );
        return;
      }

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

      if (compression.base64) {
        setImage(compression.base64);
      } else {
        showToast("error", "Upload Failed", "Please try again.");
      }

      if (compression.compressedUri) {
        await cleanupCompressedImage(compression.compressedUri);
      }
    }
  };

  // ✅ Use useMemo for stable reference
  const mappedStudents = useMemo(() => {
    if (!user?.handledChildren) return [];

    return students
      .filter((student) => user.handledChildren!.includes(student.id))
      .map((student) => ({
        label: `${student.first_name} ${student.last_name}`,
        value: student.id,
      }));
  }, [students, user?.handledChildren]);

  // ✅ Set default learner when mappedStudents changes
  useEffect(() => {
    if (mappedStudents.length > 0 && !selectedLearner) {
      setSelectedLearner(mappedStudents[0].value);
    }
  }, [mappedStudents]);

  const handleAssignabilityChange = (assignable: boolean) => {
    setIsAssignable(assignable);
    if (!assignable && mappedStudents.length > 0 && !selectedLearner) {
      setSelectedLearner(mappedStudents[0].value);
    }
  };

  // ✅ Reset form when modal closes
  useEffect(() => {
    if (!visible) {
      setImage("");
      setCategoryName("");
      setSelectedColor("#fff");
      setIsAssignable(true);
      setSelectedLearner(
        mappedStudents.length > 0 ? mappedStudents[0].value : ""
      );
      setError("");
    }
  }, [visible, mappedStudents]);

  const canSubmit =
    categoryName !== "" && (isAssignable || selectedLearner !== "");

  const handleSubmit = async () => {
    if (!canSubmit) {
      if (categoryName === "") {
        showToast("error", "Error", "Please enter a category name.");
      } else if (!isAssignable && selectedLearner === "") {
        showToast(
          "error",
          "Error",
          "Please select a learner for this category."
        );
      }
      return;
    }

    const category = {
      name: categoryName,
      color: selectedColor,
      image: image,
      isAssignable: isAssignable,
      assignedLearnerId: isAssignable ? null : selectedLearner,
    };

    console.log(category);

    try {
      setIsLoading(true);
      await addCategory(category);
      onClose();
    } catch (err) {
      console.error("Error adding category:", err);
      showToast("error", "Error", "Failed to add category. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={() => {
          showToast("success", "Modal has been closed.", "");
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
              decelerationRate="fast" // slows down the momentum
              scrollEventThrottle={16}
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

              {/* Category Name */}
              <TextFieldWrapper label="Category Name">
                <TextInput
                  value={categoryName}
                  onChangeText={setCategoryName}
                  placeholder="Category Name"
                  style={styles.input}
                />
              </TextFieldWrapper>

              {/* Color Picker */}
              <TextFieldWrapper label="Background Color">
                <ColorPicker
                  style={styles.colorPicker}
                  value={selectedColor}
                  onComplete={onSelectColor}
                >
                  <Panel5 />
                </ColorPicker>
              </TextFieldWrapper>

              {/* Assignment Type */}
              <TextFieldWrapper label="Assignment Type">
                <View style={styles.optionRow}>
                  <TouchableOpacity
                    style={[
                      styles.optionButton,
                      isAssignable && styles.optionButtonSelected,
                    ]}
                    onPress={() => handleAssignabilityChange(true)}
                  >
                    <Icon
                      name={isAssignable ? "check-circle-fill" : "circle"}
                      size={16}
                      color={isAssignable ? COLORS.accent : COLORS.gray}
                    />
                    <Text
                      style={[
                        styles.optionText,
                        isAssignable && styles.optionTextSelected,
                      ]}
                    >
                      Assignable to any learner
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.optionRow}>
                  <TouchableOpacity
                    style={[
                      styles.optionButton,
                      !isAssignable && styles.optionButtonSelected,
                    ]}
                    onPress={() => handleAssignabilityChange(false)}
                  >
                    <Icon
                      name={!isAssignable ? "check-circle-fill" : "circle"}
                      size={16}
                      color={!isAssignable ? COLORS.accent : COLORS.gray}
                    />
                    <Text
                      style={[
                        styles.optionText,
                        !isAssignable && styles.optionTextSelected,
                      ]}
                    >
                      Assign to specific learner
                    </Text>
                  </TouchableOpacity>
                </View>
              </TextFieldWrapper>

              {/* Learner Selection */}
              {!isAssignable && (
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
                  title="Add Category"
                  clickHandler={handleSubmit}
                  disabled={!canSubmit || isLoading}
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
  colorPicker: {
    width: 175,
    marginTop: 8,
  },
  optionRow: {
    marginBottom: 8,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.gray,
    backgroundColor: COLORS.white,
  },
  optionButtonSelected: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accent + "15",
  },
  optionText: {
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.gray,
  },
  optionTextSelected: {
    color: COLORS.accent,
    fontWeight: "500",
  },
  buttonContainer: {
    marginTop: 15,
    marginBottom: 10,
  },
});

export default AddCategoryModal;
