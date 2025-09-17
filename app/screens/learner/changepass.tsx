import { ThemedView } from "@/components/ThemedView";
import { useFonts } from "expo-font";
import { router, usePathname } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { useEffect, useState } from "react";
import {
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

export default function ChangePassScreen() {
  const [fontsLoaded] = useFonts({
    Poppins: require("@/assets/fonts/Poppins-Regular.ttf"),
  });

  const path = usePathname();

  console.log(path);

  // Get user and updatePassword from auth store
  // const { user, updatePassword } = useAuthStore();

  const [isEditing, setIsEditing] = useState(false);
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Notification state
  const [notification, setNotification] = useState({
    message: "",
    type: "error", // "success" | "error"
  });
  const [showNotification, setShowNotification] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  const { width } = Dimensions.get("window");
  const isTablet = width > 968;

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

  const handleSave = () => {
    const { oldPassword, newPassword, confirmPassword } = passwords;

    // First check if all fields are filled
    if (!oldPassword || !newPassword || !confirmPassword) {
      showPopup("Please fill in all fields", "error");
      return;
    }

    // Get current password from auth store (fallback to default if not set)
    // const currentPassword = user?.password || "123456";

    // // Check if old password is correct
    // if (oldPassword !== currentPassword) {
    //   showPopup("Incorrect old password", "error");
    //   return;
    // }

    // // Check if new passwords match
    // if (newPassword !== confirmPassword) {
    //   showPopup("New passwords do not match", "error");
    //   return;
    // }

    // // Check if new password is different from old password
    // if (newPassword === oldPassword) {
    //   showPopup("New password cannot be same as old password", "error");
    //   return;
    // }

    // Validate password strength (optional)
    if (newPassword.length < 6) {
      showPopup("Password must be at least 6 characters long", "error");
      return;
    }

    // Update password in auth store
    // updatePassword(newPassword);

    // ✅ Success
    showPopup("Password changed successfully!", "success");
    setIsEditing(false);
    setPasswords({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
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
              <Image
                source={require("@/assets/images/stock.jpg")}
                style={styles.ProfileImage}
              />
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
              onPress={() => router.push("../screens/learner/changepass")}
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
    paddingVertical: hp(1),
    paddingHorizontal: wp(4),
    borderRadius: wp(2),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 8,
  },
  notificationText: {
    color: "#fafafa",
    fontFamily: "Poppins",
    fontSize: wp(2.2),
    fontWeight: "500",
  },

  // HEADER STYLES
  header: {
    paddingHorizontal: wp(8),
    paddingVertical: hp(0.5),
    backgroundColor: "#E5E5E5",
    height: hp(4),
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
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
    width: wp(160),
    borderBottomWidth: 1,
    borderColor: "rgba(67, 67, 67, 0.5)",
    paddingHorizontal: wp(1),
    paddingVertical: wp(1),
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  ProfileContainer: {
    display: "flex",
    flexDirection: "row",
    marginTop: hp(1),
  },
  ProfileImage: {
    width: wp(15),
    height: wp(15),
    borderRadius: wp(9),
    resizeMode: "cover",
    marginRight: wp(1),
  },
  // LAYER 2
  layer2: {
    width: wp(160),
    paddingHorizontal: wp(1),
    paddingVertical: wp(1),
  },
  LayerTitle: {
    fontFamily: "Poppins",
    fontSize: wp(2.4),
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
    paddingVertical: hp(1),
    paddingHorizontal: wp(8),
    borderRadius: wp(1),
    marginTop: hp(1),
  },
  ButtonContainer: {
    flexDirection: "row",
    gap: wp(2),
    marginTop: hp(0.5),
  },
  CancelBtn: {
    borderColor: "#9B72CF",
    borderWidth: 1,
    paddingVertical: hp(1),
    paddingHorizontal: wp(4),
    borderRadius: wp(1),
  },
  SaveBtn: {
    backgroundColor: "#9B72CF",
    paddingVertical: hp(1),
    paddingHorizontal: wp(4),
    borderRadius: wp(1),
  },
  BtnText: {
    fontFamily: "Poppins",
    fontSize: wp(2.2),
    color: "#fafafa",
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  cancelBtnText: {
    fontFamily: "Poppins",
    fontSize: wp(2.2),
    color: "#9B72CF",
    fontWeight: "500",
    letterSpacing: 0.5,
  },

  // FOOTER STYLES
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
