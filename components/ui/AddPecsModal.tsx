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
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";

import { useEffect, useState } from "react";

const dropdownItems = [
  { label: "Foods", value: "foods" },
  { label: "Places", value: "places" },
  { label: "Activities", value: "activities" },
  { label: "Objects", value: "objects" },
];

type AddPecsModalProps = {
  visible: boolean;
  onClose: () => void;
};

const AddPecsModal = ({ visible, onClose }: AddPecsModalProps) => {
  // audio functionalities
  const [audioSource, setAudioSource] = useState("");
  const player = useAudioPlayer(audioSource);

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);

  const record = async () => {
    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();
  };

  const stopRecording = async () => {
    await audioRecorder.stop();

    if (audioRecorder.uri) {
      setAudioSource(audioRecorder.uri);
      console.log("Recording URI:", audioRecorder.uri);
    } else {
      console.warn("Recording URI not available yet.");
    }
  };

  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();

      if (!status.granted) {
        Alert.alert("Permission to access microphone was denied");
      }

      setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
    })();
  }, []);

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
              <Image source={{ uri: image }} />
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
                />
                <View style={{ minWidth: 150 }}>
                  <MyDropdown
                    dropdownItems={dropdownItems}
                    placeholder="Category"
                  />
                </View>
              </View>
              <View>
                <TextInput
                  style={styles.input}
                  placeholder="Recordings"
                  placeholderTextColor={COLORS.gray}
                />
              </View>
              <View style={styles.buttonContainer}>
                <PrimaryButton
                  title="Play"
                  clickHandler={() => {
                    player.play();
                  }}
                />
                <PrimaryButton title="Upload" clickHandler={() => {}} />
                <PrimaryButton
                  title={recorderState.isRecording ? "Stop" : "Record"}
                  clickHandler={
                    recorderState.isRecording ? stopRecording : record
                  }
                />
              </View>
            </View>

            <View>
              <PrimaryButton title="Save" clickHandler={() => {}} />
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
    flexGrow: 1,
    flexShrink: 0,
    aspectRatio: 1,

    justifyContent: "center",
    alignItems: "center",

    backgroundColor: COLORS.cardBg,
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
  mainContainer: {
    paddingVertical: 40,
    paddingHorizontal: 30,
    gap: 20,
  },
  inputContainer: { gap: 10 },
  cardInfo: { flexDirection: "row", gap: 10 },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,

    width: 250,
    maxWidth: "auto",
  },
  input: {
    paddingVertical: 5,
    fontSize: 16,

    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
});

export default AddPecsModal;
