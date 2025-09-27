import COLORS from "@/constants/Colors";
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
import PrimaryButton from "../PrimaryButton";
import MyDropdown from "./MyDropdown";

import * as ImagePicker from "expo-image-picker";

import {
  deleteCard,
  getCardInfoWithId,
  unassignCard,
  updateCard,
} from "@/services/cardsService";
import { getCategories } from "@/services/categoryService";
import { useEffect, useState } from "react";
import SecondaryButton from "../SecondaryButton";
import TextFieldWrapper from "../TextfieldWrapper";

type Props = {
  visible: boolean;
  onClose: () => void;
  cardId: string;
  learnerId: string;
  action: string;
  isDisabled?: boolean;
};

const ViewCardModal = ({
  visible,
  onClose,
  cardId,
  learnerId,
  action,
  isDisabled,
}: Props) => {
  // image upload functionalities
  const [image, setImage] = useState("");
  const [error, setError] = useState("");

  const pickImage = async () => {
    if (isDisabled) return;

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

  const [cardName, setCardName] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [card, setCard] = useState<any>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error("Error fetching categories: ", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchCardInfo = async () => {
      try {
        const cardData = await getCardInfoWithId(cardId);
        if (cardData) {
          setCard(cardData);
          setCardName(cardData.card_name || "");
          setImage(cardData.image || "");
          setSelectedCategory(cardData.category_id || "");
        }
      } catch (err) {
        console.error("Error fetching card info with id: ", err);
      }
    };

    if (cardId && visible) {
      fetchCardInfo();
    }
  }, [cardId, visible]);

  const dropdownItems = categories.map((category) => ({
    label: category.category_name,
    value: category.id,
  }));

  const handleAction = (cardId: string, action: string) => {
    if (action === "Unassign") {
      unassignCard(learnerId, cardId);
    } else if (action === "Delete") {
      deleteCard(cardId);
    } else if (action === "Update") {
      if (cardName.trim() === "") {
        Alert.alert("Error", "Please enter a card name.");
        return;
      }
      updateCard(cardId, cardName, image);
    }

    onClose();
  };

  const canUpdate = cardName.trim() !== "";

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
            <TouchableOpacity
              style={styles.imageContainer}
              onPress={pickImage}
              disabled={isDisabled}
            >
              {image !== "" ? (
                <Image source={{ uri: image }} style={styles.imagePreview} />
              ) : (
                <Icon name="image" size={50} color={COLORS.gray} />
              )}
              {!isDisabled && image !== "" && (
                <View style={styles.imageOverlay}>
                  <Icon name="pencil" size={16} color={COLORS.white} />
                </View>
              )}
            </TouchableOpacity>

            {/* Card Name */}
            <TextFieldWrapper label="Card Name">
              <TextInput
                value={cardName}
                onChangeText={setCardName}
                placeholder="Card Name"
                style={[styles.input, isDisabled && styles.inputDisabled]}
                editable={!isDisabled}
              />
            </TextFieldWrapper>

            {/* Category Selection */}
            <TextFieldWrapper label="Category Name">
              <MyDropdown
                isDisabled={true}
                dropdownItems={dropdownItems}
                placeholder="Select Category"
                value={selectedCategory}
                onChange={(val) => setSelectedCategory(val)}
              />
            </TextFieldWrapper>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <PrimaryButton
                title="Update"
                clickHandler={() => handleAction(cardId, "Update")}
                disabled={isDisabled || !canUpdate}
              />
              <SecondaryButton
                title={action}
                clickHandler={() => handleAction(cardId, action)}
                disabled={isDisabled}
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
    position: "relative",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.accent,
    justifyContent: "center",
    alignItems: "center",
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
  inputDisabled: {
    backgroundColor: COLORS.lightGray || "#f5f5f5",
    color: COLORS.gray,
  },
  buttonContainer: {
    marginTop: 15,
    marginBottom: 10,
    gap: 10,
  },
});

export default ViewCardModal;
