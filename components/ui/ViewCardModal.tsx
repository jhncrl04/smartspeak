import COLORS from "@/constants/Colors";
import {
  Alert,
  Image,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
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

type Props = {
  visible: boolean;
  onClose: () => void;
  cardId: string;
  learnerId: string;
  action: string;
};

const ViewCardModal = ({
  visible,
  onClose,
  cardId,
  learnerId,
  action,
}: Props) => {
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

  const [cardName, setCardName] = useState("");

  const dropdownItems: any[] = [];
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error("Error fetching boards: ", err);
      }
    };
    fetchCategories();
  }, []);

  categories.forEach((category) => {
    const categoryDetail = {
      label: category.category_name,
      value: category.id,
    };

    dropdownItems.push(categoryDetail);
  });
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const [card, setCard] = useState<any>(null);

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

    if (cardId) {
      fetchCardInfo();
    }
  }, [cardId]);

  const handleAction = (cardId: string, action: string) => {
    if (action === "Unassign") {
      unassignCard(learnerId, cardId);
    } else if (action === "Delete") {
      deleteCard(cardId);
    } else if (action === "Update") {
      updateCard(cardId, cardName, image);
    }

    onClose();
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
            <View style={styles.inputContainer}>
              <View style={styles.cardInfo}>
                <TextInput
                  style={styles.input}
                  placeholder="Name"
                  placeholderTextColor={COLORS.gray}
                  value={cardName}
                  onChangeText={setCardName}
                />
                <View style={styles.dropdownWrapper}>
                  <MyDropdown
                    isDisabled={true}
                    dropdownItems={dropdownItems}
                    placeholder="Category"
                    value={selectedCategory}
                    onChange={(val) => setSelectedCategory(val)}
                  />
                </View>
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <PrimaryButton
                title="Update"
                clickHandler={() => {
                  handleAction(cardId, "Update");
                }}
              />

              <SecondaryButton
                title={action}
                clickHandler={() => {
                  handleAction(cardId, action);
                }}
              />
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
    top: 10,
    right: 30,

    zIndex: 1,

    padding: 2,
  },
  inputContainer: { gap: 10 },
  cardInfo: { flexDirection: "row", alignItems: "center", gap: 10 },
  buttonContainer: {
    gap: 10,

    minHeight: 60,
  },
  mainContainer: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    alignSelf: "flex-start",

    paddingVertical: 40,
    paddingHorizontal: 30,
    gap: 20,
  },
  input: {
    flex: 1,
    paddingVertical: 5,
    fontSize: 16,
    lineHeight: 20,
    minHeight: 40,

    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  dropdownWrapper: {
    minHeight: 40,
    minWidth: 150,
    flexShrink: 0,
  },
});
export default ViewCardModal;
