import { ThemedView } from "@/components/ThemedView";
import { useAuthStore } from "@/stores/userAuthStore";
import { useFonts } from "expo-font";
import { router } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
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

// ✅ Use React Native Firebase instead of web SDK
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { RFValue } from "react-native-responsive-fontsize";

export default function HomeScreen() {
  const [fontsLoaded] = useFonts({
    Poppins: require("@/assets/fonts/Poppins-Regular.ttf"),
  });

  // Get user and updatePassword from auth store
  const { user, updatePassword } = useAuthStore();

  const [isEditing, setIsEditing] = useState(false);
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Profile data state
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(true);
  const [sectionName, setSectionName] = useState<string>("No Section");
  const [studentName, setStudentName] = useState<string>("Student Name"); // ADDED: Student name state

  // Notification state
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

  const { width } = Dimensions.get("window");
  const isTablet = width > 968;

  // Function to fetch learner's section
  const fetchLearnerSection = async (userId: string) => {
    try {
      const sectionsSnapshot = await firestore()
        .collection("sections")
        .get();

      let learnerSection = "No Section";

      for (const doc of sectionsSnapshot.docs) {
        const sectionData = doc.data();
        const students = sectionData.students || [];

        if (students.includes(userId)) {
          learnerSection = sectionData.name || "Unnamed Section";
          break;
        }
      }

      setSectionName(learnerSection);
    } catch (error) {
      console.error("Error fetching learner section:", error);
      setSectionName("No Section");
    }
  };

  // UPDATED: Fetch profile image, student name, and section from Firebase
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.uid) {
        setLoadingImage(false);
        return;
      }

      try {
        setLoadingImage(true);
        const userDoc = await firestore()
          .collection("users")
          .doc(user.uid)
          .get();

        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          // Fetch profile image
          const profilePicUrl =
            userData?.profile_pic ||
            userData?.profilePic ||
            userData?.profile_picture;
          setProfileImageUrl(profilePicUrl || null);
          
          // Fetch student name - ADDED: Get name from Firestore
          const firstName = userData?.first_name || userData?.fname || "";
          const middleName = userData?.middle_name || userData?.mname || "";
          const lastName = userData?.last_name || userData?.lname || "";
          
          // Construct full name
          const fullName = `${firstName} ${middleName} ${lastName}`.trim();
          setStudentName(fullName || "Student Name");
          
          // Fetch learner's section
          await fetchLearnerSection(user.uid);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoadingImage(false);
      }
    };

    fetchUserData();
  }, [user]);

  useEffect(() => {
    const lockOrientation = async () => {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE
      );
    };
    lockOrientation();
  }, []);

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

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setPasswords({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleSave = async () => {
    const { oldPassword, newPassword, confirmPassword } = passwords;

    if (!oldPassword || !newPassword || !confirmPassword) {
      showNotification("Please fill in all fields", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showNotification("New passwords do not match", "error");
      return;
    }

    if (newPassword === oldPassword) {
      showNotification("New password cannot be the same as old password", "error");
      return;
    }

    if (newPassword.length < 6) {
      showNotification("Password must be at least 6 characters long", "error");
      return;
    }

    try {
      // ✅ Get current user from React Native Firebase
      const currentUser = auth().currentUser;

      if (!currentUser || !currentUser.email) {
        showNotification("No user is logged in", "error");
        return;
      }

      // ✅ Create credential for re-authentication
      const credential = auth.EmailAuthProvider.credential(
        currentUser.email,
        oldPassword
      );

      // ✅ Re-authenticate with old password
      await currentUser.reauthenticateWithCredential(credential);

      // ✅ Update password in Firebase Auth
      await currentUser.updatePassword(newPassword);

      // ✅ Update in Zustand store (optional)
      updatePassword(newPassword);

      showNotification("Password changed successfully!", "success");
      setIsEditing(false);
      setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      // ✅ Handle React Native Firebase error codes
      if (
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential"
      ) {
        showNotification("Incorrect old password", "error");
      } else if (error.code === "auth/weak-password") {
        showNotification("Password is too weak", "error");
      } else if (error.code === "auth/requires-recent-login") {
        showNotification("Please log out and log back in, then try again", "error");
      } else {
        showNotification(error.message || "Failed to update password", "error");
      }
    }
  };

  if (!fontsLoaded) {
    return null;
  }

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

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push("/screens/learner")}>
            <Image
              source={require("@/assets/images/arrow-left.png")}
              style={styles.image}
            />
          </TouchableOpacity>
        </View>

        {/* UPDATED: PROFILE HEADER - Same design as Profile Screen */}
        <View style={styles.layer1}>
          <View style={styles.ProfileContainer}>
            <View style={styles.ProfileImageContainer}>
              {loadingImage ? (
                <View style={styles.ProfileImageLoading}>
                  <ActivityIndicator size="small" color="#9B72CF" />
                </View>
              ) : (
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
              )}
            </View>

            <View style={styles.ProfileTextContainer}>
              {/* UPDATED: Use studentName from Firestore instead of displayName */}
              <Text style={styles.LayerTitle}>
                {studentName}
              </Text>
              <Text style={styles.ProfileText}>
                {user?.email || "No email available"}
              </Text>
              <Text style={styles.ProfileSubText}>
                Section: {sectionName}
              </Text>
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

        {/* UPDATED: CONTENT AREA - Same layout as Profile Screen */}
        <View style={styles.contentArea}>
          <View style={styles.pageContent}>
            <Text style={styles.pageTitle}>Change Password</Text>

            <View style={styles.ParentInformationContainer}>
              <View style={styles.ParentInformation}>
                <Text style={[
                  styles.InputTitle,
                  isEditing && styles.InputTitleEditing,
                ]}>
                  Old Password
                </Text>
                <TextInput
                  style={[
                    styles.InputData,
                    isEditing && styles.InputDataEditing,
                  ]}
                  secureTextEntry={true}
                  editable={isEditing}
                  value={passwords.oldPassword}
                  onChangeText={(text) =>
                    setPasswords((prev) => ({ ...prev, oldPassword: text }))
                  }
                  placeholder="Enter old password"
                  placeholderTextColor="rgba(67, 67, 67, 0.7)"
                />
              </View>

              <View style={styles.ParentInformation}>
                <Text style={[
                  styles.InputTitle,
                  isEditing && styles.InputTitleEditing,
                ]}>
                  New Password
                </Text>
                <TextInput
                  style={[
                    styles.InputData,
                    isEditing && styles.InputDataEditing,
                  ]}
                  secureTextEntry={true}
                  editable={isEditing}
                  value={passwords.newPassword}
                  onChangeText={(text) =>
                    setPasswords((prev) => ({ ...prev, newPassword: text }))
                  }
                  placeholder="Enter new password"
                  placeholderTextColor="rgba(67, 67, 67, 0.7)"
                />
              </View>

              <View style={styles.ParentInformation}>
                <Text style={[
                  styles.InputTitle,
                  isEditing && styles.InputTitleEditing,
                ]}>
                  Confirm New Password
                </Text>
                <TextInput
                  style={[
                    styles.InputData,
                    isEditing && styles.InputDataEditing,
                  ]}
                  secureTextEntry={true}
                  editable={isEditing}
                  value={passwords.confirmPassword}
                  onChangeText={(text) =>
                    setPasswords((prev) => ({ ...prev, confirmPassword: text }))
                  }
                  placeholder="Confirm new password"
                  placeholderTextColor="rgba(67, 67, 67, 0.7)"
                />
              </View>
            </View>
          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <View style={styles.categoryContainer}>
            <TouchableOpacity
              style={styles.categoryInfos}
              onPress={() => router.push("/screens/learner/profile")}
            >
              <Image
                source={require("@/assets/images/user2.png")}
                style={styles.CategoryImage}
              />
              <Text style={styles.categoryText}>Account Information</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.categoryInfosActive}
              onPress={() => router.push("/screens/learner/changepass")}
            >
              <Image
                source={require("@/assets/images/lock.png")}
                style={styles.CategoryImage}
              />
              <Text style={styles.categoryText}>Change Password</Text>
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
  pageContent: {
    flex: 1,
    width: width * 0.9,
    alignSelf: 'center',
    marginHorizontal: 'auto',
  },
  pageTitle: {
    fontFamily: "Poppins",
    fontSize: RFValue(12),
    color: "#434343",
    fontWeight: "600",
    letterSpacing: 0.5,
    textAlign: "center",
    marginBottom: height * 0.03,
  },
  // Notification styles
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
  header: {
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.02,
    backgroundColor: "#E5E5E5",
    justifyContent: "center",
    alignItems: "flex-start",
    position: "relative",
  },
  // UPDATED: PROFILE HEADER - Same as Profile Screen
  layer1: {
    width: width * 0.9,
    borderBottomWidth: 1,
    borderColor: "rgba(67, 67, 67, 0.5)",
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.03,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: '#fafafa',
    alignSelf: 'center',
    marginHorizontal: 'auto',
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
    width: width * 0.10,
    height: width * 0.10,
    borderRadius: (width * 0.10) / 2,
    resizeMode: "cover",
    marginRight: width * 0.03,
  },
  ProfileImageLoading: {
    width: width * 0.10,
    height: width * 0.10,
    borderRadius: (width * 0.10) / 2,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
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
  LayerTitle: {
    fontFamily: "Poppins",
    fontSize: RFValue(11),
    color: "#434343",
    fontWeight: "500",
    letterSpacing: 0.5,
    textAlign: "left",
    marginBottom: height * 0.005,
  },
  // INFORMATION CONTAINERS
  ParentInformationContainer: {
    flexDirection: "row",
    gap: width * 0.04,
  },
  ParentInformation: {
    flex: 1,
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
  SaveBtn: {
    backgroundColor: "#9B72CF",
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.04,
    borderRadius: width * 0.01,
  },
  BtnText: {
    fontFamily: "Poppins",
    fontSize: RFValue(9),
    color: "#fafafa",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  cancelBtnText: {
    fontFamily: "Poppins",
    fontSize: RFValue(9),
    color: "#9B72CF",
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  // FOOTER STYLES
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
    height: height * 0.10,
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