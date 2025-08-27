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

import { addCategory } from "@/services/categoryService";
import * as ImagePicker from "expo-image-picker";
import { runOnJS } from "react-native-reanimated";

type modalProps = {
  visible: boolean;
  onClose: () => void;
};

const AddCategoryModal = ({ visible, onClose }: modalProps) => {
  const [categoryName, setCategoryName] = useState("");
  const [selectedColor, setSelectedColor] = useState("#fff");

  const onSelectColor = ({ hex }: any) => {
    "worklet";

    console.log(hex);

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

  useEffect(() => {
    if (!visible) {
      setImage("");
    }
  }, [visible]);

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
            <View>
              <PrimaryButton
                title="Add"
                clickHandler={() => {
                  if (categoryName !== "") {
                    const category = {
                      name: categoryName,
                      color: selectedColor,
                      image: image,
                    };

                    addCategory(category)
                      .then(() => {
                        Alert.alert("Category added successfully");
                        onClose();
                      })
                      .catch((err) => {
                        console.error("Error uploading category: ", err);
                        Alert.alert("Error", "Failed to upload category.");
                      });

                    console.log("saving");
                  }
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

export default AddCategoryModal;
