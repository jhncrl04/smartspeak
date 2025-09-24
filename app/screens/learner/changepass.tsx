import { ThemedView } from "@/components/ThemedView";
import { useAuthStore } from "@/stores/userAuthStore"; // Import your auth store
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

  // Profile image state
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(true);

  // Notification state
  const [notification, setNotification] = useState({
    message: "",
    type: "error", // "success" | "error"
  });
  const [showNotification, setShowNotification] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  const { width } = Dimensions.get("window");
  const isTablet = width > 968;

  // Fetch profile image from Firebase
  useEffect(() => {
    const fetchProfileImage = async () => {
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
          const profilePicUrl =
            userData?.profile_pic ||
            userData?.profilePic ||
            userData?.profile_picture;
          setProfileImageUrl(profilePicUrl || null);
        }
      } catch (error) {
        console.error("Error fetching profile image:", error);
      } finally {
        setLoadingImage(false);
      }
    };

    fetchProfileImage();
  }, [user]);

  useEffect(() => {
    const lockOrientation = async () => {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE
      );
    };
    lockOrientation();
  }, []);

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

  const showPopup = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setShowNotification(true);

    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Auto hide after 3s
    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowNotification(false));
    }, 3000);
  };

  const handleSave = async () => {
    const { oldPassword, newPassword, confirmPassword } = passwords;

    if (!oldPassword || !newPassword || !confirmPassword) {
      showPopup("Please fill in all fields", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showPopup("New passwords do not match", "error");
      return;
    }

    if (newPassword === oldPassword) {
      showPopup("New password cannot be the same as old password", "error");
      return;
    }

    if (newPassword.length < 6) {
      showPopup("Password must be at least 6 characters long", "error");
      return;
    }

    try {
      // ✅ Get current user from React Native Firebase
      const currentUser = auth().currentUser;

      if (!currentUser || !currentUser.email) {
        showPopup("No user is logged in", "error");
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

      showPopup("Password changed successfully!", "success");
      setIsEditing(false);
      setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      // ✅ Handle React Native Firebase error codes
      if (
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential"
      ) {
        showPopup("Incorrect old password", "error");
      } else if (error.code === "auth/weak-password") {
        showPopup("Password is too weak", "error");
      } else if (error.code === "auth/requires-recent-login") {
        showPopup("Please log out and log back in, then try again", "error");
      } else {
        showPopup(error.message || "Failed to update password", "error");
      }
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView>
      <ThemedView style={styles.container}>
        {/* 🔔 Notification Popup */}
        {showNotification && (
          <Animated.View
            style={[styles.notificationContainer, { opacity: fadeAnim }]}
          >
            <View
              style={[
                styles.notificationBox,
                {
                  backgroundColor:
                    notification.type === "success" ? "#4CAF50" : "#FF6B6B",
                },
              ]}
            >
              <Text style={styles.notificationText}>
                {notification.message}
              </Text>
            </View>
          </Animated.View>
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
        <View style={[styles.body, isTablet ? styles.body : styles.bodyMobile]}>
          <View style={styles.layer1}>
            <View style={styles.ProfileContainer}>
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
          </View>

          <View style={styles.layer2}>
            <Text style={styles.LayerTitle}>Change Password</Text>

            <View style={styles.ParentInformationContainer}>
              <View style={styles.ParentInformation}>
                <Text style={styles.InputTitle}>Old Password</Text>
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
                <Text style={styles.InputTitle}>New Password</Text>
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
                <Text style={styles.InputTitle}>Confirm New Password</Text>
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

  // 🔔 Notification styles
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


  // BODY STYLES
  body: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  bodyMobile: {
    marginBottom: hp(2),
  },

  // LAYER 1
 layer1: {
    width: width * 0.8,
    borderBottomWidth: 1,
    borderColor: "rgba(67, 67, 67, 0.5)",
    paddingHorizontal: width * 0.01,
    paddingVertical: height * 0.02,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  ProfileContainer: {
    display: "flex",
    flexDirection: "row",
  },
  ProfileImage: {
    width: width * 0.08,
    height: height * 0.15,
    borderRadius: width * 0.01,
    resizeMode: "cover",
    marginRight: width * 0.01,
  },
  ProfileImageLoading: {
    width: width * 0.08,
    height: height * 0.15,
    borderRadius: width * 0.01,
    backgroundColor: "#f0f0f0",
    marginRight: wp(1),
    justifyContent: "center",
    alignItems: "center",
  },
  // LAYER 2
  layer2: {
    width: width * 0.8,
    paddingHorizontal: width * 0.01,
    paddingVertical: height * 0.02,
  },
  LayerTitle: {
    fontFamily: "Poppins",
    fontSize: RFValue(8),
    color: "#434343",
    fontWeight: "500",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  ParentInformationContainer: {},
  ParentInformation: {
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
    justifyContent: "center",
    alignSelf: "center",
    width: wp(60),
    backgroundColor: "#fafafa",
  },
  InputDataEditing: {
    color: "#434343",
    opacity: 1,
    borderColor: "#434343",
    backgroundColor: "#fafafa",
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
  SaveBtn: {
    backgroundColor: "#9B72CF",
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.04,
    borderRadius: width * 0.01,
  },
  BtnText: {
    fontFamily: "Poppins",
    fontSize: RFValue(6),
    color: "#fafafa",
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  cancelBtnText: {
    fontFamily: "Poppins",
    fontSize: RFValue(6),
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
    fontSize: RFValue(8),
    fontWeight: "500",
    color: "#9B72CF",
    fontFamily: "Poppins",
    textAlign: "left",
    justifyContent: "center",
    marginTop: 0,
  },
});
