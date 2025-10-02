import PrimaryButton from "@/components/PrimaryButton";
import Sidebar from "@/components/Sidebar";
import COLORS from "@/constants/Colors";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import TextFieldWrapper from "@/components/TextfieldWrapper";
import { updateUserInfo, uploadProfilePic } from "@/services/userService";
import * as ImagePicker from "expo-image-picker";

import ActionLink from "@/components/ActionLink";
import MyDropdown from "@/components/ui/MyDropdown";
import {
  cleanupCompressedImage,
  compressImageToSize,
  validateImage,
} from "@/helper/imageCompressor";
import Constants from "expo-constants";

import { getUserInfo } from "@/services/userApi/Authentication";
import { User } from "@/types/user";
import Icon from "react-native-vector-icons/Octicons";

const ChildSettings = () => {
  const { userId } = useLocalSearchParams();

  // Consolidated form data state
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    profile_pic: "",
    region: null as string | null,
    region_name: null as string | null,
    province: null as string | null,
    province_name: null as string | null,
    municipality: null as string | null,
    municipality_name: null as string | null,
    barangay: null as string | null,
    barangay_name: null as string | null,
  });

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Dropdown data
  const [regions, setRegions] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [barangay, setBarangay] = useState([]);

  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [error, setError] = useState("");

  const pscgApi = Constants.expoConfig?.extra?.PSGC_API;

  const handleNavigation = (screen: string) => {
    router.push(screen as any);
  };

  // ✅ Fetch user info on mount
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setIsLoading(true);
        const userData = await getUserInfo(userId as string);

        if (!userData) {
          Alert.alert("Error", "Failed to load user information");
          router.back();
          return;
        }

        setUser(userData as User);

        // Initialize formData with user data
        setFormData({
          first_name: userData.first_name || "",
          last_name: userData.last_name || "",
          email: userData.email || "",
          profile_pic: userData.profile_pic || "",
          region: userData.region || null,
          region_name: userData.region_name || null,
          province: userData.province || null,
          province_name: userData.province_name || null,
          municipality: userData.municipality || null,
          municipality_name: userData.municipality_name || null,
          barangay: userData.barangay || null,
          barangay_name: userData.barangay_name || null,
        });
      } catch (error) {
        console.error("Error fetching user info:", error);
        Alert.alert("Error", "Failed to load user information");
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchUserInfo();
    }
  }, [userId]);

  // ✅ Update formData helper
  const updateFormField = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ✅ Handle info update
  const handleInfoUpdate = async () => {
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      Alert.alert("Validation Error", "First name and last name are required.");
      return;
    }

    setIsUpdating(true);

    try {
      const result = await updateUserInfo({
        user_id: userId as string,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        region: formData.region,
        region_name: formData.region_name,
        province: formData.province,
        province_name: formData.province_name,
        municipality: formData.municipality,
        municipality_name: formData.municipality_name,
        barangay: formData.barangay,
        barangay_name: formData.barangay_name,
      });

      if (result.success) {
        Alert.alert("Success", "Profile updated successfully!");
      } else {
        Alert.alert("Error", result.error || "Failed to update profile");
      }
    } catch (err) {
      console.error("Update error:", err);
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setIsUpdating(false);
    }
  };

  // Image picker handlers
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
            quality: 0.9,
            aspect: [1, 1],
          })
        : await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            quality: 0.9,
            aspect: [1, 1],
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
          });

      if (result.canceled) return;

      const uri = result.assets[0].uri;
      setError("");

      const validate = await validateImage(uri);
      if (!validate.isValid && validate.error?.includes("Invalid image type")) {
        Alert.alert("Invalid Image", validate.error);
        return;
      }

      const compression = await compressImageToSize(uri);
      if (!compression.success) {
        Alert.alert(
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

      const uploadedBase64 = await uploadProfilePic(compression.base64!);

      if (uploadedBase64) {
        updateFormField("profile_pic", uploadedBase64);
        Alert.alert("Success", "Profile picture updated!");
      } else {
        Alert.alert("Upload Failed", "Please try again.");
      }

      if (compression.compressedUri) {
        await cleanupCompressedImage(compression.compressedUri);
      }
    } catch (err) {
      console.error("Upload failed:", err);
      Alert.alert("Upload Failed", "Something went wrong.");
    }
  };

  // Fetch regions on mount
  useEffect(() => {
    fetch(`${pscgApi}/regions`)
      .then((res) => res.json())
      .then((data) => {
        const formatted = data
          .map((item: any) => ({ label: item.name, value: item.code }))
          .sort((a: any, b: any) => a.label.localeCompare(b.label));
        setRegions(formatted);
      })
      .catch((err) => console.error("Error fetching regions:", err));
  }, []);

  // Fetch provinces when region changes
  useEffect(() => {
    if (!formData.region) return;

    fetch(`${pscgApi}/regions/${formData.region}/provinces`)
      .then((res) => res.json())
      .then((data) => {
        const formatted = data
          .map((item: any) => ({ label: item.name, value: item.code }))
          .sort((a: any, b: any) => a.label.localeCompare(b.label));
        setProvinces(formatted);

        if (!isFirstLoad) {
          updateFormField("province", null);
          updateFormField("province_name", null);
          updateFormField("municipality", null);
          updateFormField("municipality_name", null);
          updateFormField("barangay", null);
          updateFormField("barangay_name", null);
        }
      })
      .catch((err) => console.error("Error fetching provinces:", err));
  }, [formData.region]);

  // Fetch cities when province changes
  useEffect(() => {
    if (!formData.province) return;

    fetch(`${pscgApi}/provinces/${formData.province}/cities-municipalities`)
      .then((res) => res.json())
      .then((data) => {
        const formatted = data
          .map((item: any) => ({ label: item.name, value: item.code }))
          .sort((a: any, b: any) => a.label.localeCompare(b.label));
        setCities(formatted);

        if (!isFirstLoad) {
          updateFormField("municipality", null);
          updateFormField("municipality_name", null);
          updateFormField("barangay", null);
          updateFormField("barangay_name", null);
        }
      })
      .catch((err) => console.error("Error fetching cities:", err));
  }, [formData.province]);

  // Fetch barangays when city changes
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
          .map((item: any) => ({ label: item.name, value: item.code }))
          .sort((a: any, b: any) => a.label.localeCompare(b.label));
        setBarangay(formatted);

        if (!isFirstLoad) {
          updateFormField("barangay", null);
          updateFormField("barangay_name", null);
        }

        setIsFirstLoad(false);
      })
      .catch((err) => console.error("Error fetching barangays:", err));
  }, [
    formData.municipality,
    formData.province_name,
    formData.municipality_name,
  ]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Sidebar userRole="teacher" onNavigate={handleNavigation} />
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Sidebar userRole="teacher" onNavigate={handleNavigation} />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.settingsContainer}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <ActionLink
              icon={<Icon name="arrow-left" size={24} color={COLORS.accent} />}
              text="Back"
              clickHandler={router.back}
              fontSize={16}
              isBold
            />
            <Text style={styles.header}>Child Settings</Text>
            <View />
          </View>

          {/* Profile Picture Section */}
          <View style={styles.profileCard}>
            <View style={styles.profileSettingsContainer}>
              <View style={styles.profileContainer}>
                <TouchableOpacity onPress={showImagePickerOptions}>
                  <View style={styles.profileImageContainer}>
                    <Image
                      source={
                        formData.profile_pic
                          ? { uri: formData.profile_pic }
                          : require("@/assets/images/creeper.png")
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
            <View style={styles.settingsSection}>
              <Text style={styles.sectionHeader}>Personal Information</Text>
              <View style={styles.card}>
                <View style={styles.nameRow}>
                  <TextFieldWrapper isFlex={true} label="First Name">
                    <TextInput
                      style={styles.textInput}
                      placeholder="Enter first name"
                      value={formData.first_name}
                      onChangeText={(val) => updateFormField("first_name", val)}
                    />
                  </TextFieldWrapper>

                  <TextFieldWrapper isFlex={true} label="Last Name">
                    <TextInput
                      style={styles.textInput}
                      placeholder="Enter last name"
                      value={formData.last_name}
                      onChangeText={(val) => updateFormField("last_name", val)}
                    />
                  </TextFieldWrapper>
                </View>

                <TextFieldWrapper label="Email Address">
                  <TextInput
                    style={[styles.textInput, styles.disabledText]}
                    placeholder="Email address"
                    value={formData.email}
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
                        updateFormField("region", value);
                        updateFormField("region_name", label);
                      }}
                      placeholder="Select Region"
                      value={formData.region as string}
                    />
                  </TextFieldWrapper>

                  <TextFieldWrapper isFlex={true} label="Province">
                    <MyDropdown
                      isDisabled={!formData.region}
                      dropdownItems={provinces}
                      onChange={(value, label) => {
                        updateFormField("province", value);
                        updateFormField("province_name", label);
                      }}
                      placeholder="Select Province"
                      value={formData.province as string}
                    />
                  </TextFieldWrapper>
                </View>

                <View style={styles.addressGrid}>
                  <TextFieldWrapper isFlex={true} label="City/Municipality">
                    <MyDropdown
                      isDisabled={!formData.province}
                      dropdownItems={cities}
                      onChange={(value, label) => {
                        updateFormField("municipality", value);
                        updateFormField("municipality_name", label);
                      }}
                      placeholder="Select City"
                      value={formData.municipality as string}
                    />
                  </TextFieldWrapper>

                  <TextFieldWrapper isFlex={true} label="Barangay">
                    <MyDropdown
                      isDisabled={!formData.municipality}
                      dropdownItems={barangay}
                      onChange={(value, label) => {
                        updateFormField("barangay", value);
                        updateFormField("barangay_name", label);
                      }}
                      placeholder="Select Barangay"
                      value={formData.barangay as string}
                    />
                  </TextFieldWrapper>
                </View>

                <View style={styles.buttonRow}>
                  <PrimaryButton
                    title={isUpdating ? "Saving..." : "Save Changes"}
                    clickHandler={handleInfoUpdate}
                    disabled={isUpdating}
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
  container: { flex: 1, flexDirection: "row", backgroundColor: "#f8f9fa" },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
  settingsContainer: { flex: 1, paddingVertical: 20, paddingHorizontal: 28 },
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  profileContainer: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    flex: 1,
  },
  profileImageContainer: { position: "relative", alignSelf: "center" },
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
  profileSublabel: { color: COLORS.gray, fontFamily: "Poppins", fontSize: 13 },
  buttonContainer: { minWidth: 120 },
  mainSettingsContainer: { gap: 20 },
  settingsSection: { gap: 12 },
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
  nameRow: { flexDirection: "row", gap: 12 },
  addressGrid: { flexDirection: "row", gap: 12 },
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
  disabledText: { backgroundColor: "#f5f5f5", color: COLORS.gray },
  buttonRow: { marginTop: 6, alignItems: "flex-end" },
});

export default ChildSettings;
