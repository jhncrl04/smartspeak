import { ThemedView } from "@/components/ThemedView";
import { useAuthStore } from "@/stores/userAuthStore";
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
// Removed DateTimePicker import - using alternative approach

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
}

// Gender options for dropdown
const GENDER_OPTIONS = [
  { id: 1, label: "Male", value: "Male" },
  { id: 2, label: "Female", value: "Female" },
  { id: 3, label: "Other", value: "Other" },
  { id: 4, label: "Prefer not to say", value: "Prefer not to say" },
];

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

  // Gender dropdown state
  const [showGenderDropdown, setShowGenderDropdown] = useState<boolean>(false);

  // Date picker states
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dobTimestamp, setDobTimestamp] = useState<any>(null);

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

  // Show notification function
  const showNotification = (
    message: string,
    type: "error" | "success" = "error"
  ) => {
    setNotification({ visible: true, message, type });

    // Slide down animation
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Hide after 3 seconds for better readability
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

  // Handle date selection - UPDATED (without external date picker)
  const handleDateChange = (dateString: string) => {
    // Try to parse various date formats
    let parsedDate: Date | null = null;

    // Try different date formats
    const formats = [
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // MM/DD/YYYY or M/D/YYYY
      /^(\d{1,2})-(\d{1,2})-(\d{4})$/, // MM-DD-YYYY or M-D-YYYY
      /^(\d{4})-(\d{1,2})-(\d{1,2})$/, // YYYY-MM-DD or YYYY-M-D
      /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/, // MM.DD.YYYY or M.D.YYYY
    ];

    for (let i = 0; i < formats.length; i++) {
      const match = dateString.match(formats[i]);
      if (match) {
        let day, month, year;

        if (i === 2) {
          // YYYY-MM-DD format
          year = parseInt(match[1]);
          month = parseInt(match[2]) - 1; // Month is 0-indexed
          day = parseInt(match[3]);
        } else {
          // MM/DD/YYYY, MM-DD-YYYY, MM.DD.YYYY formats
          month = parseInt(match[1]) - 1; // Month is 0-indexed
          day = parseInt(match[2]);
          year = parseInt(match[3]);
        }

        // Validate date ranges
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

      // Format date for display (MM/DD/YYYY)
      const formattedDate = parsedDate.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      });

      // Update form data
      updateFormData("dob", formattedDate);

      // Store the timestamp for Firebase - CRITICAL FIX
      setDobTimestamp(firestore.Timestamp.fromDate(parsedDate));

      console.log("Date parsed successfully:", parsedDate);
      console.log("Formatted date:", formattedDate);
      console.log(
        "Firebase timestamp:",
        firestore.Timestamp.fromDate(parsedDate)
      );

      return true; // Success
    } else {
      console.log("Invalid date format entered:", dateString);
      return false; // Failed to parse
    }
  };

  // Handle manual date input with validation
  const handleManualDateInput = (text: string) => {
    updateFormData("dob", text);

    // Only try to parse if the user has entered a reasonable length string
    if (text.length >= 8) {
      // Minimum for MM/DD/YY format
      const success = handleDateChange(text);
      if (!success && text.length >= 10) {
        // Show validation message only for complete entries that failed to parse
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
        // Firebase Timestamp
        date = timestamp.toDate();
      } else if (timestamp.seconds) {
        // Firebase Timestamp object
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

  // -----------------------------
  // IMAGE PICKER + BASE64 CONVERTER
  // -----------------------------
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

        // Save to Firestore
        await firestore()
          .collection("users")
          .doc(user?.uid)
          .update({ profile_pic: base64Img });

        // Create log for profile picture change - SAVES ACTUAL IMAGE STRINGS
        try {
          await createLog(
            user?.uid || "",
            userName || "Unknown User",
            "Update Profile Picture",
            { profile_pic: oldProfilePic || "" }, // Save the actual old base64 string
            { profile_pic: base64Img } // Save the actual new base64 string
          );
          console.log("Profile picture log created successfully");
        } catch (logError) {
          console.error("Failed to create profile picture log:", logError);
          // Don't fail the whole operation if logging fails
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

          // If child has guardian_id, fetch guardian doc
          if (userData?.guardian_id) {
            try {
              const guardianDoc = await firestore()
                .collection("users")
                .doc(userData.guardian_id)
                .get();

              if (guardianDoc.exists()) {
                const guardianData = guardianDoc.data();

                // Fix: Use the correct field names from Firebase
                guardianPhone =
                  guardianData?.phone_number || guardianData?.phoneNumber || "";

                // Fix: Check for both possible field name formats
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
            pname: guardianName, // Guardian name
            phoneNumber: guardianPhone, // Guardian phone
            studId: userData?.guardian_id || userData?.studId || "",
            email: userData?.email || "",
          };

          // Set the DOB timestamp and selected date for picker
          const dobTimestamp = userData?.date_of_birth;
          if (dobTimestamp) {
            setDobTimestamp(dobTimestamp); // Firestore timestamp directly
            setSelectedDate(timestampToDate(dobTimestamp));
          }

          // Set profile image URL from Firebase
          const profilePicUrl =
            userData?.profile_pic ||
            userData?.profilePic ||
            userData?.profile_picture;
          setProfileImageUrl(profilePicUrl || null);

          setFormData(profileData);
          setOriginalData(profileData);
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
  }, [user]);

  // Add debugging useEffect
  useEffect(() => {
    console.log("Current dobTimestamp:", dobTimestamp);
    console.log("Current formData.dob:", formData.dob);
  }, [dobTimestamp, formData.dob]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setShowGenderDropdown(false); // Close dropdown if open
    // Reset to original data
    setFormData(originalData);
    // Reset DOB related states to original
    if (originalData.dob) {
      const originalDate = new Date(originalData.dob);
      if (!isNaN(originalDate.getTime())) {
        setSelectedDate(originalDate);
        setDobTimestamp(firestore.Timestamp.fromDate(originalDate));
      }
    }
  };

  // Update the handleSave function - CRITICAL FIX
  const handleSave = async () => {
    if (!user?.uid) {
      showNotification("User not found. Please try logging in again.", "error");
      return;
    }

    // Validate that we have a proper timestamp for date of birth
    if (!dobTimestamp) {
      showNotification("Please select a valid date of birth.", "error");
      return;
    }

    try {
      setLoading(true);

      // Prepare data for Firebase update
      const updateData = {
        first_name: formData.fname,
        fname: formData.fname,
        middle_name: formData.mname,
        mname: formData.mname,
        last_name: formData.lname,
        lname: formData.lname,
        date_of_birth: dobTimestamp, // Make sure this is a Firestore timestamp
        gender: formData.gender,
        phoneNumber: formData.phoneNumber,
      };

      console.log("Updating user with data:", updateData);
      console.log("Date of birth timestamp:", dobTimestamp);

      // Create before and after objects for logging
      const beforeData = {
        first_name: originalData.fname,
        middle_name: originalData.mname,
        last_name: originalData.lname,
        date_of_birth: originalData.dob, // Keep as formatted string for logging
        gender: originalData.gender,
      };

      const afterData = {
        first_name: formData.fname,
        middle_name: formData.mname,
        last_name: formData.lname,
        date_of_birth: formData.dob, // Keep as formatted string for logging
        gender: formData.gender,
      };

      const userName = `${formData.fname} ${formData.lname}`.trim();

      // Update the user document in Firestore
      await firestore().collection("users").doc(user.uid).update(updateData);
      console.log("Firebase update completed successfully");

      // Create log entry for profile information change
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
        // Don't fail the whole operation if logging fails
      }

      // Update original data to reflect the saved changes
      setOriginalData({ ...formData });
      setIsEditing(false);
      setShowGenderDropdown(false);
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

  // Render gender dropdown item
  const renderGenderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.dropdownItem}
      onPress={() => handleGenderSelect(item.value)}
    >
      <Text style={styles.dropdownItemText}>{item.label}</Text>
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

  return (
    <GestureHandlerRootView>
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
                data={GENDER_OPTIONS}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderGenderItem}
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

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push("/screens/learner")}>
            <Image
              source={require("@/assets/images/arrow-left.png")}
              style={styles.image}
            />
          </TouchableOpacity>
        </View>

        {/* MAIN BODY */}
        <View style={styles.body}>
          <View style={styles.layer1}>
            <View style={styles.ProfileContainer}>
              <TouchableOpacity onPress={pickImage}>
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
                </View>
              </TouchableOpacity>

              <View style={styles.ProfileTextContainer}>
                {/* Email */}
                <Text style={styles.ProfileText}>
                  {formData?.email || "No email available"}
                </Text>

                {/* Student ID */}
                <Text style={styles.ProfileSubText}>
                  {/* {formData?.studId || "No Student ID"} */}
                  Section:
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.ChangeProfileBtn]}
              onPress={pickImage}
            >
              <Text style={styles.BtnText}>Upload New Photo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.layer2}>
            <Text style={styles.LayerTitle}>Parent Information</Text>

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

          <View style={styles.layer3}>
            <Text style={styles.LayerTitle}>Student Information</Text>

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
                    {/* <TouchableOpacity
                      style={[styles.InputData, styles.InputDataEditing, styles.datePickerButton]}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <Text style={styles.datePickerText}>
                        {formData.dob || "Select Date"}
                      </Text>
                      <Text style={styles.dropdownArrow}>📅</Text>
                    </TouchableOpacity> */}

                    {/* Alternative: Manual text input */}
                    <TextInput
                      style={[styles.InputData, styles.InputDataEditing]}
                      value={formData.dob}
                      onChangeText={handleManualDateInput}
                      placeholder="MM/DD/YYYY or MM-DD-YYYY"
                    />

                    {/* Date Picker Modal
                    {showDatePicker && (
                      <DatePicker
                        value={selectedDate}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={handleDateChange}
                        maximumDate={new Date()} // Prevent future dates
                        minimumDate={new Date(1900, 0, 1)} // Reasonable minimum date
                      />
                    )} */}
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
                      styles.genderDropdownButton,
                    ]}
                    onPress={() => setShowGenderDropdown(true)}
                  >
                    <Text style={styles.genderDropdownText}>
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

// Styles with added date picker styles
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
  // Gender dropdown styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fafafa",
    borderRadius: width * 0.02,
    padding: width * 0.04,
    width: width * 0.6,
    maxHeight: height * 0.5,
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
    fontSize: RFValue(10),
    fontFamily: "Poppins",
    fontWeight: "600",
    color: "#434343",
    textAlign: "center",
    marginBottom: height * 0.02,
  },
  dropdownItem: {
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.02,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(67, 67, 67, 0.1)",
  },
  dropdownItemText: {
    fontSize: RFValue(8),
    fontFamily: "Poppins",
    color: "#434343",
    textAlign: "center",
  },
  modalCloseButton: {
    marginTop: height * 0.02,
    backgroundColor: "#9B72CF",
    paddingVertical: height * 0.015,
    borderRadius: width * 0.01,
  },
  modalCloseButtonText: {
    fontSize: RFValue(8),
    fontFamily: "Poppins",
    color: "#fafafa",
    textAlign: "center",
    fontWeight: "500",
  },
  genderDropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  genderDropdownText: {
    fontFamily: "Poppins",
    fontSize: RFValue(8),
    color: "#434343",
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  dropdownArrow: {
    fontSize: RFValue(6),
    color: "#434343",
  },
  // Date picker styles
  datePickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  datePickerText: {
    fontFamily: "Poppins",
    fontSize: RFValue(8),
    color: "#434343",
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  header: {
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.02,
    backgroundColor: "#E5E5E5",
    justifyContent: "center",
    alignItems: "flex-start",
    position: "relative",
  },
  body: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  layer1: {
    width: width * 0.8,
    borderBottomWidth: 1,
    borderColor: "rgba(67, 67, 67, 0.5)",
    paddingHorizontal: width * 0.01,
    paddingVertical: height * 0.02,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ProfileContainer: {
    display: "flex",
    flexDirection: "row",
  },
  ProfileImageContainer: {
    position: "relative",
  },
  ProfileImage: {
    width: width * 0.08,
    height: height * 0.15,
    borderRadius: width * 0.01,
    resizeMode: "cover",
    marginRight: width * 0.01,
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
    fontSize: RFValue(6),
    color: "#434343",
    opacity: 0.7,
    fontWeight: "300",
    letterSpacing: 0.5,
  },
  BtnText: {
    fontFamily: "Poppins",
    fontSize: RFValue(6),
    color: "#fafafa",
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  layer2: {
    width: width * 0.8,
    paddingHorizontal: width * 0.01,
    paddingVertical: height * 0.02,
    borderBottomWidth: 1,
    borderColor: "rgba(67, 67, 67, 0.5)",
  },
  LayerTitle: {
    fontFamily: "Poppins",
    fontSize: RFValue(8),
    color: "#434343",
    fontWeight: "500",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  ParentInformationContainer: {
    flexDirection: "row",
  },
  ParentInformation: {
    flex: 1,
    marginHorizontal: wp(1),
  },
  StudentInformationContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  StudentInformation: {
    flex: 1,
    marginHorizontal: wp(1),
  },
  InputTitle: {
    fontFamily: "Poppins",
    fontSize: RFValue(8),
    color: "#434343",
    opacity: 0.7,
    fontWeight: "400",
    letterSpacing: 0.5,
    textAlign: "center",
    marginVertical: height * 0.005,
  },
  InputTitleEditing: {
    color: "#434343",
    opacity: 1,
  },
  InputData: {
    fontFamily: "Poppins",
    fontSize: RFValue(8),
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
    backgroundColor: "#fafafa",
  },
  layer3: {
    width: width * 0.8,
    paddingHorizontal: width * 0.01,
    paddingVertical: height * 0.02,
  },
  EditBtn: {
    backgroundColor: "#9B72CF",
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.04,
    borderRadius: width * 0.01,
    marginTop: height * 0.01,
  },
  ButtonContainer: {
    flexDirection: "row",
    gap: width * 0.02,
    marginTop: height * 0.01,
  },
  CancelBtn: {
    borderColor: "#9B72CF",
    borderWidth: 1,
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.04,
    borderRadius: width * 0.01,
  },
  cancelBtnText: {
    fontFamily: "Poppins",
    fontSize: RFValue(6),
    color: "#9B72CF",
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  SaveBtn: {
    backgroundColor: "#9B72CF",
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.04,
    borderRadius: width * 0.01,
  },
  ChangeProfileBtn: {
    backgroundColor: "#9B72CF",
    paddingVertical: height * 0.02,
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
    fontSize: RFValue(8),
    fontWeight: "500",
    color: "#9B72CF",
    fontFamily: "Poppins",
    textAlign: "left",
    justifyContent: "center",
    marginTop: 0,
  },
});
