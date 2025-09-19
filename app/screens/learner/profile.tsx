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
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  GestureHandlerRootView,
  TextInput,
} from "react-native-gesture-handler";
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
}

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
      afterData
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
      user_type: "LEARNER",
    };

    console.log("Log data to be saved:", logData);
    
    const docRef = await firestore().collection("logs").add(logData);
    console.log("Log created successfully with ID:", docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error("Error creating log:", error);
    console.error("Error details:", error.message);
    throw error; // Re-throw to handle in calling function
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
            dob: userData?.dateOfBirth || userData?.dob || "",
            gender: userData?.gender || "",
            pname: guardianName, // Guardian name
            phoneNumber: guardianPhone, // Guardian phone
            studId: userData?.guardian_id || userData?.studId || "",
            email: userData?.email || "",
          };

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

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original data
    setFormData(originalData);
  };

  const handleSave = async () => {
    if (!user?.uid) {
      showNotification("User not found. Please try logging in again.", "error");
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
        dateOfBirth: formData.dob,
        gender: formData.gender,
        phoneNumber: formData.phoneNumber,
      };

      // Create before and after objects for logging
      const beforeData = {
        first_name: originalData.fname,
        middle_name: originalData.mname,
        last_name: originalData.lname,
        dateOfBirth: originalData.dob,
        gender: originalData.gender,
      };

      const afterData = {
        first_name: formData.fname,
        middle_name: formData.mname,
        last_name: formData.lname,
        dateOfBirth: formData.dob,
        gender: formData.gender,
      };

      const userName = `${formData.fname} ${formData.lname}`.trim();

      // Update the user document in Firestore
      await firestore().collection("users").doc(user.uid).update(updateData);

      // Create log entry for profile information change
      await createLog(
        user.uid,
        userName || "Unknown User",
        "Update Profile Information",
        beforeData,
        afterData
      );

      // Update original data to reflect the saved changes
      setOriginalData({ ...formData });
      setIsEditing(false);

      console.log("User data updated successfully");
      console.log("Log entry created for profile update");
      showNotification("Profile updated successfully!", "success");
    } catch (error: any) {
      console.error("Error updating user data:", error);
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
                  {formData?.studId || "No Student ID"}
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
                  <TextInput
                    style={[styles.InputData, styles.InputDataEditing]}
                    value={formData.dob}
                    onChangeText={(text) => updateFormData("dob", text)}
                    placeholder="MM - DD - YYYY"
                  />
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
                  <TextInput
                    style={[styles.InputData, styles.InputDataEditing]}
                    value={formData.gender}
                    onChangeText={(text) => updateFormData("gender", text)}
                  />
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

// Styles remain the same as your original code
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
    paddingVertical: hp(1),
    paddingHorizontal: wp(4),
    borderRadius: wp(2),
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
    fontSize: wp(2.2),
    fontFamily: "Poppins",
    textAlign: "center",
    fontWeight: "600",
  },
  header: {
    paddingHorizontal: wp(8),
    paddingVertical: hp(0.5),
    backgroundColor: "#E5E5E5",
    height: hp(4),
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
  },
  body: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  layer1: {
    width: wp(160),
    borderBottomWidth: 1,
    borderColor: "rgba(67, 67, 67, 0.5)",
    paddingHorizontal: wp(1),
    paddingVertical: wp(1),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ProfileContainer: {
    display: "flex",
    flexDirection: "row",
    marginTop: hp(1),
  },
  ProfileImageContainer: {
    position: "relative",
  },
  ProfileImage: {
    width: wp(15),
    height: wp(15),
    borderRadius: wp(9),
    resizeMode: "cover",
    marginRight: wp(2),
  },
  ProfileTextContainer: {
    marginTop: hp(0.5),
    justifyContent: "center",
  },
  ProfileText: {
    fontFamily: "Poppins",
    fontSize: wp(2.2),
    color: "#434343",
    fontWeight: "400",
    letterSpacing: 0.5,
  },
  ProfileSubText: {
    fontFamily: "Poppins",
    fontSize: wp(2.0),
    color: "#434343",
    opacity: 0.7,
    fontWeight: "300",
    letterSpacing: 0.5,
  },
  BtnText: {
    fontFamily: "Poppins",
    fontSize: wp(2.2),
    color: "#fafafa",
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  layer2: {
    width: wp(160),
    paddingHorizontal: wp(1),
    paddingVertical: wp(2),
    borderBottomWidth: 1,
    borderColor: "rgba(67, 67, 67, 0.5)",
  },
  LayerTitle: {
    fontFamily: "Poppins",
    fontSize: wp(2.4),
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
    minWidth: wp(25),
  },
  InputTitle: {
    fontFamily: "Poppins",
    fontSize: wp(2.2),
    color: "#434343",
    opacity: 0.7,
    fontWeight: "400",
    letterSpacing: 0.5,
    textAlign: "center",
    marginVertical: hp(0.5),
  },
  InputTitleEditing: {
    color: "#434343",
    opacity: 1,
  },
  InputData: {
    fontFamily: "Poppins",
    fontSize: wp(2.2),
    color: "#434343",
    opacity: 0.7,
    fontWeight: "500",
    letterSpacing: 0.5,
    borderRadius: wp(1),
    borderWidth: 1,
    borderColor: "rgba(67, 67, 67, 0.7)",
    textAlign: "center",
    padding: wp(0.5),
    marginBottom: hp(0.5),
    backgroundColor: "#fafafa",
  },
  InputDataEditing: {
    color: "#434343",
    opacity: 1,
    borderColor: "#434343",
    backgroundColor: "#fafafa",
  },
  layer3: {
    width: wp(160),
    paddingHorizontal: wp(1),
    paddingVertical: wp(2),
  },
  EditBtn: {
    backgroundColor: "#9B72CF",
    paddingVertical: hp(1),
    paddingHorizontal: wp(8),
    borderRadius: wp(2),
    marginTop: hp(1),
  },
  ButtonContainer: {
    flexDirection: "row",
    gap: wp(2),
    marginTop: hp(1),
  },
  CancelBtn: {
    borderColor: "#9B72CF",
    borderWidth: 1,
    paddingVertical: hp(1),
    paddingHorizontal: wp(8),
    borderRadius: wp(2),
  },
  cancelBtnText: {
    fontFamily: "Poppins",
    fontSize: wp(2.2),
    color: "#9B72CF",
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  SaveBtn: {
    backgroundColor: "#9B72CF",
    paddingVertical: hp(1),
    paddingHorizontal: wp(8),
    borderRadius: wp(2),
  },
  footer: {
    backgroundColor: "#E5E5E5",
    height: hp(4),
    justifyContent: "center",
  },
  categoryContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(1),
    minWidth: "100%",
  },
  CategoryImage: {
    borderRadius: wp(0.5),
    resizeMode: "contain",
    aspectRatio: 1,
    width: wp(4),
    height: hp(4),
  },
  categoryInfos: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: wp(1.5),
    paddingHorizontal: wp(6),
    borderRightWidth: 1,
    borderColor: "#9B72CF",
    minWidth: wp(18),
    height: hp(3),
  },
  ChangeProfileBtn: {
    backgroundColor: "#9B72CF",
    paddingVertical: hp(1),
    paddingHorizontal: wp(3),
    borderRadius: wp(2),
  },
  categoryInfosActive: {
    backgroundColor: "#fafafa",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: hp(4),
    gap: wp(1.5),
    borderBottomLeftRadius: wp(2),
    borderBottomRightRadius: wp(2),
    paddingHorizontal: wp(6),
    paddingVertical: hp(1),
    borderRightWidth: 1,
    borderColor: "#9B72CF",
  },
  categoryText: {
    fontSize: wp(2.2),
    fontWeight: "500",
    color: "#9B72CF",
    fontFamily: "Poppins",
    textAlign: "left",
    justifyContent: "center",
    marginTop: 0,
  },
});