import PrimaryButton from "@/components/PrimaryButton";
import Sidebar from "@/components/Sidebar";
import COLORS from "@/constants/Colors";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import TextFieldWrapper from "@/components/TextfieldWrapper";
import {
  updateCurrentUserInfo,
  updateUserPassword,
  uploadProfilePic,
} from "@/services/userService";
import { useAuthStore } from "@/stores/userAuthStore";
import * as ImagePicker from "expo-image-picker";

import MyDropdown from "@/components/ui/MyDropdown";
import { showToast } from "@/components/ui/MyToast";
import {
  cleanupCompressedImage,
  compressImageToSize,
  validateImage,
} from "@/helper/imageCompressor";
import imageToBase64 from "@/helper/imageToBase64";
import Constants from "expo-constants";

const { width: screenWidth } = Dimensions.get("window");

type userType = {
  email: string;
  fname: string;
  lname: string;
  phone_number: string;
};

const SettingScreen = () => {
  const handleNavigation = (screen: string) => {
    router.push(screen as any);
  };

  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  // image upload functionalities
  const [image, setImage] = useState(user?.profile);
  const [error, setError] = useState("");

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
            quality: 0.9,
            aspect: [1, 1],
          })
        : await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            quality: 0.9,
            aspect: [1, 1],
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
          });

      if (result.canceled) {
        return;
      }

      const uri = result.assets[0].uri;
      setError("");

      let uploadedBase64: any;

      // 1. Validate file type
      const validate = await validateImage(uri);
      if (!validate.isValid && validate.error?.includes("Invalid image type")) {
        showToast("error", "Invalid Image", validate.error);
        return;
      }

      // 2. Check if image size is too big
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

              // Log compression stats
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

              // Upload compressed image
              uploadedBase64 = await uploadProfilePic(compression.base64!);

              // Cleanup temporary file
              if (compression.compressedUri) {
                await cleanupCompressedImage(compression.compressedUri);
              }

              // Update UI after upload
              if (uploadedBase64) {
                setImage(uploadedBase64);
                updateUser({ profile: uploadedBase64 });
                showToast("success", "Success", "Profile picture updated!");
              } else {
                showToast("error", "Upload Failed", "Please try again.");
              }
            },
          },
          {
            text: "Select another image",
            style: "cancel",
          },
        ]);
      } else {
        // 3. Image size is fine, upload directly without compression
        const base64Image = await imageToBase64(uri);
        uploadedBase64 = await uploadProfilePic(base64Image);

        if (uploadedBase64) {
          setImage(uploadedBase64);
          updateUser({ profile: uploadedBase64 });
          showToast("success", "Success", "Profile picture updated!");
        } else {
          showToast("error", "Upload Failed", "Please try again.");
        }
      }
    } catch (err) {
      console.error("Upload failed:", err);
      showToast("error", "Upload Failed", "Something went wrong.");
    }
  };

  const handleInfoUpdate = async (
    fname: string,
    lname: string,
    phoneNumber: string,
    region: string | null,
    region_name: string | null,
    province: string | null,
    province_name: string | null,
    municipality: string | null,
    municipality_name: string | null,
    barangay: string | null,
    barangay_name: string | null
  ) => {
    try {
      await updateCurrentUserInfo(
        fname,
        lname,
        phoneNumber,
        region,
        province,
        municipality,
        barangay,
        region_name,
        province_name,
        municipality_name,
        barangay_name
      );

      updateUser({
        fname,
        lname,
        phoneNumber,
        email,
        region,
        province,
        municipality,
        barangay,
        region_name,
        province_name,
        municipality_name,
        barangay_name,
      });

      showToast("success", "Success", "Profile updated!");
    } catch (err) {
      console.error("Error updating user info: ", err);
    }
  };

  const handleChangePassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    if (
      newPassword.trim() === "" ||
      confirmPassword.trim() === "" ||
      currentPassword.trim() === ""
    ) {
      showToast("error", "Error", "Fill all the required field");
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("error", "Error", "New Password don't match");
      return;
    }

    const result = await updateUserPassword(currentPassword, newPassword);
    if (result.success) {
      showToast("success", "Success", result.message);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      showToast("error", "Updating password failed\n", result.message);
    }
  };

  const [fname, setFname] = useState(user?.fname || "");
  const [lname, setLname] = useState(user?.lname || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [email, setEmail] = useState(user?.email || "");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [selectedRegion, setSelectedRegion] = useState<string | null>(
    user?.region || null
  );
  const [selectedProvince, setSelectedProvince] = useState<string | null>(
    user?.province || null
  );
  const [selectedCity, setSelectedCity] = useState<string | null>(
    user?.municipality || null
  );
  const [selectedBarangay, setSelectedBarangay] = useState<string | null>(
    user?.barangay || null
  );

  const [regions, setRegions] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [barangay, setBarangay] = useState([]);

  const [selectedRegionLabel, setSelectedRegionLabel] = useState<string | null>(
    user?.region_name as string
  );
  const [selectedProvinceLabel, setSelectedProvinceLabel] = useState<
    string | null
  >(user?.province_name as string);
  const [selectedCityLabel, setSelectedCityLabel] = useState<string | null>(
    user?.municipality_name as string
  );
  const [selectedBarangayLabel, setSelectedBarangayLabel] = useState<
    string | null
  >(user?.barangay_name as string);

  const pscgApi = Constants.expoConfig?.extra?.PSGC_API;

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
    if (!selectedRegion) return;

    fetch(`${pscgApi}/regions/${selectedRegion}/provinces`)
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
  }, [selectedRegion]);

  // Cities
  useEffect(() => {
    if (!selectedProvince) return;

    fetch(`${pscgApi}/provinces/${selectedProvince}/cities-municipalities`)
      .then((res) => res.json())
      .then((data) => {
        const formatted = data
          .map((item: any) => ({
            label: item.name,
            value: item.code,
          }))
          .sort((a: any, b: any) => a.label.localeCompare(b.label));
        setCities(formatted);

        if (!isFirstLoad) {
          setSelectedCity(null);
          setSelectedBarangay(null);
        }
      })
      .catch((err) => console.error("Error fetching cities:", err));
  }, [selectedProvince]);

  console.log(
    `${pscgApi}/provinces/${selectedProvinceLabel}/cities-municipalities/${selectedCityLabel}/barangays/`
  );

  // Barangays
  useEffect(() => {
    if (!selectedCity || !selectedProvinceLabel || !selectedCityLabel) return;

    fetch(
      `${pscgApi}/provinces/${selectedProvinceLabel}/cities-municipalities/${selectedCityLabel}/barangays/`
    )
      .then((res) => res.json())
      .then((data) => {
        const formatted = data
          .map((item: any) => ({
            label: item.name,
            value: item.code,
          }))
          .sort((a: any, b: any) => a.label.localeCompare(b.label));
        setBarangay(formatted);

        if (!isFirstLoad) {
          setSelectedBarangay(null);
        }
      })
      .catch((err) => console.error("Error fetching barangays:", err));
  }, [selectedCity, selectedProvinceLabel, selectedCityLabel]);

  return (
    <View style={styles.container}>
      <Sidebar userRole="teacher" onNavigate={handleNavigation} />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.settingsContainer}>
          <Text style={styles.header}>Account Settings</Text>

          {/* Profile Picture Section */}
          <View style={styles.profileCard}>
            <View style={styles.profileSettingsContainer}>
              <View style={styles.profileContainer}>
                <TouchableOpacity onPress={showImagePickerOptions}>
                  <View style={styles.profileImageContainer}>
                    <Image
                      source={
                        image
                          ? { uri: image }
                          : require("../../assets/images/creeper.png")
                      }
                      style={styles.profile}
                    />
                    <View style={styles.profileOverlay}>
                      <Text style={styles.overlayText}>Change</Text>
                    </View>
                  </View>
                </TouchableOpacity>
                <View>
                  <Text style={styles.profileLabel}>Profile Picture</Text>
                  <Text style={styles.profileSublabel}>PNG or JPEG format</Text>
                </View>
              </View>
              <View style={styles.buttonContainer}>
                <PrimaryButton
                  title="Upload Photo"
                  clickHandler={showImagePickerOptions}
                />
              </View>
            </View>
          </View>

          {/* Main Settings Content */}
          <View style={styles.mainSettingsContainer}>
            {/* Personal Information Section */}
            <View style={styles.settingsSection}>
              <Text style={styles.sectionHeader}>Personal Information</Text>
              <View style={styles.card}>
                <View style={styles.nameRow}>
                  <TextFieldWrapper isFlex={true} label="First Name">
                    <TextInput
                      style={styles.textInput}
                      placeholder="Enter first name"
                      value={fname}
                      onChangeText={setFname}
                    />
                  </TextFieldWrapper>

                  <TextFieldWrapper isFlex={true} label="Last Name">
                    <TextInput
                      style={styles.textInput}
                      placeholder="Enter last name"
                      value={lname}
                      onChangeText={setLname}
                    />
                  </TextFieldWrapper>
                </View>

                <TextFieldWrapper label="Phone Number">
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter phone number"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                  />
                </TextFieldWrapper>

                <TextFieldWrapper label="Email Address">
                  <TextInput
                    style={[styles.textInput, styles.disabledText]}
                    placeholder="Email address"
                    value={email}
                    onChangeText={setEmail}
                    editable={false}
                  />
                </TextFieldWrapper>

                {/* Address Section */}
                <Text style={styles.subsectionHeader}>Address Information</Text>
                <View style={styles.addressGrid}>
                  <TextFieldWrapper isFlex={true} label="Region">
                    <MyDropdown
                      dropdownItems={regions}
                      onChange={(value, label) => {
                        setSelectedRegion(value);
                        setSelectedRegionLabel(label as string);

                        setSelectedProvince(null);
                        setSelectedProvinceLabel(null);
                        setSelectedCity(null);
                        setSelectedCityLabel(null);
                        setSelectedBarangay(null);
                        setSelectedBarangayLabel(null);
                      }}
                      placeholder="Select Region"
                      value={selectedRegion as string}
                    />
                  </TextFieldWrapper>

                  <TextFieldWrapper isFlex={true} label="Province">
                    <MyDropdown
                      isDisabled={!selectedRegion}
                      dropdownItems={provinces}
                      onChange={(value, label) => {
                        setSelectedProvince(value);
                        setSelectedProvinceLabel(label as string);

                        setSelectedCity(null);
                        setSelectedCityLabel(null);
                        setSelectedBarangay(null);
                        setSelectedBarangayLabel(null);
                      }}
                      placeholder="Select Province"
                      value={selectedProvince as string}
                    />
                  </TextFieldWrapper>
                </View>

                <View style={styles.addressGrid}>
                  <TextFieldWrapper isFlex={true} label="City/Municipality">
                    <MyDropdown
                      isDisabled={!selectedProvince}
                      dropdownItems={cities}
                      onChange={(value, label) => {
                        setSelectedCity(value);
                        setSelectedCityLabel(label as string);

                        setSelectedBarangay(null);
                        setSelectedBarangayLabel(null);
                      }}
                      placeholder="Select City"
                      value={selectedCity as string}
                    />
                  </TextFieldWrapper>

                  <TextFieldWrapper isFlex={true} label="Barangay">
                    <MyDropdown
                      isDisabled={!selectedCity}
                      dropdownItems={barangay}
                      onChange={(value, label) => {
                        setSelectedBarangay(value);
                        setSelectedBarangayLabel(label as string);
                      }}
                      placeholder="Select Barangay"
                      value={selectedBarangay as string}
                    />
                  </TextFieldWrapper>
                </View>

                <View style={styles.buttonRow}>
                  <PrimaryButton
                    title="Save Changes"
                    clickHandler={() => {
                      handleInfoUpdate(
                        fname,
                        lname,
                        phoneNumber,
                        selectedRegion,
                        selectedRegionLabel,
                        selectedProvince,
                        selectedProvinceLabel,
                        selectedCity,
                        selectedCityLabel,
                        selectedBarangay,
                        selectedBarangayLabel
                      );
                    }}
                  />
                </View>
              </View>
            </View>

            {/* Password Section */}
            <View style={styles.settingsSection}>
              <Text style={styles.sectionHeader}>Security</Text>
              <View style={styles.card}>
                <TextFieldWrapper label="Current Password">
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    secureTextEntry={true}
                  />
                </TextFieldWrapper>

                <TextFieldWrapper label="New Password">
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter new password"
                    value={newPassword}
                    autoComplete="password-new"
                    textContentType="none"
                    onChangeText={setNewPassword}
                    secureTextEntry={true}
                  />
                </TextFieldWrapper>

                <TextFieldWrapper label="Confirm New Password">
                  <TextInput
                    style={styles.textInput}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    autoComplete="password-new"
                    textContentType="none"
                    onChangeText={setConfirmPassword}
                    secureTextEntry={true}
                  />
                </TextFieldWrapper>

                <View style={styles.buttonRow}>
                  <PrimaryButton
                    title="Update Password"
                    clickHandler={() => {
                      handleChangePassword(currentPassword, newPassword);
                    }}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row", // Always landscape layout
    backgroundColor: "#f8f9fa",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  settingsContainer: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 28,
  },
  header: {
    fontSize: 26,
    fontFamily: "Poppins",
    fontWeight: "600",
    color: COLORS.black,
    textAlign: "center",
    marginBottom: 16,
  },
  profileCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  profileSettingsContainer: {
    flexDirection: "row", // Always horizontal in landscape
    justifyContent: "space-between",
    alignItems: "center",
  },
  profileContainer: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    flex: 1,
  },
  profileImageContainer: {
    position: "relative",
    alignSelf: "center",
  },
  profile: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
  },
  profileOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    paddingVertical: 2,
    alignItems: "center",
  },
  overlayText: {
    color: "white",
    fontSize: 9,
    fontFamily: "Poppins",
    fontWeight: "500",
  },
  profileLabel: {
    color: COLORS.black,
    fontSize: 16,
    fontFamily: "Poppins",
    fontWeight: "600",
    marginBottom: 2,
  },
  profileSublabel: {
    color: COLORS.gray,
    fontFamily: "Poppins",
    fontSize: 13,
  },
  buttonContainer: {
    minWidth: 120,
  },
  mainSettingsContainer: {
    gap: 20,
  },
  settingsSection: {
    gap: 12,
  },
  sectionHeader: {
    fontSize: 18,
    fontFamily: "Poppins",
    fontWeight: "600",
    color: COLORS.black,
  },
  subsectionHeader: {
    fontSize: 14,
    fontFamily: "Poppins",
    fontWeight: "500",
    color: COLORS.black,
    marginTop: 16,
    marginBottom: 6,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    gap: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  nameRow: {
    flexDirection: "row", // Always row in landscape
    gap: 12,
  },
  addressGrid: {
    flexDirection: "row", // Always row in landscape
    gap: 12,
  },
  textInput: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderColor: COLORS.lightGray,
    borderWidth: 1,
    borderRadius: 6,
    fontSize: 14,
    fontFamily: "Poppins",
    backgroundColor: "white",
    minHeight: 44,
  },
  disabledText: {
    backgroundColor: "#f5f5f5",
    color: COLORS.gray,
  },
  buttonRow: {
    marginTop: 6,
    alignItems: "flex-end", // Always align right in landscape
  },
});

export default SettingScreen;
