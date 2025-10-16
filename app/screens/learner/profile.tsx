import { ThemedView } from "@/components/ThemedView";
import { useAuthStore } from "@/stores/userAuthStore";
import axios from "axios";
import * as FileSystem from "expo-file-system";
import { useFonts } from "expo-font";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  GestureHandlerRootView,
  TextInput,
} from "react-native-gesture-handler";
import { RFValue } from "react-native-responsive-fontsize";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";

// React Native Firebase SDK imports
import firestore from "@react-native-firebase/firestore";

interface ProfileFormData {
  fname: string;
  mname: string;
  lname: string;
  dob: string;
  gender: string;
  pname: string;
  phoneNumber: string;
  studId: string;
  email: string;
  region_name: string;
  province_name: string;
  municipality_name: string;
  barangay_name: string;
}

const user = useAuthStore.getState().user?.handledChildren;

console.log("xyz", user);

// Gender options for dropdown
const GENDER_OPTIONS = [
  { id: 1, label: "Male", value: "Male" },
  { id: 2, label: "Female", value: "Female" },
  { id: 3, label: "Other", value: "Other" },
  { id: 4, label: "Prefer not to say", value: "Prefer not to say" },
];

// PSGC API Base URL
const PSGC_API_BASE = "https://psgc.gitlab.io/api";

// Interface for PSGC data
interface PsgcItem {
  code: string;
  name: string;
  regionCode?: string;
  provinceCode?: string;
  cityCode?: string;
}

// Fetch regions
const fetchRegions = async (): Promise<PsgcItem[]> => {
  try {
    const response = await axios.get(`${PSGC_API_BASE}/regions`);
    return response.data.map((region: any) => ({
      code: region.code,
      name: region.name,
    }));
  } catch (error) {
    console.error("Error fetching regions:", error);
    return [];
  }
};

// Fetch provinces by region code
const fetchProvincesByRegion = async (
  regionCode: string
): Promise<PsgcItem[]> => {
  try {
    const response = await axios.get(
      `${PSGC_API_BASE}/regions/${regionCode}/provinces`
    );
    return response.data.map((province: any) => ({
      code: province.code,
      name: province.name,
      regionCode: province.regionCode,
    }));
  } catch (error) {
    console.error("Error fetching provinces:", error);
    return [];
  }
};

// Fetch municipalities by province code
const fetchMunicipalitiesByProvince = async (
  provinceCode: string
): Promise<PsgcItem[]> => {
  try {
    const response = await axios.get(
      `${PSGC_API_BASE}/provinces/${provinceCode}/municipalities`
    );
    return response.data.map((municipality: any) => ({
      code: municipality.code,
      name: municipality.name,
      provinceCode: municipality.provinceCode,
    }));
  } catch (error) {
    console.error("Error fetching municipalities:", error);
    return [];
  }
};

// Fetch barangays by municipality code
const fetchBarangaysByMunicipality = async (
  municipalityCode: string
): Promise<PsgcItem[]> => {
  try {
    const response = await axios.get(
      `${PSGC_API_BASE}/municipalities/${municipalityCode}/barangays`
    );
    return response.data.map((barangay: any) => ({
      code: barangay.code,
      name: barangay.name,
      municipalityCode: barangay.municipalityCode,
    }));
  } catch (error) {
    console.error("Error fetching barangays:", error);
    return [];
  }
};

// Function to create a log entry in the database
const createLog = async (
  userId: string,
  userName: string,
  action: string,
  beforeData: any,
  afterData: any
) => {
  try {
    console.log("Attempting to create log with data:", {
      userId,
      userName,
      action,
      beforeData,
      afterData,
    });

    const logData = {
      action: action,
      after: afterData,
      before: beforeData,
      created_for: "System",
      image: "",
      item_category: "",
      item_id: userId,
      item_name: userName,
      item_type: "Profile",
      timestamp: firestore.FieldValue.serverTimestamp(),
      user_id: userId,
      user_name: userName,
      user_type: "Learner",
    };

    console.log("Log data to be saved:", logData);

    const docRef = await firestore().collection("learnerAcctLogs").add(logData);
    console.log("Log created successfully with ID:", docRef.id);

    return docRef.id;
  } catch (error) {
    console.error("Error creating log:", error);
    console.error("Error details:", error.message);
    throw error;
  }
};

export default function ProfileScreen() {
  const [fontsLoaded] = useFonts({
    Poppins: require("@/assets/fonts/Poppins-Regular.ttf"),
  });

  const { width } = Dimensions.get("window");
  const isTablet = width > 968;
  const user = useAuthStore((state) => state.user);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [sectionName, setSectionName] = useState<string>("No Section");

  // Dropdown states
  const [showGenderDropdown, setShowGenderDropdown] = useState<boolean>(false);

  const [showRegionDropdown, setShowRegionDropdown] = useState<boolean>(false);
  const [showProvinceDropdown, setShowProvinceDropdown] =
    useState<boolean>(false);
  const [showMunicipalityDropdown, setShowMunicipalityDropdown] =
    useState<boolean>(false);
  const [showBarangayDropdown, setShowBarangayDropdown] =
    useState<boolean>(false);

  // Date picker states
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dobTimestamp, setDobTimestamp] = useState<any>(null);

  // PSGC Address data states
  const [regions, setRegions] = useState<PsgcItem[]>([]);
  const [provinces, setProvinces] = useState<PsgcItem[]>([]);
  const [municipalities, setMunicipalities] = useState<PsgcItem[]>([]);
  const [barangays, setBarangays] = useState<PsgcItem[]>([]);
  const [selectedRegionCode, setSelectedRegionCode] = useState<string>("");
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<string>("");
  const [selectedMunicipalityCode, setSelectedMunicipalityCode] =
    useState<string>("");
  const [addressLoading, setAddressLoading] = useState<boolean>(false);

  // Page state - REMOVED: scroll related states
  const [currentPage, setCurrentPage] = useState<number>(0);

  // Initialize with proper typing
  const initialFormData: ProfileFormData = {
    fname: "",
    mname: "",
    lname: "",
    dob: "",
    gender: "",
    pname: "",
    phoneNumber: "",
    studId: "",
    email: "",
    region_name: "",
    province_name: "",
    municipality_name: "",
    barangay_name: "",
  };

  const [formData, setFormData] = useState<ProfileFormData>(initialFormData);
  const [originalData, setOriginalData] =
    useState<ProfileFormData>(initialFormData);

  // Notification states
  const [notification, setNotification] = useState<{
    visible: boolean;
    message: string;
    type: "error" | "success";
  }>({
    visible: false,
    message: "",
    type: "error",
  });

  const [slideAnim] = useState(new Animated.Value(-100));

 // Function to fetch learner's section from nested path
const fetchLearnerSection = async (userId: string) => {
  try {
    console.log("Fetching sections for learner:", userId);

    const schoolYearsSnapshot = await firestore()
      .collection("schoolYears")
      .get();

    let learnerSection = "No Section";

    for (const schoolYearDoc of schoolYearsSnapshot.docs) {
      const gradeLevelsSnapshot = await schoolYearDoc.ref
        .collection("gradeLevels")
        .get();

      for (const gradeLevelDoc of gradeLevelsSnapshot.docs) {
        const sectionsSnapshot = await gradeLevelDoc.ref
          .collection("sections")
          .get();

        for (const sectionDoc of sectionsSnapshot.docs) {
          const sectionData = sectionDoc.data();
          const students = sectionData.students || [];

          console.log(`Checking section ${sectionDoc.id}:`, {
            name: sectionData.name,
            students: students,
          });

          if (students.includes(userId)) {
            learnerSection = sectionData.name || "Unnamed Section";
            console.log("Found section for learner:", learnerSection);
            break;
          }
        }

        // Break outer loops if section found
        if (learnerSection !== "No Section") {
          break;
        }
      }

      if (learnerSection !== "No Section") {
        break;
      }
    }

    setSectionName(learnerSection);
    console.log("Final section name:", learnerSection);
  } catch (error) {
    console.error("Error fetching learner section:", error);
    setSectionName("No Section");
  }
};

  // Function to fetch address data from PSGC API
  const fetchAddressData = async () => {
    try {
      setAddressLoading(true);
      console.log("Starting to fetch address data from PSGC API...");

      // Fetch regions
      const regionsData = await fetchRegions();
      console.log("Fetched regions:", regionsData.length);
      setRegions(regionsData);

      // If user already has region selected, fetch provinces for that region
      if (formData.region_name) {
        const region = regionsData.find(
          (r) => r.name.toLowerCase() === formData.region_name.toLowerCase()
        );
        if (region) {
          setSelectedRegionCode(region.code);
          const provincesData = await fetchProvincesByRegion(region.code);
          setProvinces(provincesData);

          // Continue cascading for existing data...
          if (formData.province_name) {
            const province = provincesData.find(
              (p) =>
                p.name.toLowerCase() === formData.province_name.toLowerCase()
            );
            if (province) {
              setSelectedProvinceCode(province.code);
              const municipalitiesData = await fetchMunicipalitiesByProvince(
                province.code
              );
              setMunicipalities(municipalitiesData);

              // Continue for municipality
              if (formData.municipality_name) {
                const municipality = municipalitiesData.find(
                  (m) =>
                    m.name.toLowerCase() ===
                    formData.municipality_name.toLowerCase()
                );
                if (municipality) {
                  setSelectedMunicipalityCode(municipality.code);
                  const barangaysData = await fetchBarangaysByMunicipality(
                    municipality.code
                  );
                  setBarangays(barangaysData);
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error fetching address data:", error);
      showNotification("Error loading address data", "error");
    } finally {
      setAddressLoading(false);
    }
  };

  // Show notification function
  const showNotification = (
    message: string,
    type: "error" | "success" = "error"
  ) => {
    setNotification({ visible: true, message, type });

    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setNotification({ visible: false, message: "", type: "error" });
      });
    }, 3000);
  };

  // Handle gender selection
  const handleGenderSelect = (selectedGender: string) => {
    updateFormData("gender", selectedGender);
    setShowGenderDropdown(false);
  };

  // Handle region selection
  const handleRegionSelect = async (selectedRegion: PsgcItem) => {
    updateFormData("region_name", selectedRegion.name);
    setSelectedRegionCode(selectedRegion.code);

    // Reset dependent fields
    updateFormData("province_name", "");
    updateFormData("municipality_name", "");
    updateFormData("barangay_name", "");
    setProvinces([]);
    setMunicipalities([]);
    setBarangays([]);
    setSelectedProvinceCode("");
    setSelectedMunicipalityCode("");

    setShowRegionDropdown(false);

    // Fetch provinces for selected region
    if (selectedRegion.code) {
      setAddressLoading(true);
      const provincesData = await fetchProvincesByRegion(selectedRegion.code);
      setProvinces(provincesData);
      setAddressLoading(false);
    }
  };

  // Handle province selection
  const handleProvinceSelect = async (selectedProvince: PsgcItem) => {
    updateFormData("province_name", selectedProvince.name);
    setSelectedProvinceCode(selectedProvince.code);

    // Reset dependent fields
    updateFormData("municipality_name", "");
    updateFormData("barangay_name", "");
    setMunicipalities([]);
    setBarangays([]);
    setSelectedMunicipalityCode("");

    setShowProvinceDropdown(false);

    // Fetch municipalities for selected province
    if (selectedProvince.code) {
      setAddressLoading(true);
      const municipalitiesData = await fetchMunicipalitiesByProvince(
        selectedProvince.code
      );
      setMunicipalities(municipalitiesData);
      setAddressLoading(false);
    }
  };

  // Handle municipality selection
  const handleMunicipalitySelect = async (selectedMunicipality: PsgcItem) => {
    updateFormData("municipality_name", selectedMunicipality.name);
    setSelectedMunicipalityCode(selectedMunicipality.code);

    // Reset dependent field
    updateFormData("barangay_name", "");
    setBarangays([]);

    setShowMunicipalityDropdown(false);

    // Fetch barangays for selected municipality
    if (selectedMunicipality.code) {
      setAddressLoading(true);
      const barangaysData = await fetchBarangaysByMunicipality(
        selectedMunicipality.code
      );
      setBarangays(barangaysData);
      setAddressLoading(false);
    }
  };

  // Handle barangay selection
  const handleBarangaySelect = (selectedBarangay: PsgcItem) => {
    updateFormData("barangay_name", selectedBarangay.name);
    setShowBarangayDropdown(false);
  };

  // Handle date selection
  const handleDateChange = (dateString: string) => {
    let parsedDate: Date | null = null;

    const formats = [
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
      /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
      /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
      /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/,
    ];

    for (let i = 0; i < formats.length; i++) {
      const match = dateString.match(formats[i]);
      if (match) {
        let day, month, year;

        if (i === 2) {
          year = parseInt(match[1]);
          month = parseInt(match[2]) - 1;
          day = parseInt(match[3]);
        } else {
          month = parseInt(match[1]) - 1;
          day = parseInt(match[2]);
          year = parseInt(match[3]);
        }

        if (
          year >= 1900 &&
          year <= new Date().getFullYear() &&
          month >= 0 &&
          month <= 11 &&
          day >= 1 &&
          day <= 31
        ) {
          parsedDate = new Date(year, month, day);
          break;
        }
      }
    }

    if (parsedDate && !isNaN(parsedDate.getTime())) {
      setSelectedDate(parsedDate);

      const formattedDate = parsedDate.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      });

      updateFormData("dob", formattedDate);

      setDobTimestamp(firestore.Timestamp.fromDate(parsedDate));

      console.log("Date parsed successfully:", parsedDate);
      console.log("Formatted date:", formattedDate);

      console.log(
        "Firebase timestamp:",
        firestore.Timestamp.fromDate(parsedDate)
      );

      return true;
    } else {
      console.log("Invalid date format entered:", dateString);
      return false;
    }
  };

  // Handle manual date input with validation
  const handleManualDateInput = (text: string) => {
    updateFormData("dob", text);

    if (text.length >= 8) {
      const success = handleDateChange(text);
      if (!success && text.length >= 10) {
        console.log(
          "Please enter a valid date format (MM/DD/YYYY, MM-DD-YYYY, or YYYY-MM-DD)"
        );
      }
    }
  };

  // Format timestamp to readable date
  const formatTimestampToDate = (timestamp: any): string => {
    if (!timestamp) return "";

    try {
      let date;
      if (timestamp.toDate) {
        date = timestamp.toDate();
      } else if (timestamp.seconds) {
        date = new Date(timestamp.seconds * 1000);
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else {
        return "";
      }

      return date.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      });
    } catch (error) {
      console.error("Error formatting timestamp:", error);
      return "";
    }
  };

  // Convert timestamp to Date object for picker
  const timestampToDate = (timestamp: any): Date => {
    if (!timestamp) return new Date();

    try {
      if (timestamp.toDate) {
        return timestamp.toDate();
      } else if (timestamp.seconds) {
        return new Date(timestamp.seconds * 1000);
      } else if (timestamp instanceof Date) {
        return timestamp;
      }
    } catch (error) {
      console.error("Error converting timestamp to date:", error);
    }

    return new Date();
  };

  // Image picker functions
  const imageToBase64 = async (imageUri: string) => {
    try {
      let base64Image = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return `data:image/jpeg;base64,${base64Image}`;
    } catch (err) {
      console.error("Error converting image to base64:", err);
      return "";
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Sorry, camera roll permission is needed to upload."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;

      try {
        const base64Img = await imageToBase64(uri);

        if (!base64Img) {
          Alert.alert("Upload Failed", "Could not convert image.");
          return;
        }

        const oldProfilePic = profileImageUrl;
        const userName = `${formData.fname} ${formData.lname}`.trim();

        await firestore()
          .collection("users")
          .doc(user?.uid)
          .update({ profile_pic: base64Img });

        try {
          await createLog(
            user?.uid || "",
            userName || "Unknown User",
            "Update Profile Picture",
            { profile_pic: oldProfilePic || "" },
            { profile_pic: base64Img }
          );
          console.log("Profile picture log created successfully");
        } catch (logError) {
          console.error("Failed to create profile picture log:", logError);
        }

        setProfileImageUrl(base64Img);
        showNotification("Profile picture updated successfully!", "success");
      } catch (err) {
        console.error("Upload failed:", err);
        showNotification("Upload failed. Something went wrong.", "error");
      }
    }
  };

  // Fetch user data from Firebase
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userDoc = await firestore()
          .collection("users")
          .doc(user.uid)
          .get();

        if (userDoc.exists()) {
          const userData = userDoc.data();

          let guardianPhone = "";
          let guardianName = "";

          if (userData?.guardian_id) {
            try {
              const guardianDoc = await firestore()
                .collection("users")
                .doc(userData.guardian_id)
                .get();

              if (guardianDoc.exists()) {
                const guardianData = guardianDoc.data();

                guardianPhone =
                  guardianData?.phone_number || guardianData?.phoneNumber || "";

                const guardianFirstName =
                  guardianData?.first_name || guardianData?.fname || "";
                const guardianLastName =
                  guardianData?.last_name || guardianData?.lname || "";

                guardianName =
                  guardianFirstName && guardianLastName
                    ? `${guardianFirstName} ${guardianLastName}`
                    : guardianFirstName || guardianLastName || "";
              }
            } catch (guardianError) {
              console.error("Error fetching guardian data:", guardianError);
            }
          }

          const profileData: ProfileFormData = {
            fname: userData?.first_name || userData?.fname || "",
            mname: userData?.middle_name || userData?.mname || "",
            lname: userData?.last_name || userData?.lname || "",
            dob: formatTimestampToDate(userData?.date_of_birth),
            gender: userData?.gender || "",
            pname: guardianName,
            phoneNumber: guardianPhone,
            studId: userData?.guardian_id || userData?.studId || "",
            email: userData?.email || "",
            region_name: userData?.region_name || userData?.region || "",
            province_name: userData?.province_name || userData?.province || "",
            municipality_name:
              userData?.municipality_name || userData?.municipality || "",
            barangay_name: userData?.barangay_name || userData?.barangay || "",
          };

          const dobTimestamp = userData?.date_of_birth;
          if (dobTimestamp) {
            setDobTimestamp(dobTimestamp);
            setSelectedDate(timestampToDate(dobTimestamp));
          }

          const profilePicUrl =
            userData?.profile_pic ||
            userData?.profilePic ||
            userData?.profile_picture;
          setProfileImageUrl(profilePicUrl || null);

          setFormData(profileData);
          setOriginalData(profileData);

          await fetchLearnerSection(user.uid);

          console.log("Fetched user + guardian data:", profileData);
          console.log("Profile image URL:", profilePicUrl);
          console.log("DOB timestamp:", dobTimestamp);
        } else {
          console.log("No user document found");
          showNotification("User profile not found", "error");
        }
      } catch (error: any) {
        console.error("Error fetching user data:", error);
        showNotification(
          "Error loading user data: " + (error?.message || "Unknown error"),
          "error"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    fetchAddressData();
  }, [user]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setShowGenderDropdown(false);
    setShowRegionDropdown(false);
    setShowProvinceDropdown(false);
    setShowMunicipalityDropdown(false);
    setShowBarangayDropdown(false);

    setFormData(originalData);

    if (originalData.dob) {
      const originalDate = new Date(originalData.dob);
      if (!isNaN(originalDate.getTime())) {
        setSelectedDate(originalDate);
        setDobTimestamp(firestore.Timestamp.fromDate(originalDate));
      }
    }
  };

  const handleSave = async () => {
    if (!user?.uid) {
      showNotification("User not found. Please try logging in again.", "error");
      return;
    }

    if (!dobTimestamp) {
      showNotification("Please select a valid date of birth.", "error");
      return;
    }

    try {
      setLoading(true);

      const updateData = {
        first_name: formData.fname,
        fname: formData.fname,
        middle_name: formData.mname,
        mname: formData.mname,
        last_name: formData.lname,
        lname: formData.lname,
        date_of_birth: dobTimestamp,
        gender: formData.gender,
        phoneNumber: formData.phoneNumber,
        region_name: formData.region_name,
        province_name: formData.province_name,
        municipality_name: formData.municipality_name,
        barangay_name: formData.barangay_name,
      };

      console.log("Updating user with data:", updateData);
      console.log("Date of birth timestamp:", dobTimestamp);

      const beforeData = {
        first_name: originalData.fname,
        middle_name: originalData.mname,
        last_name: originalData.lname,
        date_of_birth: originalData.dob,
        gender: originalData.gender,
        region_name: originalData.region_name,
        province_name: originalData.province_name,
        municipality_name: originalData.municipality_name,
        barangay_name: originalData.barangay_name,
      };

      const afterData = {
        first_name: formData.fname,
        middle_name: formData.mname,
        last_name: formData.lname,
        date_of_birth: formData.dob,
        gender: formData.gender,
        region_name: formData.region_name,
        province_name: formData.province_name,
        municipality_name: formData.municipality_name,
        barangay_name: formData.barangay_name,
      };

      const userName = `${formData.fname} ${formData.lname}`.trim();

      await firestore().collection("users").doc(user.uid).update(updateData);
      console.log("Firebase update completed successfully");

      try {
        await createLog(
          user.uid,
          userName || "Unknown User",
          "Update Profile Information",
          beforeData,
          afterData
        );
        console.log("Log entry created successfully");
      } catch (logError) {
        console.error("Failed to create log entry:", logError);
      }

      setOriginalData({ ...formData });
      setIsEditing(false);
      setShowGenderDropdown(false);
      setShowRegionDropdown(false);
      setShowProvinceDropdown(false);
      setShowMunicipalityDropdown(false);
      setShowBarangayDropdown(false);
      setShowDatePicker(false);

      showNotification("Profile updated successfully!", "success");
    } catch (error: any) {
      console.error("Error updating user data:", error);
      console.error("Error details:", error.message);
      showNotification(
        "Error updating profile: " + (error?.message || "Unknown error"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // UPDATED: Simple page navigation function
  const navigateToPage = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    const lockOrientation = async () => {
      try {
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.LANDSCAPE
        );
      } catch (error) {
        console.error("Error locking orientation:", error);
      }
    };
    lockOrientation();
  }, []);

  // Render dropdown item
  const renderDropdownItem = ({ item }) => (
    <TouchableOpacity
      style={styles.dropdownItem}
      onPress={() => {
        if (item.onPress) {
          item.onPress(item);
        }
      }}
    >
      <Text style={styles.dropdownItemText}>
        {item.label || item.name || "Unknown"}
      </Text>
    </TouchableOpacity>
  );

  if (!fontsLoaded) {
    return null;
  }

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#9B72CF" />
        <Text style={styles.loadingText}>Loading profile data...</Text>
      </ThemedView>
    );
  }

  // UPDATED: Render current page content
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 0: // Parent Information
        return (
          <View style={styles.pageContent}>
            <Text style={styles.pageTitle}>Parent Information</Text>

            <View style={styles.ParentInformationContainer}>
              <View style={styles.ParentInformation}>
                <Text style={styles.InputTitle}>Name</Text>
                <Text style={styles.InputData}>{formData.pname || "N/A"}</Text>
              </View>

              <View style={styles.ParentInformation}>
                <Text style={styles.InputTitle}>Contact Number</Text>
                <Text style={styles.InputData}>
                  {formData.phoneNumber || "N/A"}
                </Text>
              </View>
            </View>
          </View>
        );

      case 1: // Student Information
        return (
          <View style={styles.pageContent}>
            <Text style={styles.pageTitle}>Student Information</Text>

            <View style={styles.StudentInformationContainer}>
              <View style={styles.StudentInformation}>
                <Text
                  style={[
                    styles.InputTitle,
                    isEditing && styles.InputTitleEditing,
                  ]}
                >
                  First Name
                </Text>
                {isEditing ? (
                  <TextInput
                    style={[styles.InputData, styles.InputDataEditing]}
                    value={formData.fname}
                    onChangeText={(text) => updateFormData("fname", text)}
                  />
                ) : (
                  <Text style={styles.InputData}>
                    {formData.fname || "N/A"}
                  </Text>
                )}
              </View>

              <View style={styles.StudentInformation}>
                <Text
                  style={[
                    styles.InputTitle,
                    isEditing && styles.InputTitleEditing,
                  ]}
                >
                  Middle Name
                </Text>
                {isEditing ? (
                  <TextInput
                    style={[styles.InputData, styles.InputDataEditing]}
                    value={formData.mname}
                    onChangeText={(text) => updateFormData("mname", text)}
                  />
                ) : (
                  <Text style={styles.InputData}>
                    {formData.mname || "N/A"}
                  </Text>
                )}
              </View>

              <View style={styles.StudentInformation}>
                <Text
                  style={[
                    styles.InputTitle,
                    isEditing && styles.InputTitleEditing,
                  ]}
                >
                  Last Name
                </Text>
                {isEditing ? (
                  <TextInput
                    style={[styles.InputData, styles.InputDataEditing]}
                    value={formData.lname}
                    onChangeText={(text) => updateFormData("lname", text)}
                  />
                ) : (
                  <Text style={styles.InputData}>
                    {formData.lname || "N/A"}
                  </Text>
                )}
              </View>

              <View style={styles.StudentInformation}>
                <Text
                  style={[
                    styles.InputTitle,
                    isEditing && styles.InputTitleEditing,
                  ]}
                >
                  Date of Birth
                </Text>
                {isEditing ? (
                  <View>
                    <TextInput
                      style={[styles.InputData, styles.InputDataEditing]}
                      value={formData.dob}
                      onChangeText={handleManualDateInput}
                      placeholder="MM/DD/YYYY or MM-DD-YYYY"
                    />
                  </View>
                ) : (
                  <Text style={styles.InputData}>{formData.dob || "N/A"}</Text>
                )}
              </View>

              <View style={styles.StudentInformation}>
                <Text
                  style={[
                    styles.InputTitle,
                    isEditing && styles.InputTitleEditing,
                  ]}
                >
                  Gender
                </Text>
                {isEditing ? (
                  <TouchableOpacity
                    style={[
                      styles.InputData,
                      styles.InputDataEditing,
                      styles.dropdownButton,
                    ]}
                    onPress={() => setShowGenderDropdown(true)}
                  >
                    <Text style={styles.dropdownButtonText}>
                      {formData.gender || "Select Gender"}
                    </Text>
                    <Text style={styles.dropdownArrow}>▼</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.InputData}>
                    {formData.gender || "N/A"}
                  </Text>
                )}
              </View>
            </View>
          </View>
        );

      case 2: // Address Information
        return (
          <View style={styles.pageContent}>
            <Text style={styles.pageTitle}>Address Information</Text>
            <View style={styles.StudentInformationContainer}>
              <View style={styles.StudentInformation}>
                <Text
                  style={[
                    styles.InputTitle,
                    isEditing && styles.InputTitleEditing,
                  ]}
                >
                  Region
                </Text>
                {isEditing ? (
                  <TouchableOpacity
                    style={[
                      styles.InputData,
                      styles.InputDataEditing,
                      styles.dropdownButton,
                    ]}
                    onPress={() => setShowRegionDropdown(true)}
                  >
                    <Text style={styles.dropdownButtonText}>
                      {formData.region_name || "Select Region"}
                    </Text>
                    {addressLoading ? (
                      <ActivityIndicator size="small" color="#9B72CF" />
                    ) : (
                      <Text style={styles.dropdownArrow}>▼</Text>
                    )}
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.InputData}>
                    {formData.region_name || "N/A"}
                  </Text>
                )}
              </View>

              <View style={styles.StudentInformation}>
                <Text
                  style={[
                    styles.InputTitle,
                    isEditing && styles.InputTitleEditing,
                  ]}
                >
                  Province
                </Text>
                {isEditing ? (
                  <TouchableOpacity
                    style={[
                      styles.InputData,
                      styles.InputDataEditing,
                      styles.dropdownButton,
                    ]}
                    onPress={() => setShowProvinceDropdown(true)}
                    disabled={!formData.region_name}
                  >
                    <Text
                      style={[
                        styles.dropdownButtonText,
                        !formData.region_name &&
                          styles.dropdownButtonTextDisabled,
                      ]}
                    >
                      {formData.province_name ||
                        (formData.region_name
                          ? "Select Province"
                          : "Select Region First")}
                    </Text>
                    {addressLoading ? (
                      <ActivityIndicator size="small" color="#9B72CF" />
                    ) : (
                      <Text style={styles.dropdownArrow}>▼</Text>
                    )}
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.InputData}>
                    {formData.province_name || "N/A"}
                  </Text>
                )}
              </View>

              <View style={styles.StudentInformation}>
                <Text
                  style={[
                    styles.InputTitle,
                    isEditing && styles.InputTitleEditing,
                  ]}
                >
                  Municipality
                </Text>
                {isEditing ? (
                  <TouchableOpacity
                    style={[
                      styles.InputData,
                      styles.InputDataEditing,
                      styles.dropdownButton,
                    ]}
                    onPress={() => setShowMunicipalityDropdown(true)}
                    disabled={!formData.province_name}
                  >
                    <Text
                      style={[
                        styles.dropdownButtonText,
                        !formData.province_name &&
                          styles.dropdownButtonTextDisabled,
                      ]}
                    >
                      {formData.municipality_name ||
                        (formData.province_name
                          ? "Select Municipality"
                          : "Select Province First")}
                    </Text>
                    {addressLoading ? (
                      <ActivityIndicator size="small" color="#9B72CF" />
                    ) : (
                      <Text style={styles.dropdownArrow}>▼</Text>
                    )}
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.InputData}>
                    {formData.municipality_name || "N/A"}
                  </Text>
                )}
              </View>

              <View style={styles.StudentInformation}>
                <Text
                  style={[
                    styles.InputTitle,
                    isEditing && styles.InputTitleEditing,
                  ]}
                >
                  Barangay
                </Text>
                {isEditing ? (
                  <TouchableOpacity
                    style={[
                      styles.InputData,
                      styles.InputDataEditing,
                      styles.dropdownButton,
                    ]}
                    onPress={() => setShowBarangayDropdown(true)}
                    disabled={!formData.municipality_name}
                  >
                    <Text
                      style={[
                        styles.dropdownButtonText,
                        !formData.municipality_name &&
                          styles.dropdownButtonTextDisabled,
                      ]}
                    >
                      {formData.barangay_name ||
                        (formData.municipality_name
                          ? "Select Barangay"
                          : "Select Municipality First")}
                    </Text>
                    {addressLoading ? (
                      <ActivityIndicator size="small" color="#9B72CF" />
                    ) : (
                      <Text style={styles.dropdownArrow}>▼</Text>
                    )}
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.InputData}>
                    {formData.barangay_name || "N/A"}
                  </Text>
                )}
              </View>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <ThemedView style={styles.container}>
        {/* Custom Notification */}
        {notification.visible && (
          <View style={styles.notificationContainer}>
            <Animated.View
              style={[
                styles.notificationBox,
                {
                  backgroundColor:
                    notification.type === "success" ? "#4CAF50" : "#FF6B6B",
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <Text style={styles.notificationText}>
                {notification.message}
              </Text>
            </Animated.View>
          </View>
        )}

        {/* Gender Dropdown Modal */}
        <Modal
          visible={showGenderDropdown}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowGenderDropdown(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowGenderDropdown(false)}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Gender</Text>
              <FlatList
                data={GENDER_OPTIONS.map((gender) => ({
                  ...gender,
                  onPress: (item) => handleGenderSelect(item.value),
                }))}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderDropdownItem}
                showsVerticalScrollIndicator={false}
              />
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowGenderDropdown(false)}
              >
                <Text style={styles.modalCloseButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Region Dropdown Modal */}
        <Modal
          visible={showRegionDropdown}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowRegionDropdown(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowRegionDropdown(false)}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Region</Text>
              <FlatList
                data={regions.map((region) => ({
                  ...region,
                  label: region.name,
                  value: region.name,
                  onPress: handleRegionSelect,
                }))}
                keyExtractor={(item) => item.code}
                renderItem={renderDropdownItem}
                showsVerticalScrollIndicator={false}
              />
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowRegionDropdown(false)}
              >
                <Text style={styles.modalCloseButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Province Dropdown Modal */}
        <Modal
          visible={showProvinceDropdown}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowProvinceDropdown(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowProvinceDropdown(false)}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Province</Text>
              <FlatList
                data={provinces.map((province) => ({
                  ...province,
                  label: province.name,
                  value: province.name,
                  onPress: handleProvinceSelect,
                }))}
                keyExtractor={(item) => item.code}
                renderItem={renderDropdownItem}
                showsVerticalScrollIndicator={false}
              />
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowProvinceDropdown(false)}
              >
                <Text style={styles.modalCloseButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Municipality Dropdown Modal */}
        <Modal
          visible={showMunicipalityDropdown}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowMunicipalityDropdown(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowMunicipalityDropdown(false)}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Municipality</Text>
              <FlatList
                data={municipalities.map((municipality) => ({
                  ...municipality,
                  label: municipality.name,
                  value: municipality.name,
                  onPress: handleMunicipalitySelect,
                }))}
                keyExtractor={(item) => item.code}
                renderItem={renderDropdownItem}
                showsVerticalScrollIndicator={false}
              />
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowMunicipalityDropdown(false)}
              >
                <Text style={styles.modalCloseButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Barangay Dropdown Modal */}
        <Modal
          visible={showBarangayDropdown}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowBarangayDropdown(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowBarangayDropdown(false)}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Barangay</Text>
              <FlatList
                data={barangays.map((barangay) => ({
                  ...barangay,
                  label: barangay.name,
                  value: barangay.name,
                  onPress: handleBarangaySelect,
                }))}
                keyExtractor={(item) => item.code}
                renderItem={renderDropdownItem}
                showsVerticalScrollIndicator={false}
              />
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowBarangayDropdown(false)}
              >
                <Text style={styles.modalCloseButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push("/screens/learner")}>
            <Image
              source={require("@/assets/images/arrow-left.png")}
              style={styles.image}
            />
          </TouchableOpacity>
        </View>

        {/* FIXED PROFILE HEADER - LAYER 1 */}
        <View style={styles.layer1}>
          <View style={styles.ProfileContainer}>
            <TouchableOpacity onPress={isEditing ? pickImage : undefined}>
              <View style={styles.ProfileImageContainer}>
                <Image
                  source={
                    profileImageUrl
                      ? { uri: profileImageUrl }
                      : require("@/assets/images/defaultimg.jpg")
                  }
                  style={styles.ProfileImage}
                  onError={(error) => {
                    console.log("Error loading profile image:", error);
                    setProfileImageUrl(null);
                  }}
                />
                {/* Edit overlay that shows only when editing */}
                {isEditing && (
                  <View style={styles.imageEditOverlay}>
                    <View style={styles.imageEditIcon}>
                      <Image
                        source={require("@/assets/images/camera3.png")}
                        style={styles.cameraIcon}
                      />
                    </View>
                  </View>
                )}
              </View>
            </TouchableOpacity>

            <View style={styles.ProfileTextContainer}>
              <Text style={styles.LayerTitle}>
                {formData.fname} {formData.mname} {formData.lname}
              </Text>
              <Text style={styles.ProfileText}>
                {formData?.email || "No email available"}
              </Text>
              <Text style={styles.ProfileSubText}>Section: {sectionName}</Text>
            </View>
          </View>

          {!isEditing ? (
            <TouchableOpacity style={styles.EditBtn} onPress={handleEdit}>
              <Text style={styles.BtnText}>Edit</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.ButtonContainer}>
              <TouchableOpacity style={styles.CancelBtn} onPress={handleCancel}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.SaveBtn} onPress={handleSave}>
                <Text style={styles.BtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* UPDATED: CONTENT AREA - No longer scrollable, shows current page */}
        <View style={styles.contentArea}>{renderCurrentPage()}</View>

        {/* PAGINATION INDICATOR */}
        <View style={styles.paginationContainer}>
          <TouchableOpacity
            style={[
              styles.paginationDot,
              currentPage === 0 && styles.paginationDotActive,
            ]}
            onPress={() => navigateToPage(0)}
          >
            <Text
              style={[
                styles.paginationText,
                currentPage === 0 && styles.paginationTextActive,
              ]}
            >
              Parent Info
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.paginationDot,
              currentPage === 1 && styles.paginationDotActive,
            ]}
            onPress={() => navigateToPage(1)}
          >
            <Text
              style={[
                styles.paginationText,
                currentPage === 1 && styles.paginationTextActive,
              ]}
            >
              Student Info
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.paginationDot,
              currentPage === 2 && styles.paginationDotActive,
            ]}
            onPress={() => navigateToPage(2)}
          >
            <Text
              style={[
                styles.paginationText,
                currentPage === 2 && styles.paginationTextActive,
              ]}
            >
              Address Info
            </Text>
          </TouchableOpacity>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <View style={styles.categoryContainer}>
            <TouchableOpacity
              style={styles.categoryInfosActive}
              onPress={() => router.push("/screens/learner/profile")}
            >
              <Image
                source={require("@/assets/images/user2.png")}
                style={styles.CategoryImage}
              />
              <Text
                style={styles.categoryText}
                numberOfLines={2}
                adjustsFontSizeToFit
              >
                Account Information
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.categoryInfos}
              onPress={() => router.push("/screens/learner/changepass")}
            >
              <Image
                source={require("@/assets/images/lock.png")}
                style={styles.CategoryImage}
              />
              <Text
                style={styles.categoryText}
                numberOfLines={2}
                adjustsFontSizeToFit
              >
                Change Password
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ThemedView>
    </GestureHandlerRootView>
  );
}

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  image: {
    width: wp(3),
    height: hp(3.5),
    resizeMode: "contain",
  },
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  // UPDATED: Content area styles
  contentArea: {
    flex: 1,
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.03,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#9B72CF",
    fontWeight: "500",
    fontFamily: "Poppins",
  },
  notificationContainer: {
    position: "absolute",
    top: hp(3),
    left: wp(2.5),
    right: wp(2.5),
    zIndex: 9999,
    alignItems: "center",
  },
  notificationBox: {
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.02,
    borderRadius: width * 0.01,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 8,
  },
  notificationText: {
    color: "#fafafa",
    fontSize: RFValue(8),
    fontFamily: "Poppins",
    textAlign: "center",
    fontWeight: "600",
  },
  // Image edit overlay styles
  imageEditOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(155, 114, 207, 0.8)",
    width: width * 0.1,
    borderRadius: (width * 0.1) / 2,
    justifyContent: "center",
    alignItems: "center",
  },
  imageEditIcon: {
    width: width * 0.08,
    height: width * 0.08,
    borderRadius: width * 0.015,
    justifyContent: "center",
    alignItems: "center",
  },
  cameraIcon: {
    width: "80%",
    height: "80%",
    resizeMode: "contain",
  },
  imageEditText: {
    color: "#fafafa",
    fontSize: RFValue(6),
    fontFamily: "Poppins",
    fontWeight: "600",
    textAlign: "center",
  },
  // Dropdown styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fafafa",
    borderRadius: width * 0.01,
    padding: width * 0.02,
    width: width * 0.3,
    maxHeight: height * 0.6,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 8,
  },
  modalTitle: {
    fontSize: RFValue(12),
    fontWeight: "700",
    color: "#9B72CF",
    marginBottom: height * 0.02,
    fontFamily: "Poppins",
    textAlign: "center",
  },
  dropdownItem: {
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.02,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(67, 67, 67, 0.1)",
  },
  dropdownItemText: {
    fontSize: RFValue(9),
    fontWeight: "500",
    fontFamily: "Poppins",
    color: "#434343",
    textAlign: "center",
  },
  modalCloseButton: {
    marginTop: height * 0.02,
    paddingVertical: height * 0.01,
    paddingHorizontal: width * 0.01,
  },
  modalCloseButtonText: {
    color: "#434343",
    fontSize: RFValue(9),
    fontFamily: "Poppins",
    textAlign: "center",
  },
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownButtonText: {
    fontFamily: "Poppins",
    fontSize: RFValue(9),
    color: "#434343",
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  dropdownButtonTextDisabled: {
    color: "#999",
  },
  dropdownArrow: {
    fontSize: RFValue(6),
    color: "#434343",
  },

  header: {
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.02,
    backgroundColor: "#E5E5E5",
    justifyContent: "center",
    alignItems: "flex-start",
    position: "relative",
  },
  // FIXED LAYER 1 - PROFILE HEADER
  layer1: {
    width: width * 0.9,
    borderBottomWidth: 1,
    borderColor: "rgba(67, 67, 67, 0.5)",
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.03,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fafafa",
    alignSelf: "center",
    marginHorizontal: "auto",
  },
  ProfileContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  ProfileImageContainer: {
    position: "relative",
  },
  ProfileImage: {
    width: width * 0.1,
    height: width * 0.1,
    borderRadius: (width * 0.1) / 2,
    resizeMode: "cover",
    marginRight: width * 0.03,
  },
  ProfileTextContainer: {
    justifyContent: "center",
  },
  ProfileText: {
    fontFamily: "Poppins",
    fontSize: RFValue(8),
    color: "#434343",
    fontWeight: "400",
    letterSpacing: 0.5,
  },
  ProfileSubText: {
    fontFamily: "Poppins",
    fontSize: RFValue(7),
    color: "#434343",
    opacity: 0.7,
    fontWeight: "300",
    letterSpacing: 0.5,
  },
  BtnText: {
    fontFamily: "Poppins",
    fontSize: RFValue(9),
    color: "#fafafa",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  LayerTitle: {
    fontFamily: "Poppins",
    fontSize: RFValue(11),
    color: "#434343",
    fontWeight: "500",
    letterSpacing: 0.5,
    textAlign: "left",
    marginBottom: height * 0.005,
  },
  // PAGINATION STYLES
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: height * 0.02,
    paddingBottom: height * 0.04,
    backgroundColor: "#f8f8f8",
    borderTopWidth: 1,
    borderColor: "rgba(67, 67, 67, 0.2)",
    width: width * 0.9,
    alignSelf: "center",
    marginHorizontal: "auto",
  },
  paginationDot: {
    paddingHorizontal: width * 0.03,
    paddingVertical: height * 0.01,
    marginHorizontal: width * 0.01,
    borderRadius: width * 0.01,
    backgroundColor: "#e0e0e0",
  },
  paginationDotActive: {
    backgroundColor: "#9B72CF",
  },
  paginationText: {
    fontFamily: "Poppins",
    fontSize: RFValue(7),
    color: "#666",
    fontWeight: "500",
  },
  paginationTextActive: {
    color: "#ffffff",
    fontWeight: "600",
  },
  // PAGE STYLES
  pageContent: {
    flex: 1,
    width: width * 0.9,
    alignSelf: "center",
    marginHorizontal: "auto",
  },
  pageTitle: {
    fontFamily: "Poppins",
    fontSize: RFValue(11),
    color: "#434343",
    fontWeight: "600",
    letterSpacing: 0.5,
    textAlign: "center",
    marginBottom: height * 0.03,
  },
  // INFORMATION CONTAINERS
  ParentInformationContainer: {
    flexDirection: "row",
    gap: width * 0.04,
  },
  ParentInformation: {
    flex: 1,
  },
  StudentInformationContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: width * 0.03,
  },
  StudentInformation: {
    flex: 1,
    marginBottom: height * 0.02,
  },
  InputTitle: {
    fontFamily: "Poppins",
    fontSize: RFValue(9),
    color: "#434343",
    opacity: 0.7,
    fontWeight: "400",
    letterSpacing: 0.5,
    textAlign: "left",
    marginVertical: height * 0.005,
  },
  InputTitleEditing: {
    color: "#434343",
    opacity: 1,
  },
  InputData: {
    fontFamily: "Poppins",
    fontSize: RFValue(9),
    color: "#434343",
    opacity: 0.7,
    fontWeight: "500",
    letterSpacing: 0.5,
    borderRadius: width * 0.01,
    borderWidth: 1,
    borderColor: "rgba(67, 67, 67, 0.7)",
    textAlign: "center",
    padding: width * 0.002,
    marginBottom: width * 0.005,
    backgroundColor: "#fafafa",
  },
  InputDataEditing: {
    color: "#434343",
    opacity: 1,
    borderColor: "#434343",
    backgroundColor: "#ffffff",
  },
  EditBtn: {
    backgroundColor: "#9B72CF",
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.04,
    borderRadius: width * 0.01,
  },
  ButtonContainer: {
    flexDirection: "row",
    gap: width * 0.02,
  },
  CancelBtn: {
    borderColor: "#9B72CF",
    borderWidth: 1,
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.04,
    borderRadius: width * 0.01,
  },
  cancelBtnText: {
    fontFamily: "Poppins",
    fontSize: RFValue(9),
    color: "#9B72CF",
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  SaveBtn: {
    backgroundColor: "#9B72CF",
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.04,
    borderRadius: width * 0.01,
  },
  // FOOTER
  footer: {
    backgroundColor: "#E5E5E5",
    flex: 0,
    justifyContent: "center",
  },
  categoryContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(1),
    minWidth: "100%",
  },
  CategoryImage: {
    borderRadius: width * 0.005,
    resizeMode: "contain",
    aspectRatio: 1,
    width: width * 0.02,
    height: height * 0.02,
  },
  categoryInfos: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: width * 0.01,
    paddingHorizontal: width * 0.03,
    borderRightWidth: 1,
    borderColor: "#9B72CF",
  },
  categoryInfosActive: {
    backgroundColor: "#fafafa",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: height * 0.1,
    gap: width * 0.01,
    borderBottomLeftRadius: width * 0.01,
    borderBottomRightRadius: width * 0.01,
    paddingHorizontal: width * 0.03,
    borderRightWidth: 1,
    borderColor: "#9B72CF",
  },
  categoryText: {
    fontSize: RFValue(9),
    fontWeight: "500",
    color: "#9B72CF",
    fontFamily: "Poppins",
    textAlign: "left",
    justifyContent: "center",
    marginTop: 0,
  },
});
