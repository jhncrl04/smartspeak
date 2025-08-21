import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";
import COLORS from "@/constants/Colors";
import * as ImagePicker from "expo-image-picker";
import { AnimatePresence, MotiView } from "moti";
import { useState } from "react";
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DatePicker from "react-native-date-picker";
import Icon from "react-native-vector-icons/Octicons";

type Props = {
  visible: boolean;
  onClose: () => void;
};

type formDataType = {
  fname: string;
  lname: string;
  dob: string;
  gender: string;
  email: string;
  password: string;
};

const PersonalDetailsScreen = ({ visible, onClose }: Props) => {
  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    dob: "",
    gender: "",
    email: "",
    password: "",
  });

  const [step, setStep] = useState(1);
  const [date, setDate] = useState(new Date());

  const [error, setError] = useState("");
  const [image, setImage] = useState("");
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const goToStep = (nextStep: number) => {
    setDirection(nextStep > step ? "right" : "left");
    setStep(nextStep);
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={() => {
        setStep(1);
        onClose();
      }}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              setStep(1);
              onClose();
            }}
          >
            <Icon name="x" size={22} color={COLORS.gray} />
          </TouchableOpacity>

          {/* Step Content */}
          <AnimatePresence exitBeforeEnter>
            {step === 1 && (
              <MotiView
                key="step1"
                from={{
                  opacity: 0,
                  translateX: direction === "right" ? 50 : -50,
                }}
                animate={{ opacity: 1, translateX: 0 }}
                exit={{
                  opacity: 0,
                  translateX: direction === "right" ? -50 : 50,
                }}
                style={styles.stepContainer}
              >
                <Text style={styles.title}>Account Setup</Text>
                <TextInput
                  placeholder="Email"
                  value={formData.email}
                  onChangeText={(text) =>
                    setFormData({ ...formData, email: text })
                  }
                  style={styles.input}
                />
                <TextInput
                  placeholder="Password"
                  secureTextEntry
                  value={formData.password}
                  onChangeText={(text) =>
                    setFormData({ ...formData, password: text })
                  }
                  style={styles.input}
                />
                <TextInput
                  placeholder="Confirm Password"
                  secureTextEntry
                  value={formData.password}
                  onChangeText={(text) =>
                    setFormData({ ...formData, password: text })
                  }
                  style={styles.input}
                />
              </MotiView>
            )}

            {step === 2 && (
              <MotiView
                key="step2"
                from={{
                  opacity: 0,
                  translateX: direction === "right" ? 50 : -50,
                }}
                animate={{ opacity: 1, translateX: 0 }}
                exit={{
                  opacity: 0,
                  translateX: direction === "right" ? -50 : 50,
                }}
                style={styles.stepContainer}
              >
                <Text style={styles.title}>Personal Details</Text>

                {/* First + Last name on same line */}
                <View style={styles.row}>
                  <TextInput
                    placeholder="First Name"
                    value={formData.fname}
                    onChangeText={(text) =>
                      setFormData({ ...formData, fname: text })
                    }
                    style={[styles.input, styles.halfInput]}
                  />
                  <TextInput
                    placeholder="Last Name"
                    value={formData.lname}
                    onChangeText={(text) =>
                      setFormData({ ...formData, lname: text })
                    }
                    style={[styles.input, styles.halfInput]}
                  />
                </View>

                {/* Date of Birth with Date Picker */}
                <DatePicker mode="date" date={date} onDateChange={setDate} />

                <TextInput
                  placeholder="Gender"
                  value={formData.gender}
                  onChangeText={(text) =>
                    setFormData({ ...formData, gender: text })
                  }
                  style={styles.input}
                />
              </MotiView>
            )}

            {step === 3 && (
              <MotiView
                key="step3"
                from={{
                  opacity: 0,
                  translateX: direction === "right" ? 50 : -50,
                }}
                animate={{ opacity: 1, translateX: 0 }}
                exit={{
                  opacity: 0,
                  translateX: direction === "right" ? -50 : 50,
                }}
                style={styles.stepContainer}
              >
                <Text style={styles.title}>Profile Picture</Text>
                <TouchableOpacity
                  style={styles.imageContainer}
                  onPress={pickImage}
                >
                  {image !== "" ? (
                    <Image
                      source={{ uri: image }}
                      style={styles.imagePreview}
                    />
                  ) : (
                    <Icon name="image" size={40} color={COLORS.gray} />
                  )}
                </TouchableOpacity>
                {error !== "" && <Text style={{ color: "red" }}>{error}</Text>}
              </MotiView>
            )}
          </AnimatePresence>

          {/* Step Indicator */}
          <View style={styles.stepIndicator}>
            <View style={[styles.dot, step === 1 && styles.activeDot]} />
            <View style={[styles.dot, step === 2 && styles.activeDot]} />
            <View style={[styles.dot, step === 3 && styles.activeDot]} />
          </View>

          {/* Buttons */}
          {step === 1 && (
            <PrimaryButton title="Next" clickHandler={() => goToStep(2)} />
          )}

          {step === 2 && (
            <View style={styles.buttonRow}>
              <View style={styles.buttonContainer}>
                <SecondaryButton
                  title="Back"
                  clickHandler={() => goToStep(1)}
                />
              </View>
              <View style={styles.buttonContainer}>
                <PrimaryButton title="Next" clickHandler={() => goToStep(3)} />
              </View>
            </View>
          )}

          {step === 3 && (
            <View style={styles.buttonRow}>
              <View style={styles.buttonContainer}>
                <SecondaryButton
                  title="Back"
                  clickHandler={() => goToStep(2)}
                />
              </View>
              <View style={styles.buttonContainer}>
                <PrimaryButton
                  title="Submit"
                  clickHandler={() => {
                    console.log("Form submitted ✅");
                    setStep(1);
                    onClose();
                  }}
                />
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default PersonalDetailsScreen;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.shadow,
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    width: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  closeButton: {
    alignSelf: "flex-end",
  },
  stepContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 15,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.shadow,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 12,
    overflow: "hidden",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
  },
  stepIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gray,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: COLORS.black,
    width: 16,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  buttonContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
});
