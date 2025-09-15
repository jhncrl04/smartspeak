import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";
import COLORS from "@/constants/Colors";
import imageToBase64 from "@/helper/imageToBase64";
import { registerChild } from "@/services/userApi/Registration";
import * as ImagePicker from "expo-image-picker";
import { AnimatePresence, MotiView } from "moti";
import { useState } from "react";
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

import firestore from "@react-native-firebase/firestore";

import TextFieldWrapper from "../TextfieldWrapper";

import { formatDate } from "@/helper/formatDate";
import getCurrentUid from "@/helper/getCurrentUid";
import DatePicker from "react-native-date-picker";
import LoadingScreen from "./LoadingScreen";
import MyDropdown from "./MyDropdown";

type Props = {
  visible: boolean;
  onClose: () => void;
};

type formDataType = {
  first_name: string;
  last_name: string;
  date_of_birth: Date | null;
  gender: string;
  email: string;
  password: string;
  role: string;
  profile_pic: string;
  guardian_id: string | undefined;
  creation_date: Date;
};

const AddChildModal = ({ visible, onClose }: Props) => {
  const [formData, setFormData] = useState<formDataType>({
    first_name: "Morty",
    last_name: "Smith",
    date_of_birth: null,
    gender: "Male",
    email: "info.coolbeanscoffee@gmail.com",
    password: "Johncarlo1",
    role: "",
    profile_pic: "",
    guardian_id: "",
    creation_date: new Date(),
  });

  const [confirmPass, setConfirmPass] = useState("Johncarlo1");

  const [step, setStep] = useState(1);
  const [date, setDate] = useState(new Date());

  const [error, setError] = useState("");
  const [image, setImage] = useState("");
  const [direction, setDirection] = useState<"left" | "right">("right");

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);

      const base64Image = await imageToBase64(image);
      setFormData({ ...formData, profile_pic: base64Image });
    }
  };

  const goToStep = (nextStep: number) => {
    if (nextStep === 2) {
      if (
        formData.email === "" ||
        formData.password === "" ||
        confirmPass === ""
      ) {
        Alert.alert("Missing credentials. Fill all the inputs.");
        return;
      }

      if (formData.password !== confirmPass) {
        Alert.alert("Password don't match. Please enter your password.");
        return;
      }
    }

    if (nextStep === 3) {
      if (
        formData.first_name === "" ||
        formData.last_name === "" ||
        formData.date_of_birth === null ||
        formData.gender === ""
      ) {
        Alert.alert("Missing inputs. Please fill all the inputs.");

        return;
      }
    }

    setDirection(nextStep > step ? "right" : "left");
    setStep(nextStep);
  };

  const [isLoading, setIsLoading] = useState(false);

  const submitRegistration = async (userData: formDataType) => {
    try {
      setIsLoading(true); // ⏳ start loader

      const user = { ...userData };
      user.role = "Learner";

      const currentId = getCurrentUid();
      user.guardian_id = currentId;

      if (user.date_of_birth) {
        user.date_of_birth = firestore.Timestamp.fromDate(
          user.date_of_birth
        ) as any;
      }
      user.creation_date = firestore.Timestamp.fromDate(new Date()) as any;

      const isRegistrationComplete = await registerChild(user);

      if (isRegistrationComplete) {
        console.log("Form submitted ✅");
        setStep(1);
        onClose();
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Something went wrong while registering child.");
    } finally {
      setIsLoading(false); // ✅ stop loader
    }
  };

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const genderChoices = [
    { label: "Male", value: "Male" },
    { label: "Female", value: "Female" },
    { label: "Others", value: "Others" },
  ];

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
      <LoadingScreen visible={isLoading} />
      <DatePicker
        // placeholder="Date of Birth"
        modal={true}
        date={formData.date_of_birth ? formData.date_of_birth : new Date()}
        mode="date"
        maximumDate={new Date()}
        open={isDatePickerOpen}
        onConfirm={(date) => {
          setIsDatePickerOpen(false);
          setDate(date);

          setFormData({ ...formData, date_of_birth: date });
        }}
        onCancel={() => {
          setIsDatePickerOpen(false);
        }}
        style={styles.input}
      />
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
                <TextFieldWrapper label="Email">
                  <TextInput
                    placeholder="Email"
                    keyboardType="email-address"
                    value={formData.email}
                    onChangeText={(text) =>
                      setFormData({ ...formData, email: text })
                    }
                    style={styles.input}
                  />
                </TextFieldWrapper>
                <TextFieldWrapper label="Password">
                  <TextInput
                    placeholder=""
                    secureTextEntry
                    value={formData.password}
                    onChangeText={(text) =>
                      setFormData({ ...formData, password: text })
                    }
                    style={styles.input}
                  />
                </TextFieldWrapper>
                <TextFieldWrapper label="Confirm Password">
                  <TextInput
                    placeholder="Confirm Password"
                    secureTextEntry
                    value={confirmPass}
                    onChangeText={(text) => setConfirmPass(text)}
                    style={styles.input}
                  />
                </TextFieldWrapper>
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
                  <TextFieldWrapper label="First Name" isFlex={true}>
                    <TextInput
                      placeholder=""
                      value={formData.first_name}
                      onChangeText={(text) =>
                        setFormData({ ...formData, first_name: text })
                      }
                      style={styles.input}
                    />
                  </TextFieldWrapper>

                  <TextFieldWrapper label="Last Name" isFlex={true}>
                    <TextInput
                      placeholder=""
                      value={formData.last_name}
                      onChangeText={(text) =>
                        setFormData({ ...formData, last_name: text })
                      }
                      style={styles.input}
                    />
                  </TextFieldWrapper>
                </View>

                <TextFieldWrapper label="Date of Birth">
                  <TouchableOpacity
                    onPress={() => setIsDatePickerOpen(true)}
                    activeOpacity={0.7}
                  >
                    <View pointerEvents="none">
                      <TextInput
                        style={styles.input}
                        value={
                          formData.date_of_birth
                            ? formatDate(formData.date_of_birth)
                            : ""
                        }
                        editable={false}
                      />
                    </View>
                  </TouchableOpacity>
                </TextFieldWrapper>

                <TextFieldWrapper label="Gender">
                  <MyDropdown
                    dropdownItems={genderChoices}
                    placeholder=""
                    value={formData.gender}
                    onChange={(val) => {
                      setFormData({ ...formData, gender: val });
                    }}
                  />
                </TextFieldWrapper>
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
                    submitRegistration(formData);
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

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.shadow,
  },
  modalContent: {
    backgroundColor: COLORS.pureWhite,
    paddingHorizontal: 20,
    paddingVertical: 15,

    borderRadius: 16,
    width: "70%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,

    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 1,
    // alignSelf: "flex-end",
  },
  stepContainer: {
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",

    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 6,
    padding: 8,
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

export default AddChildModal;
