import COLORS from "@/constants/Colors";
import { useEffect, useState } from "react";
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

import { addCategory } from "@/services/categoryService";
import { useAuthStore } from "@/stores/userAuthStore";
import { useUsersStore } from "@/stores/userStore";
import * as ImagePicker from "expo-image-picker";
import { runOnJS } from "react-native-reanimated";
import TextFieldWrapper from "../TextfieldWrapper";
import MyDropdown from "./MyDropdown";

type Learner = {
  id: string;
  name: string;
  avatar?: string;
};

type modalProps = {
  visible: boolean;
  onClose: () => void;
  learners?: Learner[]; // List of available learners
};

const user = useAuthStore.getState().user;

const AddCategoryModal = ({ visible, onClose }: modalProps) => {
  const { users: students } = useUsersStore();

  const [categoryName, setCategoryName] = useState("");
  const [selectedColor, setSelectedColor] = useState("#fff");
  const [isAssignable, setIsAssignable] = useState(true);

  const onSelectColor = ({ hex }: any) => {
    "worklet";
    runOnJS(setSelectedColor)(hex);
  };

  // image upload functionalities
  const [image, setImage] = useState("");
  const [error, setError] = useState("");

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Sorry, camera roll permission is needed to upload."
      );
    } else {
      const result = await ImagePicker.launchImageLibraryAsync();

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setImage(uri);
        setError("");
      }
    }
  };

  const mappedStudents = students
    .filter((student) => user?.handledChildren?.includes(student.id))
    .map((student) => ({
      label: `${student.first_name} ${student.last_name}`,
      value: student.id,
    }));

  const [selectedLearner, setSelectedLearner] = useState<string>("");

  useEffect(() => {
    if (mappedStudents.length > 0 && !selectedLearner) {
      setSelectedLearner(mappedStudents[0].value);
    }
  }, [mappedStudents]);

  const handleAssignabilityChange = (assignable: boolean) => {
    setIsAssignable(assignable);
    if (assignable && mappedStudents.length > 0) {
      setSelectedLearner(mappedStudents[0].value);
    }
  };

  useEffect(() => {
    if (!visible) {
      setImage("");
      setCategoryName("");
      setSelectedColor("#fff");
      setIsAssignable(true);
      setSelectedLearner(
        mappedStudents.length > 0 ? mappedStudents[0].value : ""
      );
    }
  }, [visible]);

  const canSubmit =
    categoryName !== "" && (isAssignable || selectedLearner !== null);

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
            {/* Image Upload */}
            <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
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
                  placeholder=""
                  value={selectedLearner}
                />
              </TextFieldWrapper>
            )}

            {/* Submit Button */}
            <View style={styles.buttonContainer}>
              <PrimaryButton
                title="Add Category"
                clickHandler={() => {
                  if (!canSubmit) {
                    if (categoryName === "") {
                      Alert.alert("Error", "Please enter a category name.");
                    } else if (!isAssignable && selectedLearner === null) {
                      Alert.alert(
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

                  addCategory(category)
                    .then(() => {
                      onClose();
                    })
                    .catch((err) => {});
                }}
                disabled={!canSubmit}
              />
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
  learnerSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 6,
    backgroundColor: COLORS.white,
  },
  learnerSelectorContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  learnerAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  selectedLearnerText: {
    fontSize: 14,
    color: COLORS.black,
  },
  placeholderText: {
    fontSize: 14,
    color: COLORS.gray,
  },
  learnerDropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 6,
    maxHeight: 150,
    zIndex: 1000,
    elevation: 5,
  },
  learnerList: {
    flex: 1,
  },
  learnerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray || "#f0f0f0",
  },
  selectedLearnerItem: {
    backgroundColor: COLORS.accent + "10",
  },
  learnerItemText: {
    fontSize: 14,
    color: COLORS.black,
    flex: 1,
  },
  buttonContainer: {
    marginTop: 15,
    marginBottom: 10,
  },
});

export default AddCategoryModal;
