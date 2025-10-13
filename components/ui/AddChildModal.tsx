import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";
import COLORS from "@/constants/Colors";
import imageToBase64 from "@/helper/imageToBase64";
import { registerChild } from "@/services/userApi/Registration";
import * as ImagePicker from "expo-image-picker";
import { AnimatePresence, MotiView } from "moti";
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

import firestore from "@react-native-firebase/firestore";

import TextFieldWrapper from "../TextfieldWrapper";

import { formatDate } from "@/helper/formatDate";
import getCurrentUid from "@/helper/getCurrentUid";
import DatePicker from "react-native-date-picker";
import LoadingScreen from "./LoadingScreen";
import MyDropdown from "./MyDropdown";

import Constants from "expo-constants";

const pscgApi = Constants.expoConfig?.extra?.PSGC_API;

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
  region: string;
  region_name: string;
  province: string;
  province_name: string;
  municipality: string;
  municipality_name: string;
  barangay: string;
  barangay_name: string;
};

const initialFormData: formDataType = {
  first_name: "",
  last_name: "",
  date_of_birth: null,
  gender: "",
  email: "",
  password: "",
  role: "",
  profile_pic: "",
  guardian_id: "",
  creation_date: new Date(),
  region: "",
  region_name: "",
  province: "",
  province_name: "",
  municipality: "",
  municipality_name: "",
  barangay: "",
  barangay_name: "",
};

const AddChildModal = ({ visible, onClose }: Props) => {
  const [formData, setFormData] = useState<formDataType>(initialFormData);

  const [confirmPass, setConfirmPass] = useState("");

  const [step, setStep] = useState(1);
  const [date, setDate] = useState(new Date());

  const [error, setError] = useState("");
  const [image, setImage] = useState("");
  const [direction, setDirection] = useState<"left" | "right">("right");

  // Address dropdown data (you'll need to populate these with actual data)
  const [regions, setRegions] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [barangays, setBarangays] = useState([]);

  const [selectedRegionLabel, setSelectedRegionLabel] = useState<string | null>(
    null
  );
  const [selectedProvinceLabel, setSelectedProvinceLabel] = useState<
    string | null
  >(null);
  const [selectedCityLabel, setSelectedCityLabel] = useState<string | null>(
    null
  );
  const [selectedBarangayLabel, setSelectedBarangayLabel] = useState<
    string | null
  >(null);

  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedBarangay, setSelectedBarangay] = useState<string | null>(null);

  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // Fetch regions on mount
  useEffect(() => {
    fetch(`${pscgApi}/regions`)
      .then((res) => res.json())
      .then((data) => {
        const formatted = data
          .map((item: any) => ({
            label: item.name,
            value: item.code,
          }))
          .sort((a: any, b: any) => a.label.localeCompare(b.label));
        setRegions(formatted);
        setIsFirstLoad(false); // after first fetch
      })
      .catch((err) => console.error("Error fetching regions:", err));
  }, []);

  // Provinces
  useEffect(() => {
    if (!formData.region) return;

    fetch(`${pscgApi}/regions/${formData.region}/provinces`)
      .then((res) => res.json())
      .then((data) => {
        const formatted = data
          .map((item: any) => ({
            label: item.name,
            value: item.code,
          }))
          .sort((a: any, b: any) => a.label.localeCompare(b.label));
        setProvinces(formatted);

        if (!isFirstLoad) {
          setSelectedProvince(null);
          setSelectedCity(null);
          setSelectedBarangay(null);
        }
      })
      .catch((err) => console.error("Error fetching provinces:", err));
  }, [formData.region]);

  // Cities
  useEffect(() => {
    if (!formData.province) return;

    fetch(`${pscgApi}/provinces/${formData.province}/cities-municipalities`)
      .then((res) => res.json())
      .then((data) => {
        const formatted = data
          .map((item: any) => ({
            label: item.name,
            value: item.code,
          }))
          .sort((a: any, b: any) => a.label.localeCompare(b.label));
        setMunicipalities(formatted);

        if (!isFirstLoad) {
          setSelectedCity(null);
          setSelectedBarangay(null);
        }

        console.log(formData);
      })
      .catch((err) => console.error("Error fetching cities:", err));
  }, [formData.province]);

  // Barangays
  useEffect(() => {
    if (
      !formData.municipality ||
      !formData.province_name ||
      !formData.municipality_name
    )
      return;

    fetch(
      `${pscgApi}/provinces/${formData.province_name}/cities-municipalities/${formData.municipality_name}/barangays/`
    )
      .then((res) => res.json())
      .then((data) => {
        const formatted = data
          .map((item: any) => ({
            label: item.name,
            value: item.code,
          }))
          .sort((a: any, b: any) => a.label.localeCompare(b.label));
        setBarangays(formatted);

        if (!isFirstLoad) {
          setSelectedBarangay(null);
        }

        console.log(formData);
      })
      .catch((err) => console.error("Error fetching barangays:", err));
  }, [
    formData.municipality,
    formData.province_name,
    formData.municipality_name,
  ]);

  const resetForm = () => {
    setFormData(initialFormData);
    setConfirmPass("");
    setImage("");
    setError("");
    setStep(1);
    setDirection("right");
  };

  const handleClose = () => {
    resetForm();
    onClose();
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
          quality: 1,
        })
      : await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          quality: 1,
        });

    if (!result.canceled) {
      setImage(result.assets[0].uri);

      const base64Image = await imageToBase64(result.assets[0].uri);
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
        Alert.alert("Missing credentials", "Fill all the inputs.");
        return;
      }

      if (formData.password !== confirmPass) {
        Alert.alert("Password mismatch", "Passwords don't match.");
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
        Alert.alert("Missing inputs", "Please fill all the inputs.");
        return;
      }
    }

    if (nextStep === 4) {
      if (
        formData.region === "" ||
        formData.province === "" ||
        formData.municipality === "" ||
        formData.barangay === ""
      ) {
        Alert.alert("Missing address", "Please fill all address fields.");
        return;
      }
    }

    setDirection(nextStep > step ? "right" : "left");
    setStep(nextStep);
  };

  const [isLoading, setIsLoading] = useState(false);

  const submitRegistration = async (userData: formDataType) => {
    try {
      setIsLoading(true);

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
        handleClose();
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Something went wrong while registering child.");
    } finally {
      setIsLoading(false);
    }
  };

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const genderChoices = [
    { label: "Male", value: "Male" },
    { label: "Female", value: "Female" },
    { label: "Others", value: "Others" },
  ];

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        transparent
        onRequestClose={handleClose}
      >
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={handleClose}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>

          <View style={styles.modalContainer}>
            {/* Close Button */}
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Icon name="x" size={22} color={COLORS.gray} />
            </TouchableOpacity>

            {/* Title */}
            <Text style={styles.modalTitle}>Add Child</Text>

            {/* Step Content with ScrollView */}
            <ScrollView
              style={styles.mainContainer}
              showsVerticalScrollIndicator={false}
            >
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
                        placeholder="Enter email"
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
                        placeholder="Enter password"
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
                        placeholder="Re-enter password"
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

                    <View style={styles.row}>
                      <TextFieldWrapper label="First Name" isFlex={true}>
                        <TextInput
                          placeholder="First name"
                          value={formData.first_name}
                          onChangeText={(text) =>
                            setFormData({ ...formData, first_name: text })
                          }
                          style={styles.input}
                        />
                      </TextFieldWrapper>

                      <TextFieldWrapper label="Last Name" isFlex={true}>
                        <TextInput
                          placeholder="Last name"
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
                            placeholder="Select date"
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
                        placeholder="Select gender"
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
                    <Text style={styles.title}>Address Information</Text>

                    <TextFieldWrapper label="Region">
                      <MyDropdown
                        dropdownItems={regions}
                        placeholder="Select region"
                        value={formData.region}
                        onChange={(val, label) => {
                          setFormData({
                            ...formData,
                            region: val,
                            region_name: label as string,
                            province: "",
                            municipality: "",
                            barangay: "",
                          });
                          // Load provinces based on selected region
                        }}
                      />
                    </TextFieldWrapper>

                    <TextFieldWrapper label="Province">
                      <MyDropdown
                        dropdownItems={provinces}
                        placeholder="Select province"
                        value={formData.province}
                        onChange={(val, label) => {
                          setFormData({
                            ...formData,
                            province: val,
                            province_name: label as string,
                            municipality: "",
                            barangay: "",
                          });
                          // Load municipalities based on selected province
                        }}
                      />
                    </TextFieldWrapper>

                    <TextFieldWrapper label="Municipality">
                      <MyDropdown
                        dropdownItems={municipalities}
                        placeholder="Select municipality"
                        value={formData.municipality}
                        onChange={(val, label) => {
                          setFormData({
                            ...formData,
                            municipality: val,
                            municipality_name: label as string,
                            barangay: "",
                          });
                          // Load barangays based on selected municipality
                        }}
                      />
                    </TextFieldWrapper>

                    <TextFieldWrapper label="Barangay">
                      <MyDropdown
                        dropdownItems={barangays}
                        placeholder="Select barangay"
                        value={formData.barangay}
                        onChange={(val, label) => {
                          setFormData({
                            ...formData,
                            barangay: val,
                            barangay_name: label as string,
                          });
                        }}
                      />
                    </TextFieldWrapper>
                  </MotiView>
                )}

                {step === 4 && (
                  <MotiView
                    key="step4"
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
                      onPress={showImagePickerOptions}
                    >
                      {image !== "" ? (
                        <Image
                          source={{ uri: image }}
                          style={styles.imagePreview}
                        />
                      ) : (
                        <Icon name="image" size={50} color={COLORS.gray} />
                      )}
                    </TouchableOpacity>
                    <Text style={styles.imageHint}>
                      Tap to select profile picture
                    </Text>
                    {error !== "" && (
                      <Text style={styles.errorText}>{error}</Text>
                    )}
                  </MotiView>
                )}
              </AnimatePresence>
            </ScrollView>

            {/* Step Indicator */}
            <View style={styles.stepIndicator}>
              <View style={[styles.dot, step === 1 && styles.activeDot]} />
              <View style={[styles.dot, step === 2 && styles.activeDot]} />
              <View style={[styles.dot, step === 3 && styles.activeDot]} />
              <View style={[styles.dot, step === 4 && styles.activeDot]} />
            </View>

            {/* Buttons */}
            <View style={styles.buttonWrapper}>
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
                    <PrimaryButton
                      title="Next"
                      clickHandler={() => goToStep(3)}
                    />
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
                      title="Next"
                      clickHandler={() => goToStep(4)}
                    />
                  </View>
                </View>
              )}

              {step === 4 && (
                <View style={styles.buttonRow}>
                  <View style={styles.buttonContainer}>
                    <SecondaryButton
                      title="Back"
                      clickHandler={() => goToStep(3)}
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
        </View>
      </Modal>

      <DatePicker
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
      />

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
    paddingVertical: 15,
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
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 5,
    color: COLORS.black,
  },
  mainContainer: {
    flex: 1,
  },
  stepContainer: {
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 0,
    color: COLORS.black,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 16,
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
    marginBottom: 8,
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageHint: {
    textAlign: "center",
    color: COLORS.gray,
    fontSize: 14,
    marginBottom: 12,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 8,
    fontSize: 14,
  },
  stepIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 15,
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
  buttonWrapper: {
    marginTop: 10,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  buttonContainer: {
    flex: 1,
  },
});

export default AddChildModal;
