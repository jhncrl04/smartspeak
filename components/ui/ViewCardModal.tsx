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

import getCurrentUid from "@/helper/getCurrentUid";
import {
  cleanupCompressedImage,
  compressImageToSize,
  validateImage,
} from "@/helper/imageCompressor";
import imageToBase64 from "@/helper/imageToBase64";
import { deleteCard, unassignCard, updateCard } from "@/services/cardsService";
import { useCardsStore } from "@/stores/cardsStore";
import { useCategoriesStore } from "@/stores/categoriesStores";
import { useUsersStore } from "@/stores/userStore";
import { useEffect, useState } from "react";
import SecondaryButton from "../SecondaryButton";
import TextFieldWrapper from "../TextfieldWrapper";
import LoadingScreen from "./LoadingScreen";
import { showToast } from "./MyToast";

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
  const { categories } = useCategoriesStore();
  const card = useCardsStore((state) =>
    state.cards.find((c) => c.id === cardId)
  );
  const { users } = useUsersStore();
  const selectedCategory = categories.find((c) => c.id === card?.category_id);

  // Local state for editing
  const [cardName, setCardName] = useState("");
  const [image, setImage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const disableEdit = card?.created_by !== getCurrentUid();

  // Initialize state when modal opens or card changes
  useEffect(() => {
    if (visible && card) {
      setCardName(card.card_name || "");
      setImage(card.image || "");
    }
  }, [visible, card]);

  const showImagePickerOptions = () => {
    Alert.alert("Select Photo", "Choose how you want to add a photo", [
      { text: "Camera", onPress: () => pickImage(true) },
      { text: "Gallery", onPress: () => pickImage(false) },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const pickImage = async (useCamera: boolean = false) => {
    try {
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
        showToast(
          "error",
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

      if (result.canceled) return;

      const uri = result.assets[0].uri;
      setError("");

      // Validate file type
      const validate = await validateImage(uri);
      if (!validate.isValid && validate.error?.includes("Invalid image type")) {
        showToast("error", "Invalid Image", validate.error);
        return;
      }

      // Check if compression is needed
      if (validate.invalidSize) {
        Alert.alert("Image size is too big", "Do you want to compress it?", [
          {
            text: "Compress",
            onPress: async () => {
              const compression = await compressImageToSize(uri);
              if (!compression.success) {
                showToast(
                  "error",
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

              const base64Image = await imageToBase64(compression.base64!);
              if (base64Image) {
                setImage(base64Image);
              }

              if (compression.compressedUri) {
                await cleanupCompressedImage(compression.compressedUri);
              }
            },
          },
          {
            text: "Select another image",
            style: "cancel",
          },
        ]);
      } else {
        // Image size is fine, convert directly
        const base64Image = await imageToBase64(uri);
        if (base64Image) {
          setImage(base64Image);
        }
      }
    } catch (err) {
      console.error("Image picker error:", err);
      showToast("error", "Upload Failed", "Something went wrong.");
    }
  };

  const dropdownItems = categories.map((category) => {
    if (category.is_assignable === false) {
      const assignedUser = users.find((u) => u.id === category.created_for);
      const userName = assignedUser
        ? `${assignedUser.first_name} ${assignedUser.last_name}`.trim()
        : "Unknown";

      return {
        label: `${category.category_name} (${userName} use only)`,
        value: category.id,
      };
    }

    return {
      label: category.category_name,
      value: category.id,
    };
  });

  const handleAction = async (cardId: string, action: string) => {
    setIsLoading(true);

    try {
      if (action === "Unassign") {
        await unassignCard(learnerId, cardId);
        showToast(
          "success",
          "Card Unassigned",
          `${card?.card_name} has been unassigned.`
        );
      } else if (action === "Delete") {
        await deleteCard(cardId);
      } else if (action === "Update") {
        if (cardName.trim() === "") {
          showToast("error", "Error", "Please enter a card name.");
          setIsLoading(false);
          return;
        }

        // Pass category_id if you need to update it too
        await updateCard(cardId, cardName, image);
        showToast("success", "Card Updated", `${cardName} has been updated.`);
      }

      onClose();
    } catch (err) {
      showToast("error", "Action Failed", `${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const canUpdate =
    cardName.trim() !== "" &&
    (cardName !== card?.card_name || image !== card?.image);

  if (!card) return null;

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
                disabled={disableEdit}
              >
                {image !== "" ? (
                  <Image source={{ uri: image }} style={styles.imagePreview} />
                ) : (
                  <Icon name="image" size={50} color={COLORS.gray} />
                )}
                {!disableEdit && image !== "" && (
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
                  style={[styles.input, disableEdit && styles.inputDisabled]}
                  editable={!disableEdit}
                />
              </TextFieldWrapper>

              {/* Category Selection */}
              <TextFieldWrapper label="Category Name">
                <MyDropdown
                  isDisabled={true}
                  dropdownItems={dropdownItems}
                  placeholder="Select Category"
                  value={selectedCategory?.id!}
                  onChange={(val) => console.log(val)}
                />
              </TextFieldWrapper>

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                <PrimaryButton
                  title="Update"
                  clickHandler={() => handleAction(cardId, "Update")}
                  disabled={disableEdit || !canUpdate}
                />
                <SecondaryButton
                  title={action}
                  clickHandler={() => handleAction(cardId, action)}
                  disabled={card.created_by === "ADMIN" && action === "Delete"}
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
